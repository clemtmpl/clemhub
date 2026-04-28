'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { DISCIPLINE_COLORS } from '../data'

interface Session {
  date: string
  discipline: string
  duration_min: number | null
}

interface Props {
  sessions: Session[]
}

function getWeekKey(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return monday.toISOString().slice(0, 10)
}

export function SessionHistoryChart({ sessions }: Props) {
  const weekMap = new Map<string, { swim: number; bike: number; run: number }>()

  for (const s of sessions) {
    const week = getWeekKey(s.date)
    if (!weekMap.has(week)) weekMap.set(week, { swim: 0, bike: 0, run: 0 })
    const entry = weekMap.get(week)!
    const disc = s.discipline as 'swim' | 'bike' | 'run'
    if (disc in entry) entry[disc] += s.duration_min ?? 0
  }

  const data = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([week, vals]) => {
      const d = new Date(week)
      const label = `${d.getDate()}/${d.getMonth() + 1}`
      return { week: label, ...vals }
    })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} unit="min" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value, name) => [`${value}min`, name === 'swim' ? 'Natation' : name === 'bike' ? 'Vélo' : 'Course']}
        />
        <Legend
          formatter={(value) => value === 'swim' ? 'Natation' : value === 'bike' ? 'Vélo' : 'Course'}
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="swim" stackId="a" fill={DISCIPLINE_COLORS.swim} radius={[0, 0, 0, 0]} />
        <Bar dataKey="bike" stackId="a" fill={DISCIPLINE_COLORS.bike} radius={[0, 0, 0, 0]} />
        <Bar dataKey="run" stackId="a" fill={DISCIPLINE_COLORS.run} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
