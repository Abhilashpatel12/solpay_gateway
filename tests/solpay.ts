import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import { Solpay } from "../target/types/solpay";

describe("solpay (SOL-only version)", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Solpay as Program<Solpay>;

  const user = provider.wallet.publicKey;
  let merchantRegistrationPda: PublicKey;
  let subscriptionPlanPda: PublicKey;
  let userSubPda: PublicKey;
  let paymentTxPda: PublicKey;

  // Deterministic seeds for testing
  const merchantSeed = Buffer.from("merchant");
  const subscriptionSeed = Buffer.from("subscription");
  const paymentSeed = Buffer.from("payment");
  const userSubSeed = Buffer.from("user_subscription");

  it("Airdrop SOL to wallet (if needed)", async () => {
    const balance = await provider.connection.getBalance(user);
    if (balance < 1 * LAMPORTS_PER_SOL) {
      const sig = await provider.connection.requestAirdrop(user, 2 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);
    }

    const updatedBalance = await provider.connection.getBalance(user);
    expect(updatedBalance).to.be.greaterThan(0);
  });

  it("Register merchant", async () => {
    const [merchantPda] = PublicKey.findProgramAddressSync(
      [merchantSeed, user.toBuffer()],
      program.programId
    );

    merchantRegistrationPda = merchantPda;

    await program.methods
      .initializeMerchant("Test Merchant", "https://test.com", [])
      .accounts({
        merchantRegistration: merchantPda,
        user,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const merchantData = await program.account.merchantRegistration.fetch(merchantPda);
    expect(merchantData.isActive).to.eq(true);
    expect(merchantData.merchantName).to.eq("Test Merchant");
  });

  it("Create subscription plan (SOL-based)", async () => {
    const planName = "Basic";
    const price = new anchor.BN(1); // 1 SOL billing price

    const [planPda] = PublicKey.findProgramAddressSync(
      [subscriptionSeed, Buffer.from(planName), user.toBuffer()],
      program.programId
    );

    subscriptionPlanPda = planPda;

    await program.methods
      .initializeSubscriptionPlan(planName, price, PublicKey.default, 30, [], true)
      .accounts({
        subscriptionPlan: planPda,
        merchantRegistration: merchantRegistrationPda,
        merchantAddress: user,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const planData = await program.account.subscriptionPlan.fetch(planPda);
    expect(planData.planPrice.toString()).to.eq(price.toString());
    expect(planData.tokenMint.toBase58()).to.eq(PublicKey.default.toBase58());
  });

  it("Record a SOL payment transaction", async () => {
    const fakeSig = "FAKE_TEST_SIGNATURE";
    const amount = new anchor.BN(1 * LAMPORTS_PER_SOL);

    const [payPda] = PublicKey.findProgramAddressSync(
      [paymentSeed, Buffer.from(fakeSig)],
      program.programId
    );

    paymentTxPda = payPda;

    await program.methods
      .initializePaymentTransaction(fakeSig, amount, PublicKey.default, 1)
      .accounts({
        paymentTransaction: payPda,
        merchantRegistration: merchantRegistrationPda,
        payer: user,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const txData = await program.account.paymentTransaction.fetch(payPda);
    expect(txData.amount.toString()).to.eq(amount.toString());
    expect(txData.tokenMint.toBase58()).to.eq(PublicKey.default.toBase58());
  });

  it("Activate user subscription", async () => {
    const [subPda] = PublicKey.findProgramAddressSync(
      [userSubSeed, subscriptionPlanPda.toBuffer(), user.toBuffer()],
      program.programId
    );

    userSubPda = subPda;

    await program.methods
      .initializeUserSubscription(Date.now(), true, [])
      .accounts({
        userSubscription: subPda,
        subscriptionPlan: subscriptionPlanPda,
        merchantRegistration: merchantRegistrationPda,
        subscriber: user,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const subData = await program.account.userSubscription.fetch(subPda);

    expect(subData.isActive).to.eq(true);
    expect(subData.subscriber.toBase58()).to.eq(user.toBase58());
  });

  it("Cancel subscription", async () => {
    await program.methods
      .initializeCancelSubscription()
      .accounts({
        userSubscription: userSubPda,
        subscriptionPlan: subscriptionPlanPda,
        subscriber: user,
      })
      .rpc();

    const subData = await program.account.userSubscription.fetch(userSubPda);
    expect(subData.isActive).to.eq(false);
    expect(subData.canceledAt).to.not.eq(null);
  });
});
