
import { timelines } from '../landing-page.data';

export function TimelineSection() {
  return (
    <section className="px-6 pb-24 md:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.35em] text-primary-200">Velocity roadmap</p>
        <h2 className="mt-3 text-3xl font-semibold">From hackathon to global rollout.</h2>
        <div className="mt-10 space-y-6">
          {timelines.map((item, index) => (
            <div key={item.title} className="relative rounded-3xl border border-white/5 bg-white/5 p-6">
              <div className="absolute left-6 top-0 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/50">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-white/70">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
