"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useOneTimePayment } from '@/features/checkout/hooks/use-one-time-payment'
import { useSubscribe } from '@/features/checkout/hooks/use-subscribe'
import { lamportsToSol } from '@/lib/solana/utils'

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false },
)

function formatSol(value: number) {
  if (!isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 1e-9) return value.toLocaleString()
  return Number(value.toFixed(6)).toString()
}

type TokenPayload = {
  m: string // merchantAddress
  a?: number // amountLamports (optional for subscribe tokens)
  d?: string
  e: number
  n: string
  t?: string // type: 'subscribe' or 'one_time'
  p?: string // planName
  pp?: string // planPda (public key)
  b?: number // billingCycleDays
}

export default function PublicOneTimePaymentPage() {
  const params = useParams()
  const token = params?.token as string | undefined
  const [payload, setPayload] = useState<TokenPayload | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const { mutate: pay, isPending: isPayPending, isSuccess: isPaySuccess } = useOneTimePayment()
  const { mutate: subscribe, isPending: isSubscribePending, isSuccess: isSubscribeSuccess } = useSubscribe()

  useEffect(() => {
    if (!token) {
      setError('Missing token')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`/api/pay/verify/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error || `Verify failed (${res.status})`)
        }
        return res.json()
      })
      .then((data) => {
        setPayload(data)
      })
      .catch((err) => {
        setError(err?.message ?? String(err))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  if (error || !payload) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{error || 'Invalid or expired link.'}</p>
      </div>
    )
  }

  if (isPaySuccess || isSubscribeSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-semibold">Payment successful</h2>
        <p className="text-muted-foreground">You can safely close this tab.</p>
      </div>
    )
  }

  const merchantAddress = payload.m
  const amountLamports = payload.a
  const description = payload.d
  const tokenType = payload.t ?? 'one_time'
  const planName = payload.p
  const planPda = payload.pp
  const billingCycleDays = payload.b

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">{tokenType === 'subscribe' ? 'Subscribe' : 'One-time payment'}</CardTitle>
          <CardDescription>
            {tokenType === 'subscribe'
              ? `${planName || 'Subscription plan'} — review and confirm to start your subscription.`
              : description || 'Review the details and confirm the payment from your wallet.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold tracking-tight">{formatSol(lamportsToSol(amountLamports || 0))}</span>
            <span className="text-muted-foreground">SOL</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span>Merchant</span>
              <span className="font-mono text-xs truncate max-w-[160px]" title={merchantAddress}>
                {merchantAddress}
              </span>
            </div>
            {tokenType === 'subscribe' && billingCycleDays && (
              <div className="flex justify-between">
                <span>Billing cycle</span>
                <span className="font-mono text-xs">{billingCycleDays} days</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Token</span>
              <span className="font-mono text-xs">SOL (native)</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full">
            <WalletMultiButton className="w-full justify-center" />
            <p className="text-xs text-center text-muted-foreground mt-2">Connect your wallet to pay</p>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={
              isPayPending || isSubscribePending || (tokenType !== 'subscribe' && typeof amountLamports !== 'number')
            }
            onClick={() => {
              if (tokenType === 'subscribe') {
                // construct a minimal plan object that useSubscribe expects
                const planForMutation: any = {
                  planName: planName,
                  publicKey: planPda,
                  planPrice: amountLamports,
                  billingCycle: billingCycleDays,
                  merchantAddress: merchantAddress,
                }
                subscribe(planForMutation)
              } else {
                if (typeof amountLamports !== 'number') {
                  setError('Invalid amount for one-time payment.')
                  return
                }
                pay({ merchantAddress, amountLamports })
              }
            }}
          >
            {(isPayPending || isSubscribePending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPayPending || isSubscribePending ? 'Processing...' : tokenType === 'subscribe' ? 'Subscribe' : 'Pay now'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
