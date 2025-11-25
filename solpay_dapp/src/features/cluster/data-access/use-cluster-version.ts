import { useConnection } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { useCluster } from '@/components/solana/cluster-provider'

export function useClusterVersion() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  
  return useQuery({
    retry: false,
    queryKey: ['version', { cluster: cluster.name }],
    queryFn: async () => {
      const version = await connection.getVersion()
      return version
    },
  })
}
