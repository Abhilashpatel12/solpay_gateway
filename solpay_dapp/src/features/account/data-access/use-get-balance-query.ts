import { useConnection } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import type { Address } from 'gill'
import { useGetBalanceQueryKey } from './use-get-balance-query-key'

export function useGetBalanceQuery({ address }: { address: Address | PublicKey }) {
  const { connection } = useConnection()
  const pub = typeof address === 'string' ? new PublicKey(address) : address

  return useQuery({
    retry: false,
    queryKey: useGetBalanceQueryKey({ address: pub.toString() as any }),
    queryFn: async () => {
      return await connection.getBalance(pub)
    },
  })
}
