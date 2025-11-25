import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { getProgram } from '@/lib/solana/program'
import { getMerchantPda } from '@/lib/solana/pdas'
import { PublicKey, SystemProgram } from '@solana/web3.js'
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

      const program = getProgram(wallet)
      const [merchantPda] = getMerchantPda(wallet.publicKey)

      const supportedTokens = draft.supportedTokens.map((token) => new PublicKey(token))

      return program.methods
        .initializeMerchant(
          draft.merchantName,
          draft.merchantWeburl,
          supportedTokens
        )
        .accounts({
          merchantRegistration: merchantPda,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      toast.success('Merchant initialized successfully!')
      console.log('Transaction signature:', signature)
      queryClient.invalidateQueries({ queryKey: ['merchant'] })
    },
    onError: (error) => {
      console.error('Merchant initialization error:', error)
      toast.error(`Failed to initialize merchant: ${error.message}`)
    },
  })
}
