'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { lamportsToSol } from '@/lib/solana/utils'

function formatSol(value: number) {
  if (!isFinite(value)) return '0'
  if (Math.abs(value - Math.round(value)) < 1e-9) return value.toLocaleString()
  return Number(value.toFixed(6)).toString()
}
import { useMerchant } from './hooks/use-merchant'
import { useMerchantSubscriptions } from './hooks/use-merchant-subscriptions'
import { useMerchantPlans } from './hooks/use-merchant-plans'
import { useUpdateSubscriptionPlan } from './hooks/use-update-subscription-plan'
import { useMerchantPlanTransactions } from './hooks/use-merchant-plan-transactions'

export function PlanDetailsFeature({ planName }: { planName: string }) {
  const { connected } = useWallet()
  const router = useRouter()
  const { data: merchant } = useMerchant()
  const merchantAddress = merchant?.merchantAddress.toString()

  const { data: plans, isLoading: isPlansLoading } = useMerchantPlans(merchantAddress)
  const { data: subscriptions, isLoading: isSubsLoading } = useMerchantSubscriptions(merchantAddress)
  const { mutate: updatePlan, isPending: isUpdating } = useUpdateSubscriptionPlan()

  const plan = plans?.find((p) => p.planName === planName)
  const planSubscribers = subscriptions?.filter((s) => s.subscriptionPlan.toString() === plan?.publicKey.toString()) || []
  const activeSubscribers = planSubscribers.filter((s) => s.isActive).length

  const { data: planTransactions = [] } = useMerchantPlanTransactions(
    merchantAddress,
    plan?.publicKey.toString()
  )

  const totalEarnedLamports = planTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0)
  const totalEarnedSol = lamportsToSol(totalEarnedLamports)

  const chartData = planTransactions
    .slice()
    .sort((a: any, b: any) => a.createdAt - b.createdAt)
    .reduce((acc: any[], tx: any) => {
      const date = new Date(tx.createdAt * 1000)
      const label = `${date.getDate()}/${date.getMonth() + 1}`
      const existing = acc.find((d) => d.date === label)
      if (existing) {
        existing.amount += lamportsToSol(tx.amount)
      } else {
        acc.push({ date: label, amount: lamportsToSol(tx.amount) })
      }
      return acc
    }, [])

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <h2 className="text-2xl font-bold">Connect your wallet</h2>
        <p className="text-muted-foreground max-w-md">Connect your wallet to view and manage this plan.</p>
      </div>
    )
  }

  if (isPlansLoading || isSubsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold">Plan not found</p>
        <Button variant="outline" onClick={() => router.push('/merchant')}>
          Back to Merchant Dashboard
        </Button>
      </div>
    )
  }


  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/merchant')}>
        c Back to dashboard
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{plan.planName}</CardTitle>
            <CardDescription>Primary configuration and lifecycle controls for this subscription plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-semibold">{plan.planPrice.toString()}</span>
              <span className="text-sm text-muted-foreground">SOL / {plan.billingCycle} days</span>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Status</span>
                <span className={plan.isActive ? 'text-emerald-400' : 'text-amber-400'}>
                  {plan.isActive ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Token</span>
                <span className="font-mono text-xs">SOL (native)</span>
              </div>
              <div className="flex justify-between">
                <span>Merchant</span>
                <span className="font-mono text-xs truncate max-w-[260px]" title={merchantAddress}>
                  {merchantAddress}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() =>
                  updatePlan({
                    planPda: plan.publicKey,
                    isActive: !plan.isActive,
                  })
                }
                disabled={isUpdating || (plan.isActive && activeSubscribers > 0)}
              >
                {plan.isActive ? 'Pause plan' : 'Activate plan'}
              </Button>
              {plan.isActive && activeSubscribers > 0 && (
                <p className="mt-2 text-xs text-amber-400">
                  You cannot pause this plan while there are active subscriptions.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan analytics</CardTitle>
            <CardDescription>At-a-glance performance for this plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Active subscribers</span>
              <span className="font-semibold">{activeSubscribers}</span>
            </div>
            <div className="flex justify-between">
              <span>Total subscribers</span>
              <span className="font-semibold">{planSubscribers.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total earned</span>
              <span className="font-semibold">{formatSol(totalEarnedSol)} SOL</span>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue over time</CardTitle>
            <CardDescription>Daily aggregated earnings for this plan.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet for this plan.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -20, right: 12, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
