import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const mockPayments = [
  {
    txSignature: 'solpay_tx_1',
    amountLamports: 100_000_000,
    tokenMint: 'SOL',
    status: 'Captured',
    createdAt: '2025-11-20 14:22',
  },
  {
    txSignature: 'solpay_tx_2',
    amountLamports: 50_000_000,
    tokenMint: 'SOL',
    status: 'Pending',
    createdAt: '2025-11-19 09:05',
  },
]

export function PaymentReceiptsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment receipts</CardTitle>
        <CardDescription>
          Mirrors `PaymentTransaction` accounts filtered by your wallet. This will include status codes, token mints,
          and tx signatures once the Solana queries are in place.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Signature</TableHead>
              <TableHead>Amount (lamports)</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPayments.map((payment) => (
              <TableRow key={payment.txSignature}>
                <TableCell className="font-mono text-xs">{payment.txSignature}</TableCell>
                <TableCell>{payment.amountLamports.toLocaleString()}</TableCell>
                <TableCell>SOL</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>{payment.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
