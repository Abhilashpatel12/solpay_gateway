'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MerchantRegistrationForm } from '@/features/merchant/components/merchant-registration-form'
import { SubscriptionPlanForm } from '@/features/merchant/components/subscription-plan-form'
import { PlansPreview } from '@/features/merchant/components/plans-preview'
import { OneTimePaymentForm } from '@/features/merchant/components/one-time-payment-form'
import { SubscribersList } from '@/features/merchant/components/subscribers-list'
import { useMerchant } from './hooks/use-merchant'
import { useInitializeMerchant } from './hooks/use-initialize-merchant'
import { useInitializeSubscriptionPlan } from './hooks/use-initialize-subscription-plan'
import { useMerchantTransactions } from './hooks/use-merchant-transactions'
import { useMerchantSubscriptions } from './hooks/use-merchant-subscriptions'
import { DashboardStats } from './components/dashboard-stats'
import { lamportsToSol } from '@/lib/solana/utils'
import { RevenueChart } from './components/revenue-chart'
import { RecentTransactions } from './components/recent-transactions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MerchantFeature() {
  const { connected } = useWallet()
  const { data: merchant, isLoading } = useMerchant()
  const { mutate: initializeMerchant } = useInitializeMerchant()
  const { mutate: initializePlan } = useInitializeSubscriptionPlan()
  
  const merchantAddress = merchant?.merchantAddress.toString()
  const { data: transactions } = useMerchantTransactions(merchantAddress)
  const { data: subscriptions } = useMerchantSubscriptions(merchantAddress)

  // Derived Stats
  const totalRevenue = transactions?.reduce((acc: any, tx: any) => acc + tx.amount, 0) || 0
  const activeSubscribers = subscriptions?.filter((s: any) => s.isActive).length || 0
  const totalTransactions = transactions?.length || 0
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

  // Convert lamports -> SOL for display
  const totalRevenueSol = lamportsToSol(totalRevenue)
  const avgTransactionValueSol = lamportsToSol(avgTransactionValue)

  // Chart Data
  const dailyRevenue = transactions?.reduce((acc: Map<number, { amount: number }>, tx: any) => {
    const day = new Date(tx.createdAt * 1000);
    day.setHours(0, 0, 0, 0);
    const dayTimestamp = day.getTime();

    if (!acc.has(dayTimestamp)) {
      acc.set(dayTimestamp, { amount: 0 });
    }
    acc.get(dayTimestamp)!.amount += tx.amount;
    return acc;
  }, new Map<number, { amount: number }>());

  const chartData = dailyRevenue 
    ? Array.from(dailyRevenue.entries())
      .map(([timestamp, data]: any) => ({
        date: new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount: data.amount,
        timestamp,
      }))
      .sort((a: any, b: any) => a.timestamp - b.timestamp)
    : [];


  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <h2 className="text-2xl font-bold">Connect your wallet</h2>
        <p className="text-muted-foreground max-w-md">
          Connect your Solana wallet to access the merchant dashboard or register a new merchant account.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading merchant data...</div>
      </div>
    )
  }

  if (!merchant) {
    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to SolPay</h1>
          <p className="text-muted-foreground max-w-2xl">
            Register your merchant account to start accepting payments.
          </p>
        </header>
        <div className="max-w-xl mx-auto mt-8">
          <MerchantRegistrationForm onSubmit={initializeMerchant} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance.
          </p>
        </div>
        <div className="flex items-center space-x-2">
           <div className="text-right hidden md:block">
             <div className="text-sm font-medium">{merchant.merchantName}</div>
             <div className="text-xs text-muted-foreground">{merchant.merchantWeburl}</div>
           </div>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DashboardStats 
            totalRevenue={totalRevenueSol}
            activeSubscribers={activeSubscribers}
            totalTransactions={totalTransactions}
            avgTransactionValue={avgTransactionValueSol}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <RevenueChart data={chartData as any} />
            </div>
            <div className="col-span-3">
              <RecentTransactions transactions={transactions || []} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Create New Plan</h3>
              <SubscriptionPlanForm onSubmit={initializePlan} />
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Active Plans</h3>
              <PlansPreview merchantAddress={merchantAddress} />
            </div>
          </div>

          <div className="pt-6">
            <SubscribersList merchantAddress={merchantAddress} />
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <OneTimePaymentForm merchantAddress={merchantAddress} />
            <RecentTransactions transactions={transactions || []} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
