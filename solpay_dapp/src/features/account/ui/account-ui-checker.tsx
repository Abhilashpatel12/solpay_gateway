import { useSolana } from '@/components/solana/use-solana'
import { AccountUiBalanceCheck } from './account-ui-balance-check'

export function AccountUiChecker() {
  const { publicKey } = useSolana()
  if (!publicKey) {
    return null
  }
  return <AccountUiBalanceCheck address={publicKey} />
}
