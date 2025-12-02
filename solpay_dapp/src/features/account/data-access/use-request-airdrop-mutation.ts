import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation } from '@tanstack/react-query'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import type { Address } from 'gill'
import { toastTx } from '@/components/toast-tx'
import { useInvalidateGetBalanceQuery } from './use-invalidate-get-balance-query'
import { useInvalidateGetSignaturesQuery } from './use-invalidate-get-signatures-query'

export function useRequestAirdropMutation({ address }: { address: PublicKey }) {
  const { connection } = useConnection()
  const addressString = address.toString() as Address
  const invalidateBalanceQuery = useInvalidateGetBalanceQuery({ address: addressString })
  const invalidateSignaturesQuery = useInvalidateGetSignaturesQuery({ address: addressString })

  return useMutation({
    mutationFn: async (amount: number = 1) => {
      const signature = await connection.requestAirdrop(address, amount * LAMPORTS_PER_SOL)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight })
      return signature
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await Promise.all([invalidateBalanceQuery(), invalidateSignaturesQuery()])
    },
  })
}
