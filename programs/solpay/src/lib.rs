use anchor_lang::prelude::*;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("EVBgMcsQdMqHrm2KMscsPUKUsFAcbpJUkAjBSWHGwL8A");

#[program]
pub mod solpay_smartcontract {
    use super::*;

    pub fn initialize_merchant(
        ctx: Context<InitializeMerchant>,
        merchant_name: String,
        merchant_weburl: String,
        supported_tokens: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::initialize_merchant(ctx, merchant_name, merchant_weburl, supported_tokens)
    }

    pub fn initialize_payment_transaction(
        ctx: Context<InitializePaymentTransaction>,
        tx_signature: String,
        amount: u64,
        token_mint: Pubkey,
        status: u8,
    ) -> Result<()> {
        instructions::initialize_payment_transaction(ctx, tx_signature, amount, token_mint, status)
    }

    pub fn initialize_subscription_plan(
        ctx: Context<InitializeSubscriptionPlan>,
        plan_name: String,
        plan_price: u64,
        token_mint: Pubkey,
        billing_cycle: u8,
        supported_tokens: Vec<Pubkey>,
        is_active: bool,
    ) -> Result<()> {
        instructions::initialize_subscription_plan(
            ctx,
            plan_name,
            plan_price,
            token_mint,
            billing_cycle,
            supported_tokens,
            is_active,
        )
    }

    pub fn initialize_user_subscription(
        ctx: Context<InitializeUserSubscription>,
        next_billing_date: i64,
        is_active: bool,
        supported_tokens: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::initialize_user_subscription(ctx, next_billing_date, is_active, supported_tokens)
    }

    pub fn initialize_cancel_subscription(
        ctx: Context<InitializeCancelSubscription>,
    ) -> Result<()> {
        instructions::initialize_cancel_subscription(ctx)
    }
}













