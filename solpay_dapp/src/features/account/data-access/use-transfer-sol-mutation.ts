import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL, SendTransactionError } from '@solana/web3.js'
import type { Address } from 'gill'
import { toastTx } from '@/components/toast-tx'
import { useInvalidateGetBalanceQuery } from './use-invalidate-get-balance-query'
import { useInvalidateGetSignaturesQuery } from './use-invalidate-get-signatures-query'

export function useTransferSolMutation({ address }: { address: PublicKey }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  // Cast to Address type for the query hooks
  const addressString = address.toString() as Address 
  const invalidateBalanceQuery = useInvalidateGetBalanceQuery({ address: addressString })
  const invalidateSignaturesQuery = useInvalidateGetSignaturesQuery({ address: addressString })

  return useMutation({
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      if (!wallet || !wallet.publicKey || !wallet.sendTransaction) throw new Error('Wallet not connected')

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey!,
          toPubkey: input.destination,
          lamports: input.amount * LAMPORTS_PER_SOL,
        })
      )
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      try {
        const signature = await wallet.sendTransaction(transaction, connection)
        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight })
        return signature
      } catch (error: unknown) {
        if (error instanceof SendTransactionError) {
          console.error('Transaction failed', error)
          const logs = error.logs
          console.error('Transaction logs', logs)
        }
        throw error
      }
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await Promise.all([invalidateBalanceQuery(), invalidateSignaturesQuery()])
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`)
    },
  })
}
