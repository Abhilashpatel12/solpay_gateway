import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'

export function useMerchantSubscriptions(merchantAddress?: string) {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['merchant-subscriptions', merchantAddress, { cluster: 'devnet' }],
    queryFn: async () => {
      if (!merchantAddress) {
        return []
      }

      const program = getProgram(wallet)

      try {
        // UserSubscription layout:
        // discriminator: 8
        // subscriber: 32
        // subscription_plan: 32
        // start_date: 8
        // next_billing_date: 8
        // is_active: 1
        // merchant_address: 32  <-- We want to filter by this
        
        // Offset = 8 + 32 + 32 + 8 + 8 + 1 = 89
        
        const subscriptions = await (program.account as any).user_subscription.all([
          {
            memcmp: {
              offset: 89,
              bytes: merchantAddress,
            },
          },
        ])

        return subscriptions.map((sub: any) => ({
          publicKey: sub.publicKey,
          ...sub.account,
        }))
      } catch (error) {
        console.error('Error fetching merchant subscriptions:', error)
        return []
      }
    },
    enabled: !!merchantAddress,
  })
}
