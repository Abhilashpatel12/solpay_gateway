
import { BarChart3, ShieldCheck, Zap } from 'lucide-react';

export const stats = [
  { label: 'processed daily volume', value: '$128M+', trend: '+18% MoM' },
  { label: 'average authorization', value: '99.3%', trend: 'real-time risk net' },
  { label: 'countries supported', value: '190+', trend: '24/7 compliance ops' },
];

export const logos = ['Helius', 'Backpack', 'Tensor', 'Jupiter', 'Phantom', 'Ledger'];

export const features = [
  {
    title: 'Instant global settlement',
    description: 'Stream card and wallet flows straight into Solana accounts with sub-second confirmation and auto-routing.',
    icon: Zap,
    highlights: ['<200ms clears', 'Adaptive routing', 'Dynamic fees'],
  },
  {
    title: 'Enterprise-grade security',
    description: 'Programmable 3DS, device fingerprinting, and MPC custody guard every checkout without hurting conversion.',
    icon: ShieldCheck,
    highlights: ['Segregated vaults', 'Realtime AML', 'Configurable policies'],
  },
  {
    title: 'Unified payouts + data',
    description: 'Move stablecoins, FX, or reward tokens from a single ledger with streaming analytics you can embed anywhere.',
    icon: BarChart3,
    highlights: ['Ledger APIs', 'Webhooks', 'Embedded BI'],
  },
];

export const timelines = [
  {
    title: 'Day 0 — Prototype',
    body: 'Drop-in widget + sandbox wallets. Simulate live settlement on devnet instantly.',
  },
  {
    title: 'Week 1 — Pilot merchants',
    body: 'Provision dedicated clusters, wire risk signals, and invite first SolPay merchants.',
  },
  {
    title: 'Month 1 — Scale globally',
    body: 'Automate compliance bundles, enable programmable payouts, and monitor net settlement in a single view.',
  },
];

export const testimonials = [
  {
    quote:
      'SolPay replaced five separate payment vendors. Our teams ship new regional checkouts in hours instead of weeks.',
    author: 'Nia Calderón, COO @ Tensor',
  },
  {
    quote: 'Chargebacks dropped 42% after turning on SolPay risk rails. Real-time alerts let us react before fraud lands.',
    author: 'Arjun Patel, Risk Lead @ Jupiter',
  },
];

export const chartData = [
  { label: '00:00', value: 22 },
  { label: '04:00', value: 38 },
  { label: '08:00', value: 41 },
  { label: '12:00', value: 56 },
  { label: '16:00', value: 72 },
  { label: '20:00', value: 64 },
  { label: '24:00', value: 88 },
];
