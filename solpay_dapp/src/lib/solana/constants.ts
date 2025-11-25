import { clusterApiUrl, PublicKey } from '@solana/web3.js'

type ClusterName = 'mainnet-beta' | 'testnet' | 'devnet'

export const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as ClusterName) ?? 'devnet'

export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ??
  clusterApiUrl(SOLANA_NETWORK)

const DEFAULT_PROGRAM_ID = 'EVBgMcsQdMqHrm2KMscsPUKUsFAcbpJUkAjBSWHGwL8A'

export const SOLPAY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLPAY_PROGRAM_ID ?? DEFAULT_PROGRAM_ID,
)
