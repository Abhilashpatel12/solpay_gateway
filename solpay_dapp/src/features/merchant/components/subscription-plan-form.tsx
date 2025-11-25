'use client'

import { FormEvent, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export type SubscriptionPlanDraft = {
  planName: string
  planPriceLamports: number
  billingCycleDays: number
  isActive: boolean
}

type SubscriptionPlanFormProps = {
  onSubmit?: (draft: SubscriptionPlanDraft) => void
}

export function SubscriptionPlanForm({ onSubmit }: SubscriptionPlanFormProps) {
  const [planName, setPlanName] = useState('')
  const [planPriceLamports, setPlanPriceLamports] = useState('')
  const [billingCycleDays, setBillingCycleDays] = useState('30')
  const [supportedTokensRaw, setSupportedTokensRaw] = useState('')
  const [isActive, setIsActive] = useState(true)

  const isValid =
    planName.trim().length > 0 &&
    Number(planPriceLamports) > 0 &&
    Number(billingCycleDays) > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return

    const draft: SubscriptionPlanDraft = {
      planName: planName.trim(),
      planPriceLamports: Number(planPriceLamports),
      billingCycleDays: Number(billingCycleDays),
      isActive,
    }

    onSubmit?.(draft)
    console.info('plan draft prepared for initializeSubscriptionPlan:', draft)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription plans</CardTitle>
        <CardDescription>
          Capture plan inputs for `initializeSubscriptionPlan`. Billing cycle is expressed in days for the UI but will
          map to the on-chain `billing_cycle` u8. All plans are created for native SOL payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="plan-name">Plan name</Label>
            <Input
              id="plan-name"
              placeholder="Premium"
              value={planName}
              onChange={(event) => setPlanName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-price">Plan price (integer lamports)</Label>
            <Input
              id="plan-price"
              type="number"
              min="1"
              placeholder="100000000"
              value={planPriceLamports}
              onChange={(event) => setPlanPriceLamports(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token-mint">Primary token mint</Label>
            <Input id="token-mint" value="SOL" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-cycle">Billing cycle (days)</Label>
            <Input
              id="billing-cycle"
              type="number"
              min="1"
              value={billingCycleDays}
              onChange={(event) => setBillingCycleDays(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-supported-tokens">Additional supported tokens</Label>
            <Input
              id="plan-supported-tokens"
              placeholder="Comma separated list"
              value={supportedTokensRaw}
              onChange={(event) => setSupportedTokensRaw(event.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Must contain at least one mint; `initializeSubscriptionPlan` rejects empty vectors and zero billing cycles.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="plan-active"
              type="checkbox"
              className="h-4 w-4"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <Label htmlFor="plan-active">Plan is active</Label>
          </div>
          <Button type="submit" disabled={!isValid} className="w-full">
            Prepare initializeSubscriptionPlan
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
