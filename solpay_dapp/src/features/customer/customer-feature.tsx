import { UserSubscriptionsPanel } from '@/features/customer/components/user-subscriptions-panel'

export function CustomerFeature() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Customer Console</p>
        <h1 className="text-3xl font-semibold tracking-tight">My subscriptions</h1>
      </header>

      <section>
        <UserSubscriptionsPanel />
      </section>
    </div>
  )
}
