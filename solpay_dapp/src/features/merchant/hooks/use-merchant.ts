import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { getMerchantPda } from '@/lib/solana/pdas'
import { getProgram } from '@/lib/solana/program'

export function useMerchant() {
  const wallet = useWallet()

  return useQuery({
    queryKey: ['merchant', wallet.publicKey?.toString()],
    queryFn: async () => {
      if (!wallet.publicKey) return null

      const program = getProgram(wallet)
      const [merchantPda] = getMerchantPda(wallet.publicKey)

      try {
        const merchantAccount = await (program.account as any).merchantRegistration.fetch(merchantPda)
        return merchantAccount
      } catch {
        return null
      }
    },
    enabled: !!wallet.publicKey,
  })
}
