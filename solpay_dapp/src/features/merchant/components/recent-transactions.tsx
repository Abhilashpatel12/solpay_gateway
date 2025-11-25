import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ellipsify } from '@/lib/utils'
import { lamportsToSol } from '@/lib/solana/utils'
import { PublicKey } from '@solana/web3.js'

interface Transaction {
  publicKey: PublicKey
  txSignature: string
  payerAddress: PublicKey
  amount: number
  createdAt: number
  status: number
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Latest payments processed by your merchant account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Signature</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.slice(0, 5).map((tx) => (
              <TableRow key={tx.publicKey.toString()}>
                <TableCell className="font-mono font-medium">
                  <a 
                    href={`https://explorer.solana.com/tx/${tx.txSignature}?cluster=devnet`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-500"
                  >
                    {ellipsify(tx.txSignature)}
                  </a>
                </TableCell>
                <TableCell className="font-mono">{ellipsify(tx.payerAddress.toString())}</TableCell>
                <TableCell>{lamportsToSol(tx.amount)} SOL</TableCell>
                <TableCell>{new Date(tx.createdAt * 1000).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
               <TableRow>
                 <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                   No transactions found.
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
