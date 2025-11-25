import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ShareLinkButton } from '@/components/share-link-button'
import { useMerchantPlans } from '../hooks/use-merchant-plans'
import { lamportsToSol } from '@/lib/solana/utils'

function formatSol(value: number) {
  if (!isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 1e-9) return value.toLocaleString()
  // show up to 6 decimal places, trim trailing zeros
  return Number(value.toFixed(6)).toString()
}

export function PlansPreview({ merchantAddress }: { merchantAddress?: string }) {
  const { data: plans, isLoading } = useMerchantPlans(merchantAddress)

  const buildPaymentLink = (planName: string) => {
    if (!merchantAddress) {
      toast.error('Merchant address not found')
      return ''
    }
    return `${window.location.origin}/pay/${merchantAddress}/${planName}`
  }

  const buildSubscriptionTokenLink = async (plan: any) => {
    if (!merchantAddress) {
      toast.error('Merchant address not found')
      return ''
    }

    const raw = (plan.planPrice as any)
    const lamports = raw && typeof raw === 'object' && typeof raw.toNumber === 'function' ? raw.toNumber() : Number(raw)

    try {
      const res = await fetch('/api/pay/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantAddress,
          type: 'subscribe',
          planName: plan.planName,
          planPda: plan.publicKey?.toString?.() ?? plan.publicKey,
          amountLamports: lamports,
          billingCycleDays: plan.billingCycle,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || `Failed to generate token (${res.status})`)
      }

      const data = await res.json()
      const token = data?.token
      if (!token) throw new Error('No token returned')

      const url = `${window.location.origin}/p/${token}`
      await navigator.clipboard.writeText(url)
      toast.success('Subscription link copied to clipboard')
      return url
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? 'Failed to generate subscription link')
      return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan inventory</CardTitle>
        <CardDescription>
          Live data from on-chain `SubscriptionPlan` accounts filtered by your merchant address.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !plans?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No subscription plans found. Create one above!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan: any) => (
                <TableRow key={plan.publicKey.toString()} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    <Link
                      href={`/merchant/plans/${encodeURIComponent(plan.planName)}`}
                      className="hover:underline"
                    >
                      {plan.planName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const raw = (plan.planPrice as any)
                      const lamports = raw && typeof raw === 'object' && typeof raw.toNumber === 'function' ? raw.toNumber() : Number(raw)
                      const sol = lamportsToSol(isNaN(lamports) ? 0 : lamports)
                      return `${formatSol(sol)} SOL`
                    })()}
                  </TableCell>
                  <TableCell>{plan.billingCycle} days</TableCell>
                  <TableCell>
                    <span className={plan.isActive ? 'text-emerald-400' : 'text-amber-400'}>
                      {plan.isActive ? 'Active' : 'Paused'}
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const url = await buildSubscriptionTokenLink(plan)
                        if (!url) return
                      }}
                      title="Copy subscription link"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy link</span>
                    </Button>
                    {typeof window !== 'undefined' && (
                      <ShareLinkButton
                        url={buildPaymentLink(plan.planName)}
                        title={`Subscribe to ${plan.planName}`}
                        text={`Subscribe to ${plan.planName} (${plan.billingCycle} days) on SolPay.`}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
