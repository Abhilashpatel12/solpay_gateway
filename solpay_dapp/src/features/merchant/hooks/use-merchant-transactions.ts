import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import type { AccountWrapper, PaymentTransaction, ProcessedPaymentTransaction } from '@/types/solpay_smartcontract'

export function useMerchantTransactions(merchantAddress?: string) {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['merchant-transactions', merchantAddress],
    queryFn: async (): Promise<ProcessedPaymentTransaction[]> => {
      if (!merchantAddress) return []

      const program = getProgram(wallet)

      try {
        // Fetch all payment transactions
        // Filtering in client because merchant_address offset is variable due to tx_signature string
        const allTransactions = await (program.account as { paymentTransaction: { all: () => Promise<AccountWrapper<PaymentTransaction>[]> } }).paymentTransaction.all()

        return allTransactions
          .filter((account: AccountWrapper<PaymentTransaction>) => account.account.merchantAddress.toString() === merchantAddress)
          .map((account: AccountWrapper<PaymentTransaction>): ProcessedPaymentTransaction => ({
            publicKey: account.publicKey,
            txSignature: account.account.txSignature,
            payerAddress: account.account.payerAddress,
            merchantAddress: account.account.merchantAddress,
            tokenMint: account.account.tokenMint,
            status: account.account.status,
            // Convert BN to number for easier UI handling (be careful with large numbers in prod)
            amount: account.account.amount.toNumber(),
            createdAt: account.account.createdAt.toNumber(),
          }))
          .sort((a: ProcessedPaymentTransaction, b: ProcessedPaymentTransaction) => b.createdAt - a.createdAt) // Newest first
      } catch (e) {
        console.error('Error fetching transactions:', e)
        return []
      }
    },
    enabled: !!merchantAddress,
  })
}
