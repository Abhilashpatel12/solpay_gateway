import { CustomerFeature } from '@/features/customer/customer-feature'

export const dynamic = 'force-dynamic'

export default function CustomerPage() {
  return (
    <main className="container py-10">
      <CustomerFeature />
    </main>
  )
}
