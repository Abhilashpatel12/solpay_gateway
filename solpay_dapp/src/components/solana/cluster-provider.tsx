'use client'

import { createContext, ReactNode, useContext, useState } from 'react'
import { clusterApiUrl } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

export interface Cluster {
  name: WalletAdapterNetwork | 'localnet'
  endpoint: string
  network?: WalletAdapterNetwork
  label: string
}

export const clusters: Cluster[] = [
  {
    name: WalletAdapterNetwork.Devnet,
    endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet),
    network: WalletAdapterNetwork.Devnet,
    label: 'Devnet',
  },
  {
    name: WalletAdapterNetwork.Mainnet,
    endpoint: clusterApiUrl(WalletAdapterNetwork.Mainnet),
    network: WalletAdapterNetwork.Mainnet,
    label: 'Mainnet Beta',
  },
  {
    name: WalletAdapterNetwork.Testnet,
    endpoint: clusterApiUrl(WalletAdapterNetwork.Testnet),
    network: WalletAdapterNetwork.Testnet,
    label: 'Testnet',
  },
  {
    name: 'localnet',
    endpoint: 'http://localhost:8899',
    label: 'Localnet',
  },
]

interface ClusterProviderContext {
  cluster: Cluster
  setCluster: (cluster: Cluster) => void
  clusters: Cluster[]
}

const Context = createContext<ClusterProviderContext>({} as ClusterProviderContext)

export function ClusterProvider({ children }: { children: ReactNode }) {
  const [cluster, setCluster] = useState<Cluster>(clusters[0])

  return <Context.Provider value={{ cluster, setCluster, clusters }}>{children}</Context.Provider>
}

export function useCluster() {
  return useContext(Context)
}
