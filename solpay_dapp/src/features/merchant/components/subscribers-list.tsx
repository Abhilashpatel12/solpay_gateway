import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { useMerchantSubscriptions } from '../hooks/use-merchant-subscriptions'
import { ellipsify } from '@/lib/utils'
import type { UserSubscription } from '@/types/solpay_smartcontract'
import type { PublicKey } from '@solana/web3.js'

interface MerchantSubscription extends UserSubscription {
  publicKey: PublicKey
}

export function SubscribersList({ merchantAddress }: { merchantAddress?: string }) {
  const { data: subscriptions, isLoading } = useMerchantSubscriptions(merchantAddress)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribers</CardTitle>
        <CardDescription>
          Active and past subscriptions for your plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !subscriptions?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No subscribers yet. Share your plan links!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscriber</TableHead>
                <TableHead>Plan ID</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub: MerchantSubscription) => (
                <TableRow key={sub.publicKey.toString()}>
                  <TableCell className="font-medium font-mono">
                    {ellipsify(sub.subscriber.toString())}
                  </TableCell>
                  <TableCell className="font-mono">
                    {ellipsify(sub.subscriptionPlan.toString())}
                  </TableCell>
                  <TableCell>
                    {new Date(sub.startDate.toNumber() * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(sub.nextBillingDate.toNumber() * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sub.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {sub.isActive ? 'Active' : 'Cancelled'}
                    </span>
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
