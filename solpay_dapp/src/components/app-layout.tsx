'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import React from 'react'
import { AppFooter } from '@/components/app-footer'
import { ClusterUiChecker } from '@/features/cluster/ui/cluster-ui-checker'
import { AccountUiChecker } from '@/features/account/ui/account-ui-checker'
import { RequireWallet } from '@/components/solana/require-wallet'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  const gatedExperience = (
    <ClusterUiChecker>
      <RequireWallet>
        <AccountUiChecker />
        {children}
      </RequireWallet>
    </ClusterUiChecker>
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex flex-col min-h-screen">
        <AppHeader links={links} />
        <main className={cn('flex-grow w-full', isLanding ? 'px-0' : 'container mx-auto px-4 py-6')}>
          {isLanding ? children : gatedExperience}
        </main>
        <AppFooter />
      </div>
      <Toaster closeButton />
    </ThemeProvider>
  )
}
