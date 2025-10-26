
use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use crate::state::{MerchantRegistration, PaymentTransaction, SubscriptionPlan, UserSubscription};
use crate::errors::{MerchantRegistrationErrors, PaymentTransactionErrors, SubscriptionPlanErrors};

// Merchant registration
pub fn initialize_merchant(
    ctx: Context<InitializeMerchant>,
    merchant_name: String,
    merchant_weburl: String,
    supported_tokens: Vec<Pubkey>,
) -> Result<()> {
    let merchant_registration = &mut ctx.accounts.merchant_registration;
    require!(!merchant_registration.is_active, MerchantRegistrationErrors::MerchantAlreadyRegistered);
    require!(!merchant_name.is_empty(), MerchantRegistrationErrors::InvalidMerchantDetails);
    require!(!merchant_weburl.is_empty(), MerchantRegistrationErrors::InvalidMerchantDetails);
    require!(!supported_tokens.is_empty(), MerchantRegistrationErrors::InvalidMerchantDetails);

    merchant_registration.merchant_name = merchant_name;
    merchant_registration.merchant_address = ctx.accounts.user.key();
    merchant_registration.is_active = true;
    merchant_registration.created_at = Clock::get()?.unix_timestamp;
    merchant_registration.merchant_weburl = merchant_weburl;
    merchant_registration.supported_tokens = supported_tokens;
    Ok(())
}

// Payment transaction
pub fn initialize_payment_transaction(
    ctx: Context<InitializePaymentTransaction>,
    tx_signature: String,
    amount: u64,
    token_mint: Pubkey,
    status: u8,
) -> Result<()> {
    let payment_transaction = &mut ctx.accounts.payment_transaction;
    require!(amount > 0, PaymentTransactionErrors::InvalidPaymentTransactionDetails);
    require!(status <= 2, PaymentTransactionErrors::InvalidPaymentTransactionDetails);
    require!(!tx_signature.is_empty(), PaymentTransactionErrors::InvalidPaymentTransactionDetails);
    require!(amount <= 1_000_000_000, PaymentTransactionErrors::PaymentTransactionLimitReached);
    require!(ctx.accounts.merchant_registration.is_active, MerchantRegistrationErrors::UnauthorizedMerchantAccess);
    require!(ctx.accounts.merchant_registration.supported_tokens.contains(&token_mint), PaymentTransactionErrors::InvalidPaymentTransactionDetails);

    payment_transaction.tx_signature = tx_signature;
    payment_transaction.payer_address = ctx.accounts.payer.key();
    payment_transaction.merchant_address = ctx.accounts.merchant_registration.merchant_address;
    payment_transaction.amount = amount;
    payment_transaction.token_mint = token_mint;
    payment_transaction.status = status;
    payment_transaction.created_at = Clock::get()?.unix_timestamp;
    Ok(())
}

// Subscription plan
pub fn initialize_subscription_plan(
    ctx: Context<InitializeSubscriptionPlan>,
    plan_name: String,
    plan_price: u64,
    token_mint: Pubkey,
    billing_cycle: u8,
    supported_tokens: Vec<Pubkey>,
    is_active: bool,
) -> Result<()> {
    let subscription_plan = &mut ctx.accounts.subscription_plan;
    require!(!plan_name.is_empty(), SubscriptionPlanErrors::InvalidSubscriptionPlanDetails);
    require!(plan_price > 0, SubscriptionPlanErrors::InvalidSubscriptionPlanDetails);
    require!(!supported_tokens.is_empty(), SubscriptionPlanErrors::UnsupportedTokenForSubscriptionPlan);
    require!(billing_cycle > 0, SubscriptionPlanErrors::InvalidBillingCycleSpecified);

    subscription_plan.plan_name = plan_name;
    subscription_plan.plan_price = plan_price;
    subscription_plan.token_mint = token_mint;
    subscription_plan.billing_cycle = billing_cycle;
    subscription_plan.is_active = is_active;
    subscription_plan.merchant_address = ctx.accounts.merchant_registration.merchant_address;
    subscription_plan.supported_tokens = supported_tokens;
    subscription_plan.created_at = Clock::get()?.unix_timestamp;
    Ok(())
}

// User subscription
pub fn initialize_user_subscription(
    ctx: Context<InitializeUserSubscription>,
    next_billing_date: i64,
    is_active: bool,
    supported_tokens: Vec<Pubkey>,
) -> Result<()> {
    let user_subscription = &mut ctx.accounts.user_subscription;
    let plan_owner = ctx.accounts.subscription_plan.merchant_address;
    require!(
        plan_owner == ctx.accounts.merchant_registration.merchant_address,
        MerchantRegistrationErrors::UnauthorizedMerchantAccess
    );
    require!(ctx.accounts.subscription_plan.is_active, SubscriptionPlanErrors::InactiveSubscriptionPlan);
    require!(!supported_tokens.is_empty(), SubscriptionPlanErrors::UnsupportedTokenForSubscriptionPlan);

    user_subscription.subscriber = ctx.accounts.subscriber.key();
    user_subscription.subscription_plan = ctx.accounts.subscription_plan.key();
    user_subscription.next_billing_date = next_billing_date;
    user_subscription.is_active = is_active;
    user_subscription.supported_tokens = supported_tokens;
    user_subscription.merchant_address = ctx.accounts.merchant_registration.merchant_address;
    user_subscription.start_date = Clock::get()?.unix_timestamp;
    user_subscription.canceled_at = None;
    Ok(())
}

// Cancel subscription
pub fn initialize_cancel_subscription(
    ctx: Context<InitializeCancelSubscription>,
) -> Result<()> {
    let user_subscription = &mut ctx.accounts.user_subscription;
    require!(
        user_subscription.subscriber == ctx.accounts.subscriber.key(),
        MerchantRegistrationErrors::UnauthorizedMerchantAccess
    );
    user_subscription.is_active = false;
    user_subscription.canceled_at = Some(Clock::get()?.unix_timestamp);
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeMerchant<'info> {
    #[account(init, payer = user, space = 8 + MerchantRegistration::LEN, seeds = [b"merchant", user.key().as_ref()], bump)]
    pub merchant_registration: Account<'info, MerchantRegistration>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(tx_signature: String)]
pub struct InitializePaymentTransaction<'info> {
    #[account(init, payer = payer, space = 8 + PaymentTransaction::LEN, seeds = [b"payment", tx_signature.as_bytes()], bump)]
    pub payment_transaction: Account<'info, PaymentTransaction>,
    pub merchant_registration: Account<'info, MerchantRegistration>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(plan_name: String)]
pub struct InitializeSubscriptionPlan<'info> {
    #[account(init, payer = merchant_address, space = 8 + SubscriptionPlan::LEN, seeds = [b"subscription", plan_name.as_bytes(), merchant_address.key().as_ref()], bump)]
    pub subscription_plan: Account<'info, SubscriptionPlan>,
    #[account(
        constraint = merchant_registration.merchant_address == merchant_address.key(),
        constraint = merchant_registration.is_active
    )]
    pub merchant_registration: Account<'info, MerchantRegistration>,
    #[account(mut)]
    pub merchant_address: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeUserSubscription<'info> {
    #[account(init, payer = subscriber, space = 8 + UserSubscription::LEN, seeds = [b"user_subscription", subscription_plan.key().as_ref(), subscriber.key().as_ref()], bump)]
    pub user_subscription: Account<'info, UserSubscription>,
    pub subscription_plan: Account<'info, SubscriptionPlan>,
    #[account(
        constraint = merchant_registration.merchant_address == subscription_plan.merchant_address
    )]
    pub merchant_registration: Account<'info, MerchantRegistration>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeCancelSubscription<'info> {
    #[account(mut)]
    pub user_subscription: Account<'info, UserSubscription>,
    pub subscription_plan: Account<'info, SubscriptionPlan>,
    #[account(mut)]
    pub subscriber: Signer<'info>,
}