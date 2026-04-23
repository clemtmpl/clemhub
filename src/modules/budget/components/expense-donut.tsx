'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatEUR } from '../lib/calculations'

interface DonutData {
  name: string
  value: number
  color: string
}

export function ExpenseDonut({ data }: { data: DonutData[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center rounded-xl border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Aucune dépense ce mois-ci</p>
      </div>
    )
  }

  return (
    <div className="relative h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#141414',
              border: '1px solid #262626',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => formatEUR(Number(value))}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
          <p className="text-xl font-semibold">{formatEUR(total, { compact: true })}</p>
        </div>
      </div>
    </div>
  )
}