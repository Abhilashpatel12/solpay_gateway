import type { Address } from 'gill'
import { TOKEN_2022_PROGRAM_ADDRESS, TOKEN_PROGRAM_ADDRESS } from 'gill/programs/token'
import { useQuery } from '@tanstack/react-query'
import { useSolana } from '@/components/solana/use-solana'
import { PublicKey } from '@solana/web3.js'

export function useGetTokenAccountsQuery({ address }: { address: Address }) {
  const { connection, cluster } = useSolana()

  return useQuery({
    queryKey: ['get-token-accounts', { cluster, address }],
    queryFn: async () => {
      const addrPub = new PublicKey(address)
      const [res1, res2] = await Promise.all([
        (connection as any).getTokenAccountsByOwner(addrPub, { programId: TOKEN_PROGRAM_ADDRESS }),
        (connection as any).getTokenAccountsByOwner(addrPub, { programId: TOKEN_2022_PROGRAM_ADDRESS }),
      ])
      const tokenAccounts = (res1 as any)?.value ?? []
      const token2022Accounts = (res2 as any)?.value ?? []
      return [...tokenAccounts, ...token2022Accounts]
    },
  })
}
