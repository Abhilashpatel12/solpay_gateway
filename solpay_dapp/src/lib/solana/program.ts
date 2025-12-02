import { AnchorProvider, Program, type Idl } from '@coral-xyz/anchor'
import type { Adapter, SignerWalletAdapter } from '@solana/wallet-adapter-base'
import type { Transaction } from '@solana/web3.js'
import { getConnection } from '@/lib/solana/connection'
import { SOLPAY_PROGRAM_ID } from '@/lib/solana/constants'
import idl from '@/idl/solpay_smartcontract.json'

export type WalletLike = {
  publicKey: Adapter['publicKey']
  signTransaction?: SignerWalletAdapter['signTransaction']
  signAllTransactions?: SignerWalletAdapter['signAllTransactions']
  connected: boolean
}

export function getAnchorProvider(wallet?: WalletLike) {
  const connection = getConnection()

  if (!wallet?.publicKey || !wallet?.signTransaction) {
    return new AnchorProvider(connection, {} as never, { commitment: 'confirmed' })
  }

  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction as (tx: Transaction) => Promise<Transaction>,
    signAllTransactions: wallet.signAllTransactions?.bind(wallet),
  }

  return new AnchorProvider(connection, anchorWallet as never, { commitment: 'confirmed' })
}

type IdlWithAddress = typeof idl & { address: string }

export function getProgram(wallet?: WalletLike) {
  const provider = getAnchorProvider(wallet)
  // Ensure the program ID from the environment is used
  if (SOLPAY_PROGRAM_ID) {
    (idl as IdlWithAddress).address = SOLPAY_PROGRAM_ID.toBase58()
  }
  // Cast through Idl type to allow dynamic account access patterns used in the codebase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Program(idl as unknown as Idl, provider) as any
}
