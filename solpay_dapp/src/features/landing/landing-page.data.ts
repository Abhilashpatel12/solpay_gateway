
import { BarChart3, ShieldCheck, Zap } from 'lucide-react';

// Only keep explanatory feature data for the landing page. Removed
// mock stats, logos, timelines, testimonials, and chart data.
export const features = [
  {
    title: 'Instant global settlement',
    description:
      'Stream card and wallet flows straight into Solana accounts with sub-second confirmation and auto-routing.',
    icon: Zap,
    highlights: ['<200ms clears', 'Adaptive routing', 'Dynamic fees'],
  },
  {
    title: 'Enterprise-grade security',
    description:
      'Programmable 3DS, device fingerprinting, and MPC custody guard every checkout without hurting conversion.',
    icon: ShieldCheck,
    highlights: ['Segregated vaults', 'Realtime AML', 'Configurable policies'],
  },
  {
    title: 'Unified payouts + data',
    description:
      'Move stablecoins, FX, or reward tokens from a single ledger with streaming analytics you can embed anywhere.',
    icon: BarChart3,
    highlights: ['Ledger APIs', 'Webhooks', 'Embedded BI'],
  },
];

// Export empty placeholders for removed mock data so unused components that
// still import these names do not break the build. These intentionally carry
// no mock content — landing page only uses `features` for explanatory text.
export const stats: any[] = []
export const logos: string[] = []
export const timelines: any[] = []
export const testimonials: any[] = []
export const chartData: any[] = []
