import { MerchantFeature } from '@/features/merchant/merchant-feature'

export const dynamic = 'force-dynamic'

export default function MerchantPage() {
  return (
    <main className="container py-10">
      <MerchantFeature />
    </main>
  )
}
