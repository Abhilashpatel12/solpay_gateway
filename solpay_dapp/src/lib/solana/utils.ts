import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

export const solToLamports = (sol: number) => Math.round(sol * LAMPORTS_PER_SOL)

export const lamportsToSol = (lamports: number) => lamports / LAMPORTS_PER_SOL

export const formatPlanPrice = (price: BN | number | string) => {
  const lamports = typeof price === 'object' && price !== null && 'toNumber' in price ? price.toNumber() : Number(price)
  const sol = lamportsToSol(isNaN(lamports) ? 0 : lamports)
  // show up to 6 decimal places, trim trailing zeros
  return `${Number(sol.toFixed(6)).toString()} SOL`
}
