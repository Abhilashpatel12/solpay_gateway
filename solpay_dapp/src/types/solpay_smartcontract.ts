import idl from '@/idl/solpay_smartcontract.json'
import type { Idl } from '@coral-xyz/anchor'

// Use the imported JSON shape combined with Anchor's Idl type.
// This keeps the typing accurate (without a generated client) and prevents
// huge hand-written / malformed type literals that previously broke the
// compiler. We'll later replace this with fully generated Anchor types.
export type SolpaySmartcontract = Idl & typeof idl