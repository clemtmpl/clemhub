'use client'

import { useState, useTransition } from 'react'
import { Plus, Dumbbell } from 'lucide-react'
import { logStrengthSession } from '../actions'
import { EXERCISE_DB } from '../data'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

interface LogStrengthDialogProps {
  exerciseKey?: string
}

export function LogStrengthDialog({ exerciseKey }: LogStrengthDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [exercise, setExercise] = useState(exerciseKey ?? '')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await logStrengthSession({
        date,
        exercise_key: exercise,
        sets: sets ? Number(sets) : null,
        reps: reps ? Number(reps) : null,
        weight_kg: weight ? Number(weight) : null,
        notes: notes || null,
      })

      if ('error' in result && result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setSets('')
        setReps('')
        setWeight('')
        setNotes('')
        if (!exerciseKey) setExercise('')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {exerciseKey ? (
          <button className="text-xs text-primary hover:underline">+ Log</button>
        ) : (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Loguer muscu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Séance muscu
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Exercice</Label>
            <Select value={exercise} onValueChange={setExercise} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un exercice" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXERCISE_DB).map(([key, ex]) => (
                  <SelectItem key={key} value={key}>{ex.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="str-date">Date</Label>
            <Input
              id="str-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="sets">Séries</Label>
              <Input id="sets" type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input id="reps" type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Charge (kg)</Label>
              <Input id="weight" type="number" step="0.5" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="60" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="str-notes">Notes (optionnel)</Label>
            <Input id="str-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ressenti, difficulté..." />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={pending || !exercise}>
            {pending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
