import { PublicKey } from '@solana/web3.js'
import { createHash } from 'crypto'
import { SOLPAY_PROGRAM_ID } from '@/lib/solana/constants'

export function getMerchantPda(user: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from('merchant'), user.toBuffer()], SOLPAY_PROGRAM_ID)
}

export function getSubscriptionPlanPda(planName: string, merchant: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('subscription'), Buffer.from(planName), merchant.toBuffer()],
    SOLPAY_PROGRAM_ID,
  )
}

export function getUserSubscriptionPda(subscriptionPlan: PublicKey, subscriber: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user_subscription'), subscriptionPlan.toBuffer(), subscriber.toBuffer()],
    SOLPAY_PROGRAM_ID,
  )
}

export function getPaymentTransactionPda(txSignature: string) {
  // Transaction signatures/base58 strings can decode to >32 bytes which exceeds
  // the allowed seed length for PDA derivation. Hash the signature to a 32-byte
  // value (sha256) and use that as the seed so the seed length is valid and
  // stable across environments.
  const sigHash = createHash('sha256').update(txSignature).digest()
  return PublicKey.findProgramAddressSync([Buffer.from('payment'), Buffer.from(sigHash)], SOLPAY_PROGRAM_ID)
}
