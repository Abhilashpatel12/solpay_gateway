
import { Check } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { chartData } from '../landing-page.data';

export function IntelligenceSection() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[32px] border border-white/10 bg-black/30 p-10 backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-primary-200">Realtime intelligence</p>
          <h2 className="text-3xl font-semibold leading-tight">
            Instrument every checkout with out-of-the-box analytics, streaming alerts, and developer-first tools.
          </h2>
          <p className="text-white/70">
            Inspect signatures, wallet health, and risk posture in one glass dashboard. Pipe the same feeds into your stack via
            SolPay webhooks, GraphQL, or the lightweight TypeScript SDK bundled in this repo.
          </p>
          <ul className="space-y-4 text-sm text-white/70">
            {[
              'SDK snippets for React, Next.js, and native mobile wallets',
              'Realtime policy engine with preview + diff mode',
              'Export-ready ledgers for finance, tax, and audit teams',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/80">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                  <Check className="h-4 w-4" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <code className="block whitespace-pre-wrap text-sm text-emerald-100">
              {`import { SolPayClient } from '@solpay/sdk'

const client = new SolPayClient({ cluster: 'devnet' })
const { ledger, settlement } = await client.payouts.stream()

console.log('USDC settled in', settlement.latencyMs, 'ms')`}
            </code>
          </div>
        </div>
        <div className="glass-panel rounded-[28px] border-white/5 bg-white/5 p-6 shadow-[0_25px_120px_rgba(20,241,149,0.15)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Settlement velocity</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">+62% faster</p>
            </div>
            <div className="rounded-2xl bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
              realtime
            </div>
          </div>
          <div className="mt-8 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14f195" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#14f195" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#666" tickLine={false} axisLine={false} dy={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0c10',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#14f195" strokeWidth={2.5} fillOpacity={1} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid gap-4 text-sm text-white/70 md:grid-cols-2">
            {[{ label: 'Alerts fired', value: '312 this week' }, { label: 'Automations live', value: '87 flows' }].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.label}</p>
                <p className="mt-2 text-lg text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
