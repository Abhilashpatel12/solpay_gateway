import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'

export function useUpdateSubscriptionPlan() {
  const wallet = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      planPda,
      isActive,
    }: {
      planPda: PublicKey
      isActive: boolean
    }) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }

      const program = getProgram(wallet)

      return program.methods
        .update_subscription_plan(isActive)
        .accounts({
          subscription_plan: planPda,
          merchant_address: wallet.publicKey,
        } as any)
        .rpc()
    },
    onSuccess: () => {
      toast.success('Subscription plan updated successfully')
      queryClient.invalidateQueries({ queryKey: ['merchant-plans'] })
    },
    onError: (error: any) => {
      toast.error(`Failed to update plan: ${error.message ?? error}`)
    },
  })
}
