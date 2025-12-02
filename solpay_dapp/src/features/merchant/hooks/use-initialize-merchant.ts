import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { prepareInitializeMerchant } from '@/lib/solana/transactions'
import { PublicKey } from '@solana/web3.js'
import { toast } from 'sonner'
import { MerchantRegistrationDraft } from '../components/merchant-registration-form'

export function useInitializeMerchant() {
  const wallet = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (draft: MerchantRegistrationDraft) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }

      const { builder } = prepareInitializeMerchant(wallet, {
        merchantName: draft.merchantName,
        merchantWeburl: draft.merchantWeburl,
        supportedTokens: draft.supportedTokens.map((token) => new PublicKey(token)),
      })

      return builder.rpc()
    },
    onSuccess: (signature: string) => {
      toast.success('Merchant initialized successfully!')
      console.log('Transaction signature:', signature)
      queryClient.invalidateQueries({ queryKey: ['merchant'] })
    },
    onError: (error: Error) => {
      console.error('Merchant initialization error:', error)
      toast.error(`Failed to initialize merchant: ${error.message}`)
    },
  })
}
