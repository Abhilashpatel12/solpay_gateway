'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { cn } from '@/lib/utils'

import { useMerchant } from '@/features/merchant/hooks/use-merchant'

const WalletDropdown = dynamic(() => import('@/components/wallet-dropdown').then((m) => m.WalletDropdown), {
  ssr: false,
})

const ClusterDropdown = dynamic(() => import('@/components/cluster-dropdown').then((m) => m.ClusterDropdown), {
  ssr: false,
})

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const isLanding = pathname === '/'
  const { data: merchant } = useMerchant()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-white/5 backdrop-blur-2xl transition-colors duration-300',
        isLanding ? 'bg-black/40' : 'bg-black/70',
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-white/70">
            Solpay
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {/* Navigation links removed as per request */}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <WalletDropdown />
          <ClusterDropdown />
          <ThemeSelect />
          <Button asChild variant="ghost" size="sm" className="hidden text-xs uppercase tracking-[0.2em] lg:inline-flex">
            <Link href="/customer">My Subscriptions</Link>
          </Button>
          {isLanding && !merchant && (
            <Button asChild size="sm" className="hidden text-xs uppercase tracking-[0.4em] lg:inline-flex">
              <Link href="/merchant">Launch Console</Link>
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowMenu((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {showMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {showMenu && (
        <div className="md:hidden">
          <div className="space-y-6 border-t border-white/5 bg-black/90 px-4 pb-6 pt-4 text-sm uppercase text-white/70">
            <div className="flex flex-wrap gap-3">
              <WalletDropdown />
              <ClusterDropdown />
              <ThemeSelect />
            </div>
            <div className="flex flex-col gap-4 pt-4">
              <Link href="/customer" className="block hover:text-white" onClick={() => setShowMenu(false)}>
                My Subscriptions
              </Link>
              <Link href="/merchant" className="block hover:text-white" onClick={() => setShowMenu(false)}>
                Merchant Console
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
