
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="px-6 pb-32 md:px-12">
      <div className="mx-auto max-w-4xl rounded-[40px] border border-white/10 bg-gradient-to-br from-primary-600/30 via-primary-500/10 to-emerald-400/20 p-12 text-center shadow-[0_40px_160px_rgba(0,0,0,0.45)]">
        <p className="text-sm uppercase tracking-[0.35em] text-white/60">Open-source starter</p>
        <h2 className="mt-4 text-4xl font-semibold">Clone the repo, connect a wallet, and deploy SolPay today.</h2>
        <p className="mt-4 text-white/80">
          Ship the landing page, dashboards, and wallet automations in one go. This workspace includes IDLs, sample programs, and
          drop-in UI so you can focus on what makes your product magical.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild className="px-8 py-6 text-base">
            <Link href="/merchant">Enter merchant console</Link>
          </Button>
          <Button asChild variant="ghost" className="px-8 py-6 text-base text-white">
            <Link href="https://solana.com" target="_blank" rel="noreferrer">
              View SolPay docs
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
