'use client'

import { useState, useTransition } from 'react'
import { logWeight } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'

export function LogWeightForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [weight, setWeight] = useState('')
  const [fat, setFat] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await logWeight({
        date,
        weight_kg: Number(weight),
        body_fat_pct: fat ? Number(fat) : null,
      })

      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setWeight('')
        setFat('')
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weight-date">Date</Label>
        <Input
          id="weight-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="weight-kg">Poids (kg)</Label>
          <Input
            id="weight-kg"
            type="number"
            step="0.1"
            min="30"
            max="200"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="75.0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body-fat">Masse grasse % (opt.)</Label>
          <Input
            id="body-fat"
            type="number"
            step="0.1"
            min="3"
            max="50"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="15.0"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-400">Poids enregistré !</p>}

      <Button type="submit" className="w-full" disabled={pending || !weight}>
        {pending ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </form>
  )
}
