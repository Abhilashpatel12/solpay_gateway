import { PlanDetailsFeature } from '@/features/merchant/plan-details-feature'

export const dynamic = 'force-dynamic'

export default async function PlanDetailsPage(props: { params: Promise<{ plan: string }> }) {
  const { plan } = await props.params
  const planName = decodeURIComponent(plan)

  return (
    <main className="container py-10">
      <PlanDetailsFeature planName={planName} />
    </main>
  )
}
