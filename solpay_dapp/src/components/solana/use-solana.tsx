'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import type { Connection } from '@solana/web3.js'
import { useCluster } from './cluster-provider'

type RpcMethodResponse<T> = { send: () => Promise<T> }

// Create a generic call function for the RPC shim
function createGenericCall(connection: Connection) {
  return function callRpcMethod<T>(name: string, ...args: unknown[]): RpcMethodResponse<T> {
    const method = (connection as unknown as Record<string, (...params: unknown[]) => Promise<T>>)[name]
    return { send: () => method(...args) }
  }
}

export function useSolana() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { cluster } = useCluster()

  // Provide a lightweight `client.rpc` shim so code that expects the
  // chainable `client.rpc.method(...).send()` shape (from other SDKs)
  // can still work when we only have a `Connection` instance.
  const rpcShim = {
    getSignaturesForAddress: (...args: Parameters<Connection['getSignaturesForAddress']>): RpcMethodResponse<Awaited<ReturnType<Connection['getSignaturesForAddress']>>> => 
      ({ send: () => connection.getSignaturesForAddress(...args) }),
    getTokenAccountsByOwner: (...args: Parameters<Connection['getTokenAccountsByOwner']>): RpcMethodResponse<Awaited<ReturnType<Connection['getTokenAccountsByOwner']>>> => 
      ({ send: () => connection.getTokenAccountsByOwner(...args) }),
    // Add a generic passthrough for other rpc calls used with `.send()`.
    // Callers may call rpc.someMethod(...).send()
    __call: createGenericCall(connection),
  }

  return {
    connection,
    client: { rpc: rpcShim },
    ...wallet,
    cluster,
  }
}
