use anchor_lang::prelude::*;

#[error_code]
pub enum MerchantRegistrationErrors {
    #[msg("Merchant is already registered.")]
    MerchantAlreadyRegistered,
    #[msg("Invalid merchant details provided.")]
    InvalidMerchantDetails,
    #[msg("Merchant registration limit reached.")]
    MerchantRegistrationLimitReached,
    #[msg("Unauthorized access to merchant data.")]
    UnauthorizedMerchantAccess,
    #[msg("Merchant not found.")]
    MerchantNotFound,
}

#[error_code]
pub enum PaymentTransactionErrors {
    #[msg("Payment transaction already exists.")]
    PaymentTransactionAlreadyExists,
    #[msg("Invalid payment transaction details provided.")]
    InvalidPaymentTransactionDetails,
    #[msg("Payment transaction limit reached.")]
    PaymentTransactionLimitReached,
    #[msg("Unauthorized access to payment transaction data.")]
    UnauthorizedPaymentTransactionAccess,
    #[msg("Payment transaction not found.")]
    PaymentTransactionNotFound,
    #[msg("Insufficient funds for the transaction.")]
    InsufficientFunds,
}

#[error_code]
pub enum SubscriptionPlanErrors {
    #[msg("Subscription plan already exists.")]
    SubscriptionPlanAlreadyExists,
    #[msg("Invalid subscription plan details provided.")]
    InvalidSubscriptionPlanDetails,
    #[msg("Subscription plan limit reached.")]
    SubscriptionPlanLimitReached,
    #[msg("Unauthorized access to subscription plan data.")]
    UnauthorizedSubscriptionPlanAccess,
    #[msg("Subscription plan not found.")]
    SubscriptionPlanNotFound,
    #[msg("Subscription plan is inactive.")]
    InactiveSubscriptionPlan,
    #[msg("unsupported token for subscription plan.")]
    UnsupportedTokenForSubscriptionPlan,
    #[msg("Invalid billing cycle specified.")]
    InvalidBillingCycleSpecified,
    #[msg("insufficient funds for subscription plan.")]
    InsufficientFundsForSubscriptionPlan,
}