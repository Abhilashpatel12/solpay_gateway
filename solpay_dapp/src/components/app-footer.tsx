'use client'

import Link from 'next/link'

export function AppFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-white/5 bg-black/60 text-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">SolPay</p>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Open-source Solana payment gateway starter. Ship stunning landing pages, instrumented dashboards, and production
              wallet flows without reinventing the stack.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-white/60">
            <Link 
              href="https://github.com/Abhilashpatel12/solpay_gateway" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-white"
            >
              GitHub
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 border-t border-white/5 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} SolPay Labs. Built with create-solana-dapp.</span>
        </div>
      </div>
    </footer>
  )
}
