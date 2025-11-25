
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative px-6 pb-24 pt-24 sm:pt-28 md:px-12">
      <div className="mx-auto max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
        >
          <Sparkles className="size-3.5 text-primary-300" />
          Ultimate SolPay Release
        </motion.div>
        <motion.h1
          className="mt-8 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          Build a world-class Solana payment gateway in one weekend.
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-3xl text-balance text-lg text-white/70"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Launch magical checkouts, orchestrate wallets, and reconcile payouts with a single composable stack. SolPay gives you
          the design system, wallet wiring, and analytics to out-ship legacy PSPs overnight.
        </motion.p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild className="group px-8 py-6 text-base shadow-[0_20px_80px_rgba(153,69,255,0.35)]">
            <Link href="/merchant" className="inline-flex items-center gap-2">
              Launch SolPay Checkout
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-white/5 px-8 py-6 text-base text-white hover:bg-white/10"
          >
            <Link href="/customer">Explore customer view</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
