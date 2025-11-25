'use client'

import { useCluster } from '@/components/solana/cluster-provider'
import { ArrowUpRightFromSquare } from 'lucide-react'

type ExplorerLinkProps = {
  path?: string
  address?: string
  tx?: string
  className?: string
  label?: string
}

export function AppExplorerLink({
  path,
  address,
  tx,
  label,
  className,
}: ExplorerLinkProps) {
  const { cluster } = useCluster()
  
  const getUrl = () => {
    const baseUrl = 'https://explorer.solana.com'
    const clusterParam = cluster.network === 'mainnet-beta' ? '' : `?cluster=${cluster.network}`
    
    if (tx) return `${baseUrl}/tx/${tx}${clusterParam}`
    if (address) return `${baseUrl}/address/${address}${clusterParam}`
    if (path) return `${baseUrl}/${path}${clusterParam}`
    return baseUrl
  }

  return (
    <a
      href={getUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono inline-flex gap-1`}
    >
      {label || 'View in Explorer'}
      <ArrowUpRightFromSquare size={12} />
    </a>
  )
}
