import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'

export function useMerchantTransactions(merchantAddress?: string) {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['merchant-transactions', merchantAddress],
    queryFn: async () => {
      if (!merchantAddress) return []

      const program = getProgram(wallet)

      try {
        // Fetch all payment transactions
        // Filtering in client because merchant_address offset is variable due to tx_signature string
        const allTransactions = await (program.account as any).paymentTransaction.all()

        return allTransactions
          .filter((account: any) => account.account.merchantAddress.toString() === merchantAddress)
          .map((account: any) => ({
            publicKey: account.publicKey,
            ...account.account,
            // Convert BN to number for easier UI handling (be careful with large numbers in prod)
            amount: account.account.amount.toNumber(),
            createdAt: account.account.createdAt.toNumber(),
          }))
          .sort((a: any, b: any) => b.createdAt - a.createdAt) // Newest first
      } catch (e) {
        console.error('Error fetching transactions:', e)
        return []
      }
    },
    enabled: !!merchantAddress,
  })
}
