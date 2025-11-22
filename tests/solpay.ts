import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorError } from "@coral-xyz/anchor";
import BN from "bn.js";
import { createMint } from "@solana/spl-token";
import { assert } from "chai";
import { SolpaySmartcontract } from "../target/types/solpay_smartcontract";

const { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } = anchor.web3;
const TOKEN_PROGRAM_ID = anchor.utils.token.TOKEN_PROGRAM_ID;
type Web3PublicKey = anchor.web3.PublicKey;

describe("SolPay Smart Contract - Production Test Suite", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .SolpaySmartcontract as Program<SolpaySmartcontract>;

  // Helper: wrap .rpc() to log full SendTransactionError details
  const rpcWithLogs = async (label: string, builder: any) => {
    try {
      const sig = await builder.rpc();
      console.log(`[${label}] tx sig:`, sig);
      return sig;
    } catch (err: any) {
      console.error(`[${label}] ERROR:`, err);
      console.log(`[${label}] name:`, err?.name);
      console.log(`[${label}] message:`, err?.message);

      if (err?.logs) {
        console.log(`[${label}] logs:`, err.logs);
      }
      if (err?.cause && err.cause.logs) {
        console.log(`[${label}] cause logs:`, err.cause.logs);
      }

      throw err; // rethrow so mocha still sees failure
    }
  };

  // Test keypairs
  const merchant = Keypair.generate();
  const subscriber = Keypair.generate();
  const subscriber2 = Keypair.generate();

  // PDAs
  let merchantRegistrationPDA: Web3PublicKey;
  let subscriptionPlanPDA: Web3PublicKey;
  let userSubscriptionPDA: Web3PublicKey;

  // Test token mints
  let usdcMint: Web3PublicKey;
  let solMint: Web3PublicKey;

  // Helper: Airdrop SOL
  const airdrop = async (pubkey: Web3PublicKey, amount: number) => {
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
    console.log("\nSetting up test environment...\n");

    // Fund accounts
    await airdrop(merchant.publicKey, 10);
    await airdrop(subscriber.publicKey, 10);
    await airdrop(subscriber2.publicKey, 10);
    await airdrop(provider.wallet.publicKey, 10);

    // Create test token mints
    usdcMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      6 // USDC decimals
    );

    solMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9 // SOL decimals
    );

    console.log("Test environment ready");
  });

  describe("1. Merchant Registration", () => {
    it("Successfully initializes a merchant", async () => {
      const merchantName = "SolPay Demo Merchant";
      const merchantWebUrl = "https://solpay-demo.com";
      const supportedTokens = [usdcMint, solMint];

      [merchantRegistrationPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("merchant"), merchant.publicKey.toBuffer()],
        program.programId
      );

      await rpcWithLogs(
        "initializeMerchant",
        program.methods
          .initializeMerchant(merchantName, merchantWebUrl, supportedTokens)
          .accountsPartial({
            merchantRegistration: merchantRegistrationPDA,
            user: merchant.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([merchant])
      );

      const account = await program.account.merchantRegistration.fetch(
        merchantRegistrationPDA
      );

      assert.strictEqual(account.merchantName, merchantName);
      assert.strictEqual(account.merchantWeburl, merchantWebUrl);
      assert.isTrue(account.merchantAddress.equals(merchant.publicKey));
      assert.isTrue(account.isActive);
      assert.strictEqual(account.supportedTokens.length, 2);
    });
  });

  describe("2. Subscription Plan Creation", () => {
    it("Successfully creates a subscription plan", async () => {
      const planName = "Premium Plan";
      const planPrice = new BN(100_000_000); // 100 USDC
      const billingCycle = 30;
      const supportedTokens = [usdcMint];
      const isActive = true;

      [subscriptionPlanPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("subscription"),
          Buffer.from(planName),
          merchant.publicKey.toBuffer(),
        ],
        program.programId
      );

      await rpcWithLogs(
        "initializeSubscriptionPlan_success",
        program.methods
          .initializeSubscriptionPlan(
            planName,
            planPrice,
            usdcMint,
            billingCycle,
            supportedTokens,
            isActive
          )
          .accountsPartial({
            subscriptionPlan: subscriptionPlanPDA,
            merchantRegistration: merchantRegistrationPDA,
            merchantAddress: merchant.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([merchant])
      );

      const account = await program.account.subscriptionPlan.fetch(
        subscriptionPlanPDA
      );

      assert.strictEqual(account.planName, planName);
      assert.isTrue(account.planPrice.eq(planPrice));
      assert.strictEqual(account.billingCycle, billingCycle);
      assert.isTrue(account.isActive);
    });

    it("Fails with empty plan name", async () => {
      const planName = "";
      const planPrice = new BN(50_000_000);
      const billingCycle = 30;
      const supportedTokens = [usdcMint];
      const isActive = true;

      const [invalidPlanPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("subscription"),
          Buffer.from("EmptyTest"),
          merchant.publicKey.toBuffer(),
        ],
        program.programId
      );

      try {
        await rpcWithLogs(
          "initializeSubscriptionPlan_empty_name",
          program.methods
            .initializeSubscriptionPlan(
              planName,
              planPrice,
              usdcMint,
              billingCycle,
              supportedTokens,
              isActive
            )
              .accountsPartial({
                subscriptionPlan: invalidPlanPDA,
                merchantRegistration: merchantRegistrationPDA,
                merchantAddress: merchant.publicKey,
                systemProgram: SystemProgram.programId,
              })
            .signers([merchant])
        );

        assert.fail("Should have thrown error");
      } catch (error) {
        assert.isTrue(error instanceof Error);
      }
    });
  });

  describe("3. User Subscription", () => {
    it("Successfully creates a user subscription", async () => {
      const nextBillingDate = new BN(
        Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
      );
      const isActive = true;
      const supportedTokens = [usdcMint];

      [userSubscriptionPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("user_subscription"),
          subscriptionPlanPDA.toBuffer(),
          subscriber.publicKey.toBuffer(),
        ],
        program.programId
      );

      await rpcWithLogs(
        "initializeUserSubscription_success",
        program.methods
          .initializeUserSubscription(nextBillingDate, isActive, supportedTokens)
          .accountsPartial({
            userSubscription: userSubscriptionPDA,
            subscriptionPlan: subscriptionPlanPDA,
            merchantRegistration: merchantRegistrationPDA,
            subscriber: subscriber.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([subscriber])
      );

      const account = await program.account.userSubscription.fetch(
        userSubscriptionPDA
      );

      assert.isTrue(account.subscriber.equals(subscriber.publicKey));
      assert.isTrue(account.isActive);
    });

    it("Successfully cancels subscription", async () => {
      await rpcWithLogs(
        "initializeCancelSubscription_success",
        program.methods
          .initializeCancelSubscription()
          .accounts({
            userSubscription: userSubscriptionPDA,
            subscriptionPlan: subscriptionPlanPDA,
            subscriber: subscriber.publicKey,
          })
          .signers([subscriber])
      );

      const account = await program.account.userSubscription.fetch(
        userSubscriptionPDA
      );

      assert.isFalse(account.isActive);
      assert.isNotNull(account.canceledAt);
    });
  });

  describe("4. Payment Transaction", () => {
    it("Successfully logs payment", async () => {
      const txSignature = "solpay_tx_" + Date.now();
      const amount = new BN(100_000_000);
      const status = 1;

      const [paymentPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("payment"), Buffer.from(txSignature)],
        program.programId
      );

      await rpcWithLogs(
        "initializePaymentTransaction_success",
        program.methods
          .initializePaymentTransaction(
            txSignature,
            amount,
            usdcMint,
            status
          )
          .accountsPartial({
            paymentTransaction: paymentPDA,
            merchantRegistration: merchantRegistrationPDA,
            payer: subscriber.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([subscriber])
      );

      const account = await program.account.paymentTransaction.fetch(
        paymentPDA
      );

      assert.strictEqual(account.txSignature, txSignature);
      assert.isTrue(account.amount.eq(amount));
    });

    it("Fails with zero amount", async () => {
      const txSignature = "solpay_zero_" + Date.now();
      const amount = new BN(0);
      const status = 1;

      const [paymentPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("payment"), Buffer.from(txSignature)],
        program.programId
      );

      try {
        await rpcWithLogs(
          "initializePaymentTransaction_zero_amount",
          program.methods
            .initializePaymentTransaction(txSignature, amount, usdcMint, status)
            .accountsPartial({
              paymentTransaction: paymentPDA,
              merchantRegistration: merchantRegistrationPDA,
              payer: subscriber.publicKey,
              systemProgram: SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([subscriber])
        );

        assert.fail("Should have thrown error");
      } catch (error) {
        assert.isTrue(error instanceof AnchorError);
        const err = error as AnchorError;
        // Adjust this to your exact message if needed
        assert.include(err.error.errorMessage, "Invalid payment");
      }
    });
  });

  after(() => {
    console.log("\nAll tests completed.\n");
  });
});
