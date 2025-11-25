import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import { getUserSubscriptionPda, getMerchantPda } from '@/lib/solana/pdas'
import { prepareLogPayment } from '@/lib/solana/transactions'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { toast } from 'sonner'
import { BN } from '@coral-xyz/anchor'

type SubscriptionPlanAccount = {
  publicKey: PublicKey
  billingCycle: number
  planPrice: BN
  account: {
    merchantAddress: PublicKey
  }
}

export function useSubscribe() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const queryClient = useQueryClient()
  const program = getProgram(wallet)

  return useMutation({
    mutationKey: ['subscribe'],
    mutationFn: async (plan: any) => {
      if (!wallet || !wallet.publicKey || !wallet.sendTransaction) {
        throw new Error('Wallet not connected')
      }

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
      } catch (err) {
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
        await (program.account as any).userSubscription.fetch(userSubscriptionPda)
        throw new Error('Already subscribed to this plan')
      } catch (err: any) {
        // If the account does not exist, Anchor's fetch throws an error; we only
        // want to continue when that's the case. Detect by message containing
        // 'AccountNotFound' or similar; otherwise rethrow.
        const msg = String(err?.message || err)
        if (!/account.*not.*found/i.test(msg) && !/could not find account/i.test(msg) && !/failed to get account/i.test(msg)) {
          // rethrow unexpected errors
          throw err
        }
        // else: account not found, proceed to create subscription
      }

      // Preflight checks
      await program.account.merchantRegistration.fetch(merchantPda)
      await program.account.subscriptionPlan.fetch(planPdaPub)

      // Calculate next billing date
      const now = Math.floor(Date.now() / 1000)
      const billingCycle = plan?.billingCycle ?? plan?.billing_cycle
      if (!billingCycle) throw new Error('Plan missing billing cycle')
      const billingCycleSeconds = billingCycle * 24 * 60 * 60
      const nextBillingDate = new BN(now + billingCycleSeconds)

      const transaction = new Transaction()

      // 1. Create the subscription instruction
      const subscriptionIx = await program.methods
        .initializeUserSubscription(nextBillingDate, true, [])
        .accounts({
          userSubscription: userSubscriptionPda,
          subscriptionPlan: planPda,
          merchantRegistration: merchantPda,
          subscriber: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .instruction()

      transaction.add(subscriptionIx)

      // 2. Create the SOL payment instruction
      const balance = await connection.getBalance(wallet.publicKey)
      const planPrice = plan?.planPrice ?? plan?.plan_price
      if (!planPrice) throw new Error('Plan missing price')
      // planPrice might be a BN or a number
      const priceLamports = typeof planPrice.toNumber === 'function' ? planPrice.toNumber() : Number(planPrice)

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
        const { builder } = prepareLogPayment(wallet, {
          txSignature: signature,
          amount: new BN(priceLamports),
          tokenMint: nativeMint,
          status: 1,
          merchantRegistration: merchantPda,
        })

        await builder.rpc()
      } catch (err) {
        // Logging failure shouldn't block the subscription flow; surface a console warning
        console.warn('Failed to log subscription payment on-chain:', err)
      }

      return signature
    },
    onSuccess: (signature) => {
      toast.success('Subscription initialized successfully!')
      console.log('Transaction signature:', signature)
      queryClient.invalidateQueries({ queryKey: ['user-subscription', 'get-balance'] })
    },
    onError: (error: any) => {
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

