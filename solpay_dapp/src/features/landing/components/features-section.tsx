
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { features } from '../landing-page.data';

export function FeaturesSection() {
  return (
    <section className="px-6 pb-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary-300">SolPay control tower</p>
            <h2 className="mt-3 text-3xl font-semibold">Design for trust, scale for volume.</h2>
          </div>
          <Button asChild variant="ghost" className="gap-2 text-white/70">
            <Link href="/merchant" className="inline-flex items-center">
              Dive into merchant ops <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="relative flex h-full flex-col rounded-3xl border border-white/5 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm text-white/70">{feature.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {feature.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
