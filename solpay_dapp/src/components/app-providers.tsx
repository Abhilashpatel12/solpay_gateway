'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { ClusterProvider } from '@/components/solana/cluster-provider'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ClusterProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </ClusterProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
