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

export function prepareInitializeMerchant(wallet: WalletLike | undefined, args: {
  merchantName: string
  merchantWeburl: string
  supportedTokens: PublicKey[]
}) {
  if (!wallet?.publicKey) throw new Error('Wallet is not connected')

  const program = getProgram(wallet)
  const [merchantPda] = getMerchantPda(wallet.publicKey)

  const builder = program.methods
    .initializeMerchant(args.merchantName, args.merchantWeburl, args.supportedTokens)
    .accounts({
      merchantRegistration: merchantPda,
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

  const program = getProgram(wallet)
  const [planPda] = getSubscriptionPlanPda(args.planName, wallet.publicKey)
  const [merchantPda] = getMerchantPda(wallet.publicKey)

  const builder = program.methods
    .initializeSubscriptionPlan(
      args.planName,
      args.planPriceLamports,
      args.tokenMint,
      args.billingCycle,
      args.supportedTokens,
      args.isActive,
    )
    .accounts({
      subscriptionPlan: planPda,
      merchantRegistration: merchantPda,
      merchantAddress: wallet.publicKey,
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

  const program = getProgram(wallet)
  const [userSubscriptionPda] = getUserSubscriptionPda(args.subscriptionPlan, wallet.publicKey)

  const builder = program.methods
    .initializeUserSubscription(args.nextBillingDate, args.isActive, args.supportedTokens)
    .accounts({
      userSubscription: userSubscriptionPda,
      subscriptionPlan: args.subscriptionPlan,
      merchantRegistration: args.merchantRegistration,
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

  const program = getProgram(wallet)
  const builder = program.methods.initializeCancelSubscription().accounts({
    userSubscription: args.userSubscription,
    subscriptionPlan: args.subscriptionPlan,
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

  const program = getProgram(wallet)
  const [paymentTransactionPda] = getPaymentTransactionPda(args.txSignature)
  // Hash the tx signature to a 32-byte array to match on-chain PDA derivation
  const sigHash = createHash('sha256').update(args.txSignature).digest()

  const builder = program.methods
    .initializePaymentTransaction(args.txSignature, Array.from(sigHash), args.amount, args.tokenMint, args.status)
    .accounts({
      paymentTransaction: paymentTransactionPda,
      merchantRegistration: args.merchantRegistration,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })

  return { paymentTransactionPda, builder }
}
