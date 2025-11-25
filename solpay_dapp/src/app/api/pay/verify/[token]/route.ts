import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

export async function GET(_request: Request, { params }: { params: any }) {
  const secret = process.env.PAY_SIGNER_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'PAY_SIGNER_SECRET not configured' }, { status: 500 })
  }
  // In Next.js App Router dynamic route handlers `params` may be a Promise
  // and must be awaited before accessing properties.
  const resolvedParams = await params
  const token = resolvedParams?.token
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const parts = token.split('.')
  if (parts.length !== 2) {
    return NextResponse.json({ error: 'Invalid token format' }, { status: 400 })
  }

  const [encoded, providedSigHex] = parts
  if (!encoded || !providedSigHex) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const expectedSigHex = createHmac('sha256', secret).update(encoded).digest('hex')

  try {
    const providedBuf = Buffer.from(providedSigHex, 'hex')
    const expectedBuf = Buffer.from(expectedSigHex, 'hex')
    if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
      return NextResponse.json({ error: 'Invalid token signature' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token signature' }, { status: 400 })
  }

  let payloadJson: string
  try {
    payloadJson = Buffer.from(encoded, 'base64url').toString('utf8')
  } catch (err) {
    return NextResponse.json({ error: 'Failed to decode token payload' }, { status: 400 })
  }

  let payload: any
  try {
    payload = JSON.parse(payloadJson)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token payload' }, { status: 400 })
  }

  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.e !== 'number' || payload.e <= now) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 })
  }

  return NextResponse.json(payload)
}
