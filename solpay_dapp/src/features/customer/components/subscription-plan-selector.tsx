'use client'

import { useState, FormEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const mockPlans = [
  {
    planName: 'Premium',
    planPda: 'subscr_premium',
    merchant: 'MerchantOne1111111111111111111111111111111',
    billingCycleDays: 30,
    priceLamports: 100_000_000,
    supportedTokens: ['USDCxxxx'],
  },
  {
    planName: 'Starter',
    planPda: 'subscr_starter',
    merchant: 'MerchantTwo2222222222222222222222222222222',
    billingCycleDays: 7,
    priceLamports: 10_000_000,
    supportedTokens: ['SOLwrapped'],
  },
]

type SubscriptionPlanSelectorProps = {
  onSubscribe?: (payload: {
    subscriptionPlan: string
    nextBillingDate: string
    supportedTokens: string[]
  }) => void
}

export function SubscriptionPlanSelector({ onSubscribe }: SubscriptionPlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState(mockPlans[0])
  const [nextBillingDate, setNextBillingDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [supportedTokensRaw, setSupportedTokensRaw] = useState(selectedPlan.supportedTokens.join(', '))

  const supportedTokens = supportedTokensRaw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = {
      subscriptionPlan: selectedPlan.planPda,
      nextBillingDate,
      supportedTokens,
    }
    onSubscribe?.(payload)
    console.info('prepare initializeUserSubscription payload:', payload)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available plans</CardTitle>
        <CardDescription>
          Auto-fetched subscription plans will populate this switcher. Selecting one will derive
          <code className="mx-1 rounded bg-black/40 px-1 py-0.5 text-xs">{'["user_subscription", planPda, wallet]'}</code>
          before sending <code className="mx-1 rounded bg-black/40 px-1 py-0.5 text-xs">initializeUserSubscription</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="plan-selector">Plan</Label>
            <select
              id="plan-selector"
              className="border rounded-md px-3 py-2 w-full"
              value={selectedPlan.planPda}
              onChange={(event) => {
                const plan = mockPlans.find((entry) => entry.planPda === event.target.value)
                if (plan) {
                  setSelectedPlan(plan)
                  setSupportedTokensRaw(plan.supportedTokens.join(', '))
                }
              }}
            >
              {mockPlans.map((plan) => (
                <option key={plan.planPda} value={plan.planPda}>
                  {plan.planName} · {plan.priceLamports.toLocaleString()} lamports every {plan.billingCycleDays} days
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="next-billing-date">Next billing date</Label>
            <Input
              id="next-billing-date"
              type="date"
              value={nextBillingDate}
              onChange={(event) => setNextBillingDate(event.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The contract expects a Unix timestamp (`i64`). Once the Solana helper wiring lands, we will convert this
              ISO date to a BN timestamp before invoking the instruction.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Token</Label>
            <Input id="plan-supported" value="SOL (native)" disabled />
          </div>

          <Button type="submit" className="w-full">
            Prepare initializeUserSubscription
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
