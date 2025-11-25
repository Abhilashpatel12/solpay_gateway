import { useMutation } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { toast } from 'sonner'
import { getProgram } from '@/lib/solana/program'
import { getMerchantPda } from '@/lib/solana/pdas'
import { prepareLogPayment } from '@/lib/solana/transactions'
import BN from 'bn.js'

export type OneTimePaymentArgs = {
  merchantAddress: string
  amountLamports: number
}

export function useOneTimePayment() {
  const wallet = useWallet()

  return useMutation({
    mutationFn: async ({ merchantAddress, amountLamports }: OneTimePaymentArgs) => {
      if (!wallet.publicKey) throw new Error('Wallet not connected')

      // validate merchant public key
      let merchantPubkey: PublicKey
      try {
        merchantPubkey = new PublicKey(merchantAddress)
      } catch (err) {
        throw new Error('Invalid merchant address')
      }

      const program = getProgram(wallet)
      const connection = program.provider.connection

      // Build native SOL transfer transaction
      const transaction = new Transaction()
      const transferIx = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: merchantPubkey,
        lamports: amountLamports,
      })
      transaction.add(transferIx)

      // Ensure transaction has required metadata
      const latest = await connection.getLatestBlockhash()
      transaction.recentBlockhash = latest.blockhash
      transaction.feePayer = wallet.publicKey

      if (!transaction.instructions || transaction.instructions.length === 0) {
        throw new Error('Transaction has no instructions')
      }

      // Send and confirm
      let signature: string
      try {
        signature = await wallet.sendTransaction(transaction, connection)
      } catch (err: any) {
        console.error('sendTransaction error', err)
        throw err
      }

      await connection.confirmTransaction(signature, 'confirmed')

      // Log payment on-chain (record native SOL with native mint)
      const [merchantPda] = getMerchantPda(merchantPubkey)
      const nativeMint = new PublicKey('11111111111111111111111111111111')
      const { builder } = prepareLogPayment(wallet, {
        txSignature: signature,
        amount: new BN(amountLamports),
        tokenMint: nativeMint,
        status: 1,
        merchantRegistration: merchantPda,
      })
      await builder.rpc()

      return signature
    },
    onSuccess: () => {
      toast.success('Payment completed successfully')
    },
    onError: (error: any) => {
      console.error(error)
      toast.error(`Payment failed: ${error?.message ?? String(error)}`)
    },
  })
}
