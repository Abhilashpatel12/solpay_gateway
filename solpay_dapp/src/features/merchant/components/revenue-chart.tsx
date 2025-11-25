'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { lamportsToSol } from '@/lib/solana/utils'

interface RevenueChartProps {
  data: { date: string; amount: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Convert lamports -> SOL for plotting and formatting
  const plotData = data.map((d) => ({ date: d.date, amount: lamportsToSol(d.amount) }))

  const formatDateTick = (d: string) => {
    try {
      const dt = new Date(d)
      if (isNaN(dt.getTime())) return d
      return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })
    } catch {
      return d
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Daily transaction volume over time.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[350px] w-full">
          {plotData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plotData} margin={{ top: 10, right: 8, left: 0, bottom: 18 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatDateTick}
                  interval={0}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${Number(value).toLocaleString()} SOL`}
                  domain={[0, (dataMax: number) => Math.max(1, Number((dataMax || 0) * 1.2).toFixed(2))]}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(124,58,237,0.06)' }}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${Number(value).toLocaleString()} SOL`, 'Revenue']}
                />
                <Bar dataKey="amount" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No transaction data available yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
