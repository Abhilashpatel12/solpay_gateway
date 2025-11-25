
import { Zap } from 'lucide-react';

export function ComparisonSection() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.35em] text-primary-200">The SolPay Advantage</p>
          <h2 className="mt-3 text-3xl font-semibold">Stop renting your payment stack.</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stripe / Traditional */}
          <div className="rounded-[32px] border border-white/5 bg-white/5 p-8 opacity-70">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-xl">🏦</span>
              </div>
              <h3 className="text-xl font-semibold">Traditional Gateways</h3>
            </div>

            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✕</span>
                <div>
                  <p className="font-medium text-white">2.9% + 30¢ per transaction</p>
                  <p className="text-sm text-white/50">High fees eat into your margins</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✕</span>
                <div>
                  <p className="font-medium text-white">T+2 days settlement</p>
                  <p className="text-sm text-white/50">Cashflow locked in banking rails</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✕</span>
                <div>
                  <p className="font-medium text-white">Chargeback risk</p>
                  <p className="text-sm text-white/50">Revenue can be clawed back months later</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-400 mt-1">✕</span>
                <div>
                  <p className="font-medium text-white">Restricted Geographies</p>
                  <p className="text-sm text-white/50">Limited by local banking infrastructure</p>
                </div>
              </li>
            </ul>
          </div>

          {/* SolPay / Ours */}
          <div className="rounded-[32px] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="size-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">SolPay Gateway</h3>
            </div>

            <ul className="space-y-6">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <div>
                  <p className="font-medium text-white">~0% fees ($0.00025)</p>
                  <p className="text-sm text-white/50">Keep 100% of your revenue</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <div>
                  <p className="font-medium text-white">Instant Settlement (400ms)</p>
                  <p className="text-sm text-white/50">Funds in your wallet immediately</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <div>
                  <p className="font-medium text-white">Zero Chargebacks</p>
                  <p className="text-sm text-white/50">Finality is absolute and immutable</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <div>
                  <p className="font-medium text-white">Global & Permissionless</p>
                  <p className="text-sm text-white/50">Accept payments from anyone, anywhere</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
