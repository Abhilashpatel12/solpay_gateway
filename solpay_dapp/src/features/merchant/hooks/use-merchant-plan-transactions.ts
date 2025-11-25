import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'

export function useMerchantPlanTransactions(merchantAddress?: string, planPublicKey?: string) {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['merchant-plan-transactions', merchantAddress, planPublicKey],
    queryFn: async () => {
      if (!merchantAddress || !planPublicKey) return []

      const program = getProgram(wallet)

      try {
        const allTransactions = await program.account.paymentTransaction.all()

        return allTransactions
          .filter((account) => account.account.merchantAddress.toString() === merchantAddress)
          .map((account) => ({
            publicKey: account.publicKey,
            ...account.account,
            amount: account.account.amount.toNumber(),
            createdAt: account.account.createdAt.toNumber(),
          }))
      } catch (e) {
        console.error('Error fetching plan transactions:', e)
        return []
      }
    },
    enabled: !!merchantAddress && !!planPublicKey,
  })
}
