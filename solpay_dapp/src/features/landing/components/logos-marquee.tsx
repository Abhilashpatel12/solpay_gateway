
import { logos } from '../landing-page.data';

export function LogosMarquee() {
  return (
    <section className="px-6 pb-12 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-6 rounded-3xl border border-white/5 bg-black/30 px-10 py-6 text-white/40">
        {logos.map((logo) => (
          <span key={logo} className="text-sm uppercase tracking-[0.3em] text-white/60">
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}
