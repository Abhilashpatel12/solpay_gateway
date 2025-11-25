import { useConnection } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { PublicKey } from '@solana/web3.js'
import { useGetBalanceQueryKey } from './use-get-balance-query-key'

export function useGetBalanceQuery({ address }: { address: PublicKey }) {
  const { connection } = useConnection()

  return useQuery({
    retry: false,
    queryKey: useGetBalanceQueryKey({ address: address.toString() as any }),
    queryFn: async () => {
      return await connection.getBalance(address)
    },
  })
}
