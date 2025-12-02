import BN from 'bn.js'
import { SystemProgram, PublicKey } from '@solana/web3.js'
import { createHash } from 'crypto'
import { getProgram, type WalletLike } from '@/lib/solana/program'
import {
  getMerchantPda,
  getPaymentTransactionPda,
  getSubscriptionPlanPda,
  getUserSubscriptionPda,
} from '@/lib/solana/pdas'

type ProgramWithMethods = ReturnType<typeof getProgram>

export function prepareInitializeMerchant(wallet: WalletLike | undefined, args: {
  merchantName: string
  merchantWeburl: string
  supportedTokens: PublicKey[]
}) {
  if (!wallet?.publicKey) throw new Error('Wallet is not connected')

  const program: ProgramWithMethods = getProgram(wallet)
  const [merchantPda] = getMerchantPda(wallet.publicKey)

  const builder = program.methods
    .initialize_merchant(args.merchantName, args.merchantWeburl, args.supportedTokens)
    .accounts({
      merchant_registration: merchantPda,
      user: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })

  return { merchantPda, builder }
}

export function prepareInitializeSubscriptionPlan(wallet: WalletLike | undefined, args: {
  planName: string
  planPriceLamports: BN
  tokenMint: PublicKey
  billingCycle: number
  supportedTokens: PublicKey[]
  isActive: boolean
}) {
  if (!wallet?.publicKey) throw new Error('Wallet is not connected')

  const program: ProgramWithMethods = getProgram(wallet)
  const [planPda] = getSubscriptionPlanPda(args.planName, wallet.publicKey)
  const [merchantPda] = getMerchantPda(wallet.publicKey)

  const builder = program.methods
    .initialize_subscription_plan(
      args.planName,
      args.planPriceLamports,
      args.tokenMint,
      args.billingCycle,
      args.supportedTokens,
      args.isActive,
    )
    .accounts({
      subscription_plan: planPda,
      merchant_registration: merchantPda,
      merchant_address: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })

  return { planPda, builder }
}

export function prepareInitializeUserSubscription(wallet: WalletLike | undefined, args: {
  subscriptionPlan: PublicKey
  merchantRegistration: PublicKey
  nextBillingDate: BN
  isActive: boolean
  supportedTokens: PublicKey[]
}) {
  if (!wallet?.publicKey) throw new Error('Wallet is not connected')

  const program: ProgramWithMethods = getProgram(wallet)
  const [userSubscriptionPda] = getUserSubscriptionPda(args.subscriptionPlan, wallet.publicKey)

  const builder = program.methods
    .initialize_user_subscription(args.nextBillingDate, args.isActive, args.supportedTokens)
    .accounts({
      user_subscription: userSubscriptionPda,
      subscription_plan: args.subscriptionPlan,
      merchant_registration: args.merchantRegistration,
      subscriber: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })

  return { userSubscriptionPda, builder }
}

export function prepareCancelSubscription(wallet: WalletLike | undefined, args: {
  userSubscription: PublicKey
  subscriptionPlan: PublicKey
}) {
  if (!wallet?.publicKey) throw new Error('Wallet is not connected')

  const program: ProgramWithMethods = getProgram(wallet)
  const builder = program.methods.initialize_cancel_subscription().accounts({
    user_subscription: args.userSubscription,
    subscription_plan: args.subscriptionPlan,
    subscriber: wallet.publicKey,
  })

  return { builder }
}

export function prepareLogPayment(wallet: WalletLike | undefined, args: {
  txSignature: string
  amount: BN
  tokenMint: PublicKey
  status: number
  merchantRegistration: PublicKey
}) {
  if (!wallet?.publicKey) throw new Error('Wallet is not connected')

  const program: ProgramWithMethods = getProgram(wallet)
  const [paymentTransactionPda] = getPaymentTransactionPda(args.txSignature)
  // Hash the tx signature to a 32-byte array to match on-chain PDA derivation
  const sigHash = createHash('sha256').update(args.txSignature).digest()

  const builder = program.methods
    .initialize_payment_transaction(args.txSignature, Array.from(sigHash), args.amount, args.tokenMint, args.status)
    .accounts({
      payment_transaction: paymentTransactionPda,
      merchant_registration: args.merchantRegistration,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })

  return { paymentTransactionPda, builder }
}
