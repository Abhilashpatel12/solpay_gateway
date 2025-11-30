'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useCluster } from './cluster-provider'

export function useSolana() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { cluster } = useCluster()

  // Provide a lightweight `client.rpc` shim so code that expects the
  // chainable `client.rpc.method(...).send()` shape (from other SDKs)
  // can still work when we only have a `Connection` instance.
  const rpcShim = {
    getSignaturesForAddress: (...args: any[]) => ({ send: () => (connection as any).getSignaturesForAddress(...args) }),
    getTokenAccountsByOwner: (...args: any[]) => ({ send: () => (connection as any).getTokenAccountsByOwner(...args) }),
    // Add a generic passthrough for other rpc calls used with `.send()`.
    // Callers may call rpc.someMethod(...).send()
    __call: (name: string, ...args: any[]) => ({ send: () => (connection as any)[name](...args) }),
  }

  return {
    connection,
    client: { rpc: rpcShim },
    ...wallet,
    cluster,
  }
}
