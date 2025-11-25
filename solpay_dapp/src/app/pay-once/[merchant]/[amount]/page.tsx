"use client"

import { useParams } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useOneTimePayment } from '@/features/checkout/hooks/use-one-time-payment'
import { lamportsToSol } from '@/lib/solana/utils'

function formatSol(value: number) {
  if (!isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 1e-9) return value.toLocaleString()
  return Number(value.toFixed(6)).toString()
}

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false },
)

export default function OneTimeCheckoutPageNoMint() {
  const params = useParams()
  const merchantAddress = params.merchant as string
  const amountLamports = Number(params.amount as string)
  const { connected } = useWallet()
  const { mutate: pay, isPending, isSuccess } = useOneTimePayment()

  if (Number.isNaN(amountLamports) || !merchantAddress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Invalid payment link.</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-semibold">Payment successful</h2>
        <p className="text-muted-foreground">You can safely close this tab.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">One-time payment</CardTitle>
          <CardDescription>Review the details and confirm the payment from your wallet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold tracking-tight">{formatSol(lamportsToSol(amountLamports))}</span>
            <span className="text-muted-foreground">SOL</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span>Merchant</span>
              <span className="font-mono text-xs truncate max-w-[160px]" title={merchantAddress}>
                {merchantAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Token</span>
              <span className="font-mono text-xs">SOL (native)</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!connected ? (
            <div className="w-full">
              <WalletMultiButton className="w-full justify-center" />
              <p className="text-xs text-center text-muted-foreground mt-2">Connect your wallet to pay</p>
            </div>
          ) : (
            <Button
              className="w-full"
              size="lg"
              disabled={isPending}
              onClick={() => pay({ merchantAddress, amountLamports })}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Processing...' : 'Pay now'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
