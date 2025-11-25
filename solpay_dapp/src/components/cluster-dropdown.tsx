'use client'

import * as React from 'react'
import { useCluster } from '@/components/solana/cluster-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ClusterDropdown() {
  const { cluster, clusters, setCluster } = useCluster()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{cluster.label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup
          value={cluster.name}
          onValueChange={(value) => {
            const newCluster = clusters.find((c) => c.name === value)
            if (newCluster) {
              setCluster(newCluster)
            }
          }}
        >
          {clusters.map((cluster) => {
            return (
              <DropdownMenuRadioItem key={cluster.name} value={cluster.name}>
                {cluster.label}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
