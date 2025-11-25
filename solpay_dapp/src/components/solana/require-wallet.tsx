'use client'

import { ReactNode } from 'react'
import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function RequireWallet({ children }: { children: ReactNode }) {
  const { publicKey } = useSolana()

  if (!publicKey) {
    return (
      <section className="py-10">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Connect wallet to continue</CardTitle>
            <CardDescription>
              SolPay is currently hard-locked to Solana devnet. Please connect a devnet-funded wallet to unlock the
              merchant and customer dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletDropdown />
          </CardContent>
        </Card>
      </section>
    )
  }

  return <>{children}</>
}
