'use client'

import { useState, useTransition } from 'react'
import type { Database } from '@/types/database'
import { upsertMission } from '../actions'
import { getWeekEnd, formatEUR } from '../lib/calculations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home, UtensilsCrossed, Fuel, MoreHorizontal } from 'lucide-react'

type Mission = Database['public']['Tables']['budget_missions']['Row']

interface MissionFormProps {
  initialWeekStart: string
  existing?: Mission | null
}

export function MissionForm({ initialWeekStart, existing }: MissionFormProps) {
  const [weekStart, setWeekStart] = useState(existing?.week_start ?? initialWeekStart)
  const [fees, setFees] = useState(String(existing?.fees_received ?? 400))
  const [housing, setHousing] = useState(String(existing?.cost_housing ?? 100))
  const [food, setFood] = useState(String(existing?.cost_food ?? 35))
  const [transport, setTransport] = useState(String(existing?.cost_transport ?? 60))
  const [other, setOther] = useState(String(existing?.cost_other ?? 0))
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const spent =
    (Number(housing) || 0) + (Number(food) || 0) + (Number(transport) || 0) + (Number(other) || 0)
  const received = Number(fees) || 0
  const saved = received - spent

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await upsertMission({
        week_start: weekStart,
        week_end: getWeekEnd(weekStart),
        fees_received: fees,
        cost_housing: housing,
        cost_food: food,
        cost_transport: transport,
        cost_other: other,
        notes: notes || null,
      })
      if ('error' in result && result.error) setError(result.error)
      else setError(null)
    })
  }

  const costs = [
    { key: 'housing',   label: 'Logement',   icon: Home,             value: housing,   setter: setHousing,   hint: '~100€' },
    { key: 'food',      label: 'Repas',      icon: UtensilsCrossed,  value: food,      setter: setFood,      hint: '~35€' },
    { key: 'transport', label: 'Essence',    icon: Fuel,             value: transport, setter: setTransport, hint: '~60€' },
    { key: 'other',     label: 'Autre',      icon: MoreHorizontal,   value: other,     setter: setOther,     hint: '' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="week_start">Semaine du (lundi)</Label>
          <Input
            id="week_start"
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fees">Frais perçus</Label>
          <Input
            id="fees"
            type="number"
            step="0.01"
            min="0"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Dépenses de la semaine</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {costs.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.key} className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={c.value}
                  onChange={(e) => c.setter(e.target.value)}
                  placeholder={c.hint}
                  className="pl-10"
                  aria-label={c.label}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {c.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-accent/50 border border-border">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Perçu</p>
          <p className="text-lg font-semibold">{formatEUR(received)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Dépensé</p>
          <p className="text-lg font-semibold text-rose-400">{formatEUR(spent)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Épargné</p>
          <p className="text-lg font-semibold text-primary">{formatEUR(saved)}</p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Enregistrement...' : existing ? 'Mettre à jour' : 'Enregistrer la semaine'}
      </Button>
    </form>
  )
}