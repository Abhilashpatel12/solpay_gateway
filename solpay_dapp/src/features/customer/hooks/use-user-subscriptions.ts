import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import type { 
  AccountWrapper, 
  UserSubscription, 
  SubscriptionPlan,
  EnrichedUserSubscription 
} from '@/types/solpay_smartcontract'

export function useUserSubscriptions() {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['user-subscriptions', wallet.publicKey?.toString()],
    queryFn: async (): Promise<EnrichedUserSubscription[]> => {
      if (!wallet.publicKey) return []

      const program = getProgram(wallet)

      try {
        // UserSubscription layout:
        // discriminator: 8
        // subscriber: 32  <-- We want to filter by this
        
        // Offset = 8
        
        const subscriptions = await (program.account as { userSubscription: { all: (filters: unknown[]) => Promise<AccountWrapper<UserSubscription>[]> } }).userSubscription.all([
          {
            memcmp: {
              offset: 8,
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ])

        // We also need to fetch the plan details for each subscription to show the plan name
        // This might be N+1 but for a user dashboard with few subs it's fine.
        // Alternatively we could fetch all plans and map them, but that's heavy.
        // Let's fetch plan details individually for now.
        
        const enrichedSubscriptions = await Promise.all(
          subscriptions.map(async (sub: AccountWrapper<UserSubscription>): Promise<EnrichedUserSubscription> => {
            try {
              const planAccount = await (program.account as { subscriptionPlan: { fetch: (pubkey: unknown) => Promise<SubscriptionPlan> } }).subscriptionPlan.fetch(sub.account.subscriptionPlan)
              return {
                publicKey: sub.publicKey,
                account: sub.account,
                plan: planAccount
              }
            } catch {
              // Plan might be closed or error?
              return {
                publicKey: sub.publicKey,
                account: sub.account,
                plan: null
              }
            }
          })
        )

        return enrichedSubscriptions
      } catch (error) {
        console.error('Error fetching user subscriptions:', error)
        return []
      }
    },
    enabled: !!wallet.publicKey,
  })
}
