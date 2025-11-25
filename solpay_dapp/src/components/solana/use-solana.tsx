'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from './cluster-provider'

export function useSolana() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { cluster } = useCluster()

  return {
    connection,
    ...wallet,
    cluster,
  }
}
