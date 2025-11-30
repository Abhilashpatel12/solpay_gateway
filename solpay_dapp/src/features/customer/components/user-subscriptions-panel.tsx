'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserSubscriptions } from '../hooks/use-user-subscriptions'
import { useCancelSubscription } from '../hooks/use-cancel-subscription'
import { Loader2 } from 'lucide-react'
import { ellipsify } from '@/lib/utils'
import { useWallet } from '@solana/wallet-adapter-react'

export function UserSubscriptionsPanel() {
  const { connected } = useWallet()
  const { data: subscriptions, isLoading } = useUserSubscriptions()
  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription()

  if (!connected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My subscriptions</CardTitle>
          <CardDescription>Connect your wallet to view your active subscriptions.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My subscriptions</CardTitle>
        <CardDescription>
          Manage your active recurring payments.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !subscriptions?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No subscriptions found.
          </div>
        ) : (
          subscriptions.map((entry: any) => (
            <div key={entry.publicKey.toString()} className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-md px-4 py-3 gap-4">
              <div>
                <p className="font-medium text-lg">{entry.plan?.planName || 'Unknown Plan'}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Merchant: {ellipsify(entry.account.merchantAddress.toString())}</p>
                  <p>Next billing: {new Date(entry.account.nextBillingDate.toNumber() * 1000).toLocaleDateString()}</p>
                  <p>Price: {entry.plan?.planPrice.toString()} lamports</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.account.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {entry.account.isActive ? 'Active' : 'Cancelled'}
                    </span>
                {entry.account.isActive && (
                    <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={isCancelling}
                        onClick={() => cancelSubscription({
                            userSubscriptionPda: entry.publicKey,
                            subscriptionPlanPda: entry.account.subscriptionPlan
                        })}
                    >
                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel'}
                    </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
