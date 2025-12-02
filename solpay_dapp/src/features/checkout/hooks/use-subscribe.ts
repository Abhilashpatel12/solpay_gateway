import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import { getUserSubscriptionPda, getMerchantPda } from '@/lib/solana/pdas'
import { prepareLogPayment, prepareInitializeUserSubscription } from '@/lib/solana/transactions'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { toast } from 'sonner'
import { BN } from '@coral-xyz/anchor'

interface SubscribePlanInput {
  publicKey?: PublicKey | string
  planPda?: PublicKey | string
  plan_pda?: PublicKey | string
  billingCycle?: number
  billing_cycle?: number
  planPrice?: BN | number
  plan_price?: BN | number
  account?: {
    merchantAddress?: PublicKey | string
  }
  merchantAddress?: PublicKey | string
  merchant_address?: PublicKey | string
  planName?: string
}

export function useSubscribe() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['subscribe'],
    mutationFn: async (plan: SubscribePlanInput) => {
      if (!wallet || !wallet.publicKey || !wallet.sendTransaction) {
        throw new Error('Wallet not connected')
      }

      // Get program inside mutation to ensure wallet context is properly available
      const program = getProgram(wallet)

      // Normalize plan shape: older code expected `plan.account.merchantAddress`,
      // newer hooks return plan fields at top-level. Support both.
      const merchantAddrRaw =
        plan?.account?.merchantAddress ?? plan?.merchantAddress ?? plan?.merchant_address
      if (!merchantAddrRaw) {
        throw new Error('Subscription plan missing merchant address')
      }

      let merchantPubkey: PublicKey
      try {
        merchantPubkey = merchantAddrRaw instanceof PublicKey ? merchantAddrRaw : new PublicKey(merchantAddrRaw)
      } catch {
        throw new Error('Invalid merchant public key on plan')
      }

      const planPda = plan?.publicKey ?? plan?.planPda ?? plan?.plan_pda
      if (!planPda) {
        throw new Error('Subscription plan missing public key (planPda)')
      }

      const planPdaPub = planPda instanceof PublicKey ? planPda : new PublicKey(planPda)
      const [userSubscriptionPda] = getUserSubscriptionPda(planPdaPub, wallet.publicKey)
      const [merchantPda] = getMerchantPda(merchantPubkey)

      // If a user subscription account already exists for this plan+user,
      // surface a clear error instead of letting the program call fail later.
      try {
        // If fetch succeeds, subscription already exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (program.account as any).user_subscription.fetch(userSubscriptionPda)
        throw new Error('Already subscribed to this plan')
      } catch (err: unknown) {
        // Anchor error messages vary between environments. If the account does
        // not exist, Anchor's fetch throws with messages like:
        //  - "Account does not exist or has no data <PUBKEY>"
        //  - "AccountNotFound"
        //  - "Could not find account"
        // Detect these variants; rethrow on any other unexpected error.
        const msg = String((err as Error)?.message || err)
        if (!/account.*not.*found/i.test(msg)
          && !/could not find account/i.test(msg)
          && !/failed to get account/i.test(msg)
          && !/does not exist or has no data/i.test(msg)
          && !/account does not exist/i.test(msg)) {
          // rethrow unexpected errors
          throw err
        }
        // else: account not found, proceed to create subscription
      }

      // Preflight checks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (program.account as any).merchant_registration.fetch(merchantPda)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (program.account as any).subscription_plan.fetch(planPdaPub)

      // Calculate next billing date
      const now = Math.floor(Date.now() / 1000)
      const billingCycle = plan?.billingCycle ?? plan?.billing_cycle
      if (!billingCycle) throw new Error('Plan missing billing cycle')
      const billingCycleSeconds = billingCycle * 24 * 60 * 60
      const nextBillingDate = new BN(now + billingCycleSeconds)

      const transaction = new Transaction()

      // 1. Create the subscription instruction using the prepare helper
      const { builder } = prepareInitializeUserSubscription(wallet, {
        subscriptionPlan: planPdaPub,
        merchantRegistration: merchantPda,
        nextBillingDate,
        isActive: true,
        supportedTokens: [],
      })

      // builder contains accounts and instruction; get the instruction and add
      const subscriptionIx = await builder.instruction()
      transaction.add(subscriptionIx)

      // 2. Create the SOL payment instruction
      const balance = await connection.getBalance(wallet.publicKey)
      const planPrice = plan?.planPrice ?? plan?.plan_price
      if (!planPrice) throw new Error('Plan missing price')
      // planPrice might be a BN or a number
      const priceLamports = typeof (planPrice as BN).toNumber === 'function' ? (planPrice as BN).toNumber() : Number(planPrice)

      if (balance < priceLamports) {
        throw new Error('Insufficient SOL balance.')
      }

      const transferIx = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: merchantPubkey,
        lamports: priceLamports,
      })

      transaction.add(transferIx)

      // 3. Send and confirm transaction
      transaction.feePayer = wallet.publicKey
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

      const signature = await wallet.sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')

      // After successful subscription and SOL transfer, log the payment on-chain
      try {
        const nativeMint = new PublicKey('11111111111111111111111111111111')
        const { builder: logBuilder } = prepareLogPayment(wallet, {
          txSignature: signature,
          amount: new BN(priceLamports),
          tokenMint: nativeMint,
          status: 1,
          merchantRegistration: merchantPda,
        })

        await logBuilder.rpc()
      } catch (err) {
        // Logging failure shouldn't block the subscription flow; surface a console warning
        console.warn('Failed to log subscription payment on-chain:', err)
      }

      return signature
    },
    onSuccess: (signature: string) => {
      toast.success('Subscription initialized successfully!')
      console.log('Transaction signature:', signature)
      queryClient.invalidateQueries({ queryKey: ['user-subscription', 'get-balance'] })
    },
    onError: (error: Error) => {
      console.error('Subscription error full object:', error)
      const msg = error?.message ?? String(error)
      if (typeof msg === 'string' && msg.toLowerCase().includes('already subscribed')) {
        toast.error('Already subscribed to this plan')
      } else {
        toast.error(`Subscription failed: ${msg}`)
      }
    },
  })
}
