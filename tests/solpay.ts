import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
} from "@solana/spl-token";
import { assert } from "chai";
import { SolpaySmartcontract } from "../target/types/solpay_smartcontract";

describe("solpay_smartcontract", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolpaySmartcontract as Program<SolpaySmartcontract>;
  
  // Test keypairs
  const merchant = Keypair.generate();
  const subscriber = Keypair.generate();

  // PDAs (will be calculated in each test)
  let merchantRegistrationPDA: PublicKey;
  let subscriptionPlanPDA: PublicKey;
  let userSubscriptionPDA: PublicKey;
  
  // Test token mint
  let tokenMint: PublicKey;

  // Helper to airdrop SOL
  const airdrop = async (pubkey: PublicKey, amount: number) => {
    const sig = await provider.connection.requestAirdrop(
      pubkey,
      amount * LAMPORTS_PER_SOL
    );
    const latestBlockhash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature: sig,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
  };

  before(async () => {
    // Fund test accounts
    await airdrop(merchant.publicKey, 10);
    await airdrop(subscriber.publicKey, 10);
    await airdrop(provider.wallet.publicKey, 10);

    // Create test token mint
    tokenMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      6
    );
  });

  it("Initializes a merchant", async () => {
    const merchantName = "Test Merchant";
    const merchantWebUrl = "https://solpay.com";
    const supportedTokens = [tokenMint];

    // Derive PDA for merchant registration
    [merchantRegistrationPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("merchant"), merchant.publicKey.toBuffer()],
      program.programId
    );

    // Initialize merchant
    await program.methods
      .initializeMerchant(merchantName, merchantWebUrl, supportedTokens)
      .accounts({
        merchantRegistration: merchantRegistrationPDA,
        user: merchant.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([merchant])
      .rpc();
    
    // Fetch and verify account
    const account = await program.account.merchantRegistration.fetch(merchantRegistrationPDA);
    
    assert.strictEqual(account.merchantName, merchantName);
    assert.strictEqual(account.merchantWeburl, merchantWebUrl);
    assert.isTrue(account.merchantAddress.equals(merchant.publicKey));
    assert.isTrue(account.isActive);
    assert.strictEqual(account.supportedTokens.length, 1);
    assert.isTrue(account.supportedTokens[0].equals(tokenMint));
  });

  it("Creates a subscription plan", async () => {
    const planName = "Gold Plan";
    const planPrice = new BN(100).mul(new BN(10).pow(new BN(6)));
    const billingCycle = 1;
    const supportedTokens = [tokenMint];
    const isActive = true;

    // Derive PDA for subscription plan
    [subscriptionPlanPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("subscription"),
        Buffer.from(planName),
        merchant.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Initialize subscription plan - FIXED: merchant_address must be a Signer
    await program.methods
      .initializeSubscriptionPlan(planName, planPrice, tokenMint, billingCycle, supportedTokens, isActive)
      .accounts({
        subscriptionPlan: subscriptionPlanPDA,
        merchantRegistration: merchantRegistrationPDA,
        merchantAddress: merchant.publicKey,  // This is the Signer (merchant)
        systemProgram: SystemProgram.programId,
      })
      .signers([merchant])  // ✅ CRITICAL: merchant MUST sign this transaction
      .rpc();

    // Fetch and verify account
    const account = await program.account.subscriptionPlan.fetch(subscriptionPlanPDA);
    
    assert.strictEqual(account.planName, planName);
    assert.isTrue(account.planPrice.eq(planPrice));
    assert.isTrue(account.tokenMint.equals(tokenMint));
    assert.strictEqual(account.billingCycle, billingCycle);
    assert.isTrue(account.isActive);
    assert.isTrue(account.merchantAddress.equals(merchant.publicKey));
  });

  it("Creates a user subscription", async () => {
    const nextBillingDate = new BN(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60);
    const isActive = true;
    const supportedTokens = [tokenMint];

    // Derive PDA for user subscription
    [userSubscriptionPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_subscription"),
        subscriptionPlanPDA.toBuffer(),
        subscriber.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Initialize user subscription
    await program.methods
      .initializeUserSubscription(nextBillingDate, isActive, supportedTokens)
      .accounts({
        userSubscription: userSubscriptionPDA,
        subscriptionPlan: subscriptionPlanPDA,
        merchantRegistration: merchantRegistrationPDA,
        subscriber: subscriber.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([subscriber])  // ✅ CRITICAL: subscriber MUST sign this transaction
      .rpc();

    // Fetch and verify account
    const account = await program.account.userSubscription.fetch(userSubscriptionPDA);
    
    assert.isTrue(account.subscriber.equals(subscriber.publicKey));
    assert.isTrue(account.subscriptionPlan.equals(subscriptionPlanPDA));
    assert.isTrue(account.isActive);
    assert.isTrue(account.nextBillingDate.eq(nextBillingDate));
    assert.isTrue(account.merchantAddress.equals(merchant.publicKey));
  });

  it("Logs a payment transaction", async () => {
    const txSignature = "test_tx_" + Math.random().toString(36).substring(2);
    const amount = new BN(50).mul(new BN(10).pow(new BN(6)));
    const status = 1;

    // Derive PDA for payment transaction
    const [paymentTransactionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("payment"), Buffer.from(txSignature)],
      program.programId
    );

    // Initialize payment transaction
    await program.methods
      .initializePaymentTransaction(txSignature, amount, tokenMint, status)
      .accounts({
        paymentTransaction: paymentTransactionPDA,
        merchantRegistration: merchantRegistrationPDA,
        payer: subscriber.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([subscriber])  // ✅ CRITICAL: payer MUST sign this transaction
      .rpc();

    // Fetch and verify account
    const account = await program.account.paymentTransaction.fetch(paymentTransactionPDA);
    
    assert.strictEqual(account.txSignature, txSignature);
    assert.isTrue(account.payerAddress.equals(subscriber.publicKey));
    assert.isTrue(account.merchantAddress.equals(merchant.publicKey));
    assert.isTrue(account.amount.eq(amount));
    assert.isTrue(account.tokenMint.equals(tokenMint));
    assert.strictEqual(account.status, status);
  });

  it("Cancels a user subscription", async () => {
    // Cancel user subscription
    await program.methods
      .initializeCancelSubscription()
      .accounts({
        userSubscription: userSubscriptionPDA,
        subscriptionPlan: subscriptionPlanPDA,
        subscriber: subscriber.publicKey,
      })
      .signers([subscriber])  // ✅ CRITICAL: subscriber MUST sign this transaction
      .rpc();

    // Fetch and verify account
    const account = await program.account.userSubscription.fetch(userSubscriptionPDA);
    
    assert.isFalse(account.isActive);
    assert.isNotNull(account.canceledAt);
    assert.isDefined(account.canceledAt);
  });
});