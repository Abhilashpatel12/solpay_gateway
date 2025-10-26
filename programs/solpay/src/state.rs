use anchor_lang::prelude::*;


#[account]
pub struct MerchantRegistration {
    pub merchant_name : String,
    pub merchant_address : Pubkey,
    pub is_active : bool,
    pub created_at : i64,
    pub merchant_weburl : String,
    pub supported_tokens : Vec<Pubkey>,
}

impl MerchantRegistration {
    pub const MAX_NAME_LENGTH: usize = 256;
    pub const MAX_WEBURL_LENGTH: usize = 256;
    pub const MAX_SUPPORTED_TOKENS: usize = 10;
    pub const LEN: usize = 8 + // discriminator
        4 + Self::MAX_NAME_LENGTH + // merchant_name
        32 + // merchant_address
        1 + // is_active
        8 + // created_at
        4 + Self::MAX_WEBURL_LENGTH + // merchant_weburl
        4 + (32 * Self::MAX_SUPPORTED_TOKENS); // supported_tokens
}


#[account]
pub struct PaymentTransaction {
    pub tx_signature : String,
    pub payer_address :Pubkey,
    pub merchant_address :Pubkey,
    pub amount : u64,
    pub token_mint : Pubkey,
    pub status : u8,
    pub created_at : i64,
}

impl PaymentTransaction {
    pub const MAX_SIGNATURE_LENGTH: usize = 404;
    pub const LEN: usize = 8 + // discriminator
        4 + Self::MAX_SIGNATURE_LENGTH + // tx_signature
        32 + // payer_address
        32 + // merchant_address
        8 + // amount
        32 + // token_mint
        1 + // status
        8; // created_at
}
#[account]
pub struct SubscriptionPlan {
    pub plan_name : String,
    pub plan_price :u64,
    pub token_mint: Pubkey,
    pub billing_cycle :u8,
    pub is_active :bool,
    pub created_at :i64,
    pub merchant_address :Pubkey,
    pub supported_tokens : Vec<Pubkey>,
}

impl SubscriptionPlan {
    pub const MAX_PLAN_NAME_LENGTH: usize = 260;
    pub const MAX_SUPPORTED_TOKENS: usize = 10;
    pub const LEN: usize = 8 + // discriminator
        4 + Self::MAX_PLAN_NAME_LENGTH + // plan_name
        8 + // plan_price
        32 + // token_mint
        1 + // billing_cycle
        1 + // is_active
        8 + // created_at
        32 + // merchant_address
        4 + (32 * Self::MAX_SUPPORTED_TOKENS); // supported_tokens
}


#[account]
pub struct UserSubscription {
    pub subscriber :Pubkey,
    pub subscription_plan :Pubkey,
    pub start_date :i64,
    pub next_billing_date :i64,
    pub is_active :bool,
    pub merchant_address :Pubkey,
    pub supported_tokens : Vec<Pubkey>,
    pub canceled_at: Option<i64>
}

impl UserSubscription {
    pub const MAX_SUPPORTED_TOKENS: usize = 10;
    pub const LEN: usize = 8 + // discriminator
        32 + // subscriber
        32 + // subscription_plan
        8 + // start_date
        8 + // next_billing_date
        1 + // is_active
        32 + // merchant_address
        4 + (32 * Self::MAX_SUPPORTED_TOKENS) + // supported_tokens
        9; // canceled_at (1 byte for Some/None + 8 bytes for i64)
}
