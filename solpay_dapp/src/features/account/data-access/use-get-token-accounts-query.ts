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
      const [a, b] = await Promise.all([
        connection.getTokenAccountsByOwner(new PublicKey(String(address)), { programId: new PublicKey(String(TOKEN_PROGRAM_ADDRESS)) }),
        connection.getTokenAccountsByOwner(new PublicKey(String(address)), { programId: new PublicKey(String(TOKEN_2022_PROGRAM_ADDRESS)) }),
      ])
      const tokenAccounts = a.value ?? []
      const token2022Accounts = b.value ?? []
      return [...tokenAccounts, ...token2022Accounts]
    },
  })
}
