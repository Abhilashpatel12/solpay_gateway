'use client'

import { useCluster } from '@/components/solana/cluster-provider'
import { ArrowUpRightFromSquare } from 'lucide-react'

type ExplorerLinkProps = {
  path?: string
  address?: string
  tx?: string
  transaction?: string
  block?: string
  className?: string
  label?: string
}

export function AppExplorerLink({
  path,
  address,
  tx,
  transaction,
  block,
  label,
  className,
}: ExplorerLinkProps) {
  const { cluster } = useCluster()
  
  const getUrl = () => {
    const baseUrl = 'https://explorer.solana.com'
    const clusterParam = cluster.network === 'mainnet-beta' ? '' : `?cluster=${cluster.network}`
    const txId = tx ?? transaction
    if (txId) return `${baseUrl}/tx/${txId}${clusterParam}`
    if (block) return `${baseUrl}/block/${block}${clusterParam}`
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
