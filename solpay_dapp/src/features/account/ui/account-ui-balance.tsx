import { PublicKey } from '@solana/web3.js'
import { Address } from 'gill'
import { useGetBalanceQuery } from '../data-access/use-get-balance-query'
import { AccountUiBalanceSol } from './account-ui-balance-sol'

export function AccountUiBalance({ address }: { address: Address }) {
  // convert address string to PublicKey for the RPC call
  let pk: PublicKey | undefined
  try {
    pk = new PublicKey(address as string)
  } catch {
    pk = undefined
  }

  const query = useGetBalanceQuery({ address: pk as PublicKey })

  return (
    <h1 className="text-5xl font-bold cursor-pointer" onClick={() => query.refetch()}>
      {typeof query.data === 'number' ? <AccountUiBalanceSol balance={query.data as unknown as any} /> : '...'} SOL
    </h1>
  )
}
