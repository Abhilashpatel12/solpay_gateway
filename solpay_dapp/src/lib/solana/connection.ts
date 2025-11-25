import { Connection } from '@solana/web3.js'
import { RPC_ENDPOINT } from '@/lib/solana/constants'

let sharedConnection: Connection | null = null

export function getConnection() {
  if (!sharedConnection) {
    sharedConnection = new Connection(RPC_ENDPOINT, 'confirmed')
  }

  return sharedConnection
}
