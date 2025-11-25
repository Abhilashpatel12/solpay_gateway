import { useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { getSubscriptionPlanPda } from '@/lib/solana/pdas'
import { getProgram } from '@/lib/solana/program'
import { useWallet } from '@solana/wallet-adapter-react'

export function useSubscriptionPlan(merchantAddress: string, planName: string) {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['subscription-plan', merchantAddress, planName],
    queryFn: async () => {
      if (!merchantAddress || !planName) return null

      const program = getProgram(wallet)
      try {
        const merchantPubkey = new PublicKey(merchantAddress)
        const [planPda] = getSubscriptionPlanPda(planName, merchantPubkey)
        const planAccount = await (program.account as any).subscriptionPlan.fetch(planPda)
        return {
          ...planAccount,
          publicKey: planPda,
        }
      } catch (e) {
        console.error('Error fetching plan:', e)
        return null
      }
    },
    enabled: !!merchantAddress && !!planName,
  })
}
