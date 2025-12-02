"use client"

import { FormEvent, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ShareLinkButton } from '@/components/share-link-button'

export type OneTimePaymentDraft = {
  amountLamports: number
  description?: string
}

export function OneTimePaymentForm({ merchantAddress }: { merchantAddress?: string }) {
  const [amountLamports, setAmountLamports] = useState('')
  const [description, setDescription] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = Number(amountLamports) > 0 && !!merchantAddress

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid || !merchantAddress) return

    const draft: OneTimePaymentDraft = {
      amountLamports: Number(amountLamports),
      description: description.trim() || undefined,
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/pay/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantAddress,
          amountLamports: draft.amountLamports,
          description: draft.description,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || `Failed to generate token (${res.status})`)
      }

      const data = await res.json()
      const token = data?.token
      if (!token) throw new Error('No token returned')

      const baseUrl = `${window.location.origin}/p/${token}`
      setGeneratedUrl(baseUrl)

      await navigator.clipboard.writeText(baseUrl)
      toast.success('One-time payment link copied to clipboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate payment link'
      console.error(err)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>One-time payment link</CardTitle>
        <CardDescription>
          Generate a simple payment URL you can share with customers. The link encodes amount and token mint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="otp-amount">Amount (lamports)</Label>
            <Input
              id="otp-amount"
              type="number"
              min="1"
              value={amountLamports}
              onChange={(e) => setAmountLamports(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Token</Label>
            <Input id="otp-mint" value="SOL (native)" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp-desc">Description (optional)</Label>
            <Input
              id="otp-desc"
              placeholder="e.g. Design invoice #1234"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
              Copy payment link
            </Button>
            {generatedUrl && typeof window !== 'undefined' && (
              <ShareLinkButton
                url={generatedUrl}
                title={description || 'SolPay one-time payment'}
                text={description || 'Pay this one-time invoice on SolPay.'}
                size="icon"
              />
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
