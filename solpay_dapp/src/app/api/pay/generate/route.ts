import { NextResponse } from 'next/server'
import { randomBytes, createHmac } from 'crypto'

type GenerateRequestBody = {
  merchantAddress: string
  amountLamports?: number
  description?: string
  expiresInSeconds?: number
  // optional fields for subscription tokens
  type?: 'one_time' | 'subscribe'
  planName?: string
  planPda?: string
  billingCycleDays?: number
}

export async function POST(request: Request) {
  const secret = process.env.PAY_SIGNER_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'PAY_SIGNER_SECRET not configured' }, { status: 500 })
  }

  let body: GenerateRequestBody
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { merchantAddress, amountLamports, description, expiresInSeconds, type, planName, planPda, billingCycleDays } = body

  if (!merchantAddress) {
    return NextResponse.json({ error: 'Missing merchantAddress' }, { status: 400 })
  }

  if (type === 'subscribe') {
    if (!planName || !planPda) {
      return NextResponse.json({ error: 'Subscription token requires planName and planPda' }, { status: 400 })
    }
  } else {
    // default one-time token requires an amount
    if (typeof amountLamports !== 'number' || Number.isNaN(amountLamports)) {
      return NextResponse.json({ error: 'Missing or invalid amountLamports for one-time token' }, { status: 400 })
    }
  }

  const now = Math.floor(Date.now() / 1000)
  const ttl = typeof expiresInSeconds === 'number' && expiresInSeconds > 0 ? expiresInSeconds : 86400
  const expiresAt = now + ttl
  const nonce = randomBytes(16).toString('hex')

  // compact payload keys:
  // m: merchantAddress, a: amountLamports, e: expiry, n: nonce, d: description
  // t: type ('subscribe'), p: planName, pp: planPda, b: billingCycleDays
  const payload: Record<string, unknown> = {
    m: merchantAddress,
    e: expiresAt,
    n: nonce,
  }

  if (typeof amountLamports === 'number') payload.a = amountLamports
  if (description) payload.d = description
  if (type) payload.t = type
  if (planName) payload.p = planName
  if (planPda) payload.pp = planPda
  if (typeof billingCycleDays === 'number') payload.b = billingCycleDays

  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(encoded).digest('hex')
  const token = `${encoded}.${sig}`

  return NextResponse.json({ token })
}
