'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useSubscriptionPlan } from './hooks/use-subscription-plan'
import { useSubscribe } from './hooks/use-subscribe'
import { lamportsToSol } from '@/lib/solana/utils'

function formatSol(value: number) {
  if (!isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 1e-9) return value.toLocaleString()
  return Number(value.toFixed(6)).toString()
}

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
)

export function CheckoutFeature() {
  const params = useParams()
  const merchantAddress = params.merchant as string
  const planName = decodeURIComponent(params.plan as string)
  
  const wallet = useWallet()
  const connected = wallet.connected
  const { data: plan, isLoading: isPlanLoading } = useSubscriptionPlan(merchantAddress, planName)
  const { mutate: subscribe, isPending: isSubscribing, isSuccess } = useSubscribe()

  if (isPlanLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Plan not found</h2>
        <p className="text-muted-foreground">The subscription plan you are looking for does not exist.</p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Subscription Active!</h2>
          <p className="text-muted-foreground">
            You have successfully subscribed to {plan.planName}.
          </p>
        </div>
        <Button variant="default" onClick={() => window.location.href = '/customer'}>
          Go to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary w-fit">
            Subscription
          </div>
          <CardTitle className="text-3xl">{plan.planName}</CardTitle>
          <CardDescription>
            Subscribe to this plan from the merchant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold tracking-tight">{formatSol(lamportsToSol(typeof plan.planPrice === 'object' && plan.planPrice.toNumber ? plan.planPrice.toNumber() : Number(plan.planPrice)))}</span>
            <span className="text-muted-foreground"> SOL</span>
            <span className="text-muted-foreground">/ {plan.billingCycle} days</span>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span>Merchant</span>
              <span className="font-mono text-xs truncate max-w-[150px]" title={merchantAddress}>
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
              <p className="text-xs text-center text-muted-foreground mt-2">
                Connect your wallet to subscribe
              </p>
            </div>
          ) : (
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => subscribe(plan)}
              disabled={isSubscribing || !connected || !wallet.sendTransaction}
            >
              {isSubscribing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubscribing ? 'Processing...' : 'Subscribe Now'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
