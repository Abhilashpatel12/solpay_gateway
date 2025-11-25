import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'

export function useCancelSubscription() {
  const wallet = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userSubscriptionPda,
      subscriptionPlanPda,
    }: {
      userSubscriptionPda: PublicKey
      subscriptionPlanPda: PublicKey
    }) => {
      if (!wallet.publicKey) throw new Error('Wallet not connected')

      const program = getProgram(wallet)

      const tx = await program.methods
        .initializeCancelSubscription()
        .accounts({
          userSubscription: userSubscriptionPda,
          subscriptionPlan: subscriptionPlanPda,
          subscriber: wallet.publicKey,
        })
        .rpc()

      return tx
    },
    onSuccess: (signature) => {
      toast.success('Subscription cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] })
    },
    onError: (error) => {
      toast.error(`Failed to cancel subscription: ${error.message}`)
    },
  })
}
