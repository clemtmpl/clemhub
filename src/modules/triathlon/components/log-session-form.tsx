'use client'

import { useState, useTransition } from 'react'
import { Waves, Bike, PersonStanding } from 'lucide-react'
import { logSession } from '../actions'
import { DISCIPLINE_LABELS } from '../data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const DISCIPLINES = [
  { key: 'swim' as const, label: DISCIPLINE_LABELS.swim, icon: Waves, color: '#3B82F6' },
  { key: 'bike' as const, label: DISCIPLINE_LABELS.bike, icon: Bike, color: '#F59E0B' },
  { key: 'run' as const, label: DISCIPLINE_LABELS.run, icon: PersonStanding, color: '#10B981' },
]

export function LogSessionForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [discipline, setDiscipline] = useState<'swim' | 'bike' | 'run'>('run')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [duration, setDuration] = useState('')
  const [distance, setDistance] = useState('')
  const [hr, setHr] = useState('')
  const [rpe, setRpe] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await logSession({
        date,
        discipline,
        duration_min: duration ? Number(duration) : null,
        distance_km: distance ? Number(distance) : null,
        heart_rate_avg: hr ? Number(hr) : null,
        rpe: rpe ? Number(rpe) : null,
        notes: notes || null,
      })

      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setDuration('')
        setDistance('')
        setHr('')
        setRpe('')
        setNotes('')
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Discipline selector */}
      <div className="space-y-2">
        <Label>Discipline</Label>
        <div className="grid grid-cols-3 gap-2">
          {DISCIPLINES.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDiscipline(key)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors text-xs font-medium',
                discipline === key
                  ? 'border-current'
                  : 'border-border hover:bg-accent'
              )}
              style={discipline === key ? { borderColor: color, color, backgroundColor: `${color}15` } : {}}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session-date">Date</Label>
        <Input
          id="session-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="duration">Durée (min)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="distance">Distance (km)</Label>
          <Input
            id="distance"
            type="number"
            step="0.1"
            min="0"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="hr">FC moy (bpm)</Label>
          <Input
            id="hr"
            type="number"
            min="60"
            max="220"
            value={hr}
            onChange={(e) => setHr(e.target.value)}
            placeholder="140"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rpe">RPE (1-10)</Label>
          <Input
            id="rpe"
            type="number"
            min="1"
            max="10"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            placeholder="7"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session-notes">Notes (optionnel)</Label>
        <Textarea
          id="session-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ressenti, conditions, objectifs atteints..."
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-400">Séance enregistrée !</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Enregistrement...' : 'Enregistrer la séance'}
      </Button>
    </form>
  )
}
