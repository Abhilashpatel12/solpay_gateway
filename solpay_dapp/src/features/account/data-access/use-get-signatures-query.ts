import type { Address } from 'gill'
import { useQuery } from '@tanstack/react-query'
import { useSolana } from '@/components/solana/use-solana'
import { PublicKey } from '@solana/web3.js'
import { useGetSignaturesQueryKey } from './use-get-signatures-query-key'

export function useGetSignaturesQuery({ address }: { address: Address }) {
  const { connection } = useSolana()

  return useQuery({
    queryKey: useGetSignaturesQueryKey({ address }),
    queryFn: () => connection.getSignaturesForAddress(new PublicKey(address as string)),
  })
}
