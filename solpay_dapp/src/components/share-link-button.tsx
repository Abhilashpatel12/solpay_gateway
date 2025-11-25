"use client"

import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type ShareLinkButtonProps = {
  url: string
  title?: string
  text?: string
  size?: 'icon' | 'default' | 'sm' | 'lg'
}

export function ShareLinkButton({ url, title, text, size = 'icon' }: ShareLinkButtonProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          url,
          title: title ?? 'SolPay payment link',
          text: text ?? 'Pay or subscribe via SolPay on Solana.',
        })
        return
      }

      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch (error) {
      console.error(error)
      toast.error('Unable to share link')
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={handleShare}
      title="Share link"
    >
      <Share2 className="h-4 w-4" />
      {size !== 'icon' && <span className="ml-2">Share</span>}
    </Button>
  )
}
