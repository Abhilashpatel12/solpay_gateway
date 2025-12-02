import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import type { AccountWrapper, PaymentTransaction, ProcessedPaymentTransaction } from '@/types/solpay_smartcontract'

export function useMerchantPlanTransactions(merchantAddress?: string, planPublicKey?: string) {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['merchant-plan-transactions', merchantAddress, planPublicKey],
    queryFn: async (): Promise<ProcessedPaymentTransaction[]> => {
      if (!merchantAddress || !planPublicKey) return []

      const program = getProgram(wallet)

      try {
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
