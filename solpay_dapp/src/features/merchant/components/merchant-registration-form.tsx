'use client'

import { useState, FormEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export type MerchantRegistrationDraft = {
  merchantName: string
  merchantWeburl: string
  supportedTokens: string[]
}

type MerchantRegistrationFormProps = {
  onSubmit?: (draft: MerchantRegistrationDraft) => void
}

export function MerchantRegistrationForm({ onSubmit }: MerchantRegistrationFormProps) {
  const [merchantName, setMerchantName] = useState('')
  const [merchantWeburl, setMerchantWeburl] = useState('')
  const [supportedTokensRaw, setSupportedTokensRaw] = useState('')

  const supportedTokens = supportedTokensRaw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  const isValid = merchantName.trim().length > 0 && merchantWeburl.trim().length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid) return

    const draft: MerchantRegistrationDraft = {
      merchantName: merchantName.trim(),
      merchantWeburl: merchantWeburl.trim(),
      supportedTokens,
    }

    onSubmit?.(draft)
    console.info('merchant draft prepared for createMerchant:', draft)
  }

  return (
    <Card>
        <CardHeader>
        <CardTitle>Merchant registration</CardTitle>
        <CardDescription>
          Mirror the `createMerchant` flow. All fields are required and map 1:1 to the Anchor arguments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="merchant-name">Merchant name</Label>
            <Input
              id="merchant-name"
              placeholder="SolPay Cafe"
              value={merchantName}
              onChange={(event) => setMerchantName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant-weburl">Website</Label>
            <Input
              id="merchant-weburl"
              type="url"
              placeholder="https://solpay.cafe"
              value={merchantWeburl}
              onChange={(event) => setMerchantWeburl(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supported-tokens">Supported token mints (optional)</Label>
            <Input
              id="supported-tokens"
              placeholder="Comma separated mint addresses"
              value={supportedTokensRaw}
              onChange={(event) => setSupportedTokensRaw(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Payments are native SOL only. You can optionally list supported token mints for informational purposes.
            </p>
          </div>
          <Button type="submit" disabled={!isValid} className="w-full">
            Create Merchant
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
