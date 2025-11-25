
import { stats } from '../landing-page.data';

export function StatsSection() {
  return (
    <section className="px-6 pb-20 md:px-12">
      <div className="mx-auto grid max-w-6xl gap-6 rounded-[32px] border border-white/5 bg-white/5 p-8 backdrop-blur-3xl md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-panel rounded-2xl p-6 text-center shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">{stat.label}</p>
            <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
            <p className="mt-2 text-sm text-emerald-300">{stat.trend}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
