import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import { getMerchantPda, getSubscriptionPlanPda } from '@/lib/solana/pdas'
import { prepareInitializeSubscriptionPlan } from '@/lib/solana/transactions'
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

      const { builder } = prepareInitializeSubscriptionPlan(wallet, {
        planName: draft.planName,
        planPriceLamports: new BN(draft.planPriceLamports),
        tokenMint: new PublicKey('11111111111111111111111111111111'),
        billingCycle: draft.billingCycleDays,
        supportedTokens: [],
        isActive: draft.isActive,
      })

      return builder.rpc()
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
