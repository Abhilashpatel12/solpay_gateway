import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import { getMerchantPda, getSubscriptionPlanPda } from '@/lib/solana/pdas'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { toast } from 'sonner'
import { BN } from '@coral-xyz/anchor'
import { SubscriptionPlanDraft } from '../components/subscription-plan-form'

// Plans are SOL-only; use native SOL mint and no supported SPL tokens by default

export function useInitializeSubscriptionPlan() {
  const wallet = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (draft: SubscriptionPlanDraft) => {

      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }

      const program = getProgram(wallet)
      const [merchantPda] = getMerchantPda(wallet.publicKey)
      const [planPda] = getSubscriptionPlanPda(draft.planName, wallet.publicKey)

      // Use native SOL mint and no supported tokens
      const nativeMint = new PublicKey('11111111111111111111111111111111')
      const supportedTokens: PublicKey[] = []

      return program.methods
        .initializeSubscriptionPlan(
          draft.planName,
          new BN(draft.planPriceLamports),
          nativeMint,
          draft.billingCycleDays,
          supportedTokens,
          draft.isActive,
        )
        .accounts({
          subscriptionPlan: planPda,
          merchantRegistration: merchantPda,
          merchantAddress: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
    },

    onSuccess: (signature) => {
      toast.success('Subscription plan created successfully!')
      console.log('Transaction signature:', signature)
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
    },

    onError: (error) => {
      console.error(error)
      toast.error(`Failed to create plan: ${error.message}`)
    },
  })
}
