import { Lamports, lamportsToSol } from 'gill'

export function AccountUiBalanceSol({ balance }: { balance: number | Lamports }) {
  return <span>{lamportsToSol(balance as Lamports)}</span>
}
