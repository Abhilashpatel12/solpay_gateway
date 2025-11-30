import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import { PublicKey } from '@solana/web3.js'

export function useMerchantPlans(merchantAddress?: string) {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['subscription-plans', merchantAddress],
    queryFn: async () => {
      if (!merchantAddress) return []

      const program = getProgram(wallet)
      // const merchantPubkey = new PublicKey(merchantAddress)

      try {
        // Fetch all subscription plans for this merchant
        // We filter by the merchant_address field in the account data
        // The offset for merchant_address in SubscriptionPlan struct is:
        // 8 (discriminator) + 4 + plan_name_length + 8 (price) + 32 (mint) + 1 (cycle) + 1 (active) + 8 (created)
        // This is variable due to string length, so .all() with memcmp is tricky if the string is first.
        // However, Anchor .all() allows filtering.
        // But wait, plan_name is a String, so it's variable length.
        // merchant_address is after variable length fields.
        // So we can't easily use memcmp for merchant_address unless we know the exact offset.
        
        // Instead, we can fetch ALL plans and filter in JS for now (not efficient for prod but works for MVP)
        // OR better: The PDA seeds include merchant address!
        // seeds = [b"subscription", plan_name.as_bytes(), merchant_address.key().as_ref()]
        // But we don't know the plan names to derive the PDAs.
        
        // So fetching all and filtering is the way for now unless we add a secondary index or fixed offsets.
        // Let's fetch all and filter.
        
          const allPlans = await (program.account as any).subscriptionPlan.all()
        
        return allPlans
            .filter((account: any) => account.account.merchantAddress.toString() === merchantAddress)
          .map((account: any) => ({
            publicKey: account.publicKey,
            ...account.account
          }))
      } catch (e) {
        console.error('Error fetching plans:', e)
        return []
      }
    },
    enabled: !!merchantAddress,
  })
}
