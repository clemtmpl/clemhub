'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Database } from '@/types/database'
import { createEvent, deleteEvent, updateEvent } from '../actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'

type Category = Database['public']['Tables']['calendar_categories']['Row']
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

interface EventDialogProps {
  categories: Category[]
  trigger?: React.ReactNode
  initialDate?: Date
  existing?: CalendarEvent | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EventDialog({
  categories,
  trigger,
  initialDate,
  existing,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EventDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen

  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const baseDate = existing
    ? new Date(existing.starts_at)
    : initialDate ?? new Date()

  const defaultStart = format(baseDate, "yyyy-MM-dd'T'HH:mm")
  const defaultEnd = existing
    ? format(new Date(existing.ends_at), "yyyy-MM-dd'T'HH:mm")
    : format(new Date(baseDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")

  const [allDay, setAllDay] = useState(existing?.all_day ?? false)
  const [recurrence, setRecurrence] = useState(existing?.recurrence ?? 'none')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const startsAtRaw = fd.get('starts_at') as string
    const endsAtRaw = fd.get('ends_at') as string

    let starts_at: string
    let ends_at: string
    if (allDay) {
      const [yS, mS, dS] = startsAtRaw.slice(0, 10).split('-').map(Number)
      const [yE, mE, dE] = endsAtRaw.slice(0, 10).split('-').map(Number)
      const startDate = new Date(yS, mS - 1, dS, 0, 0, 0, 0)
      const endDate = new Date(yE, mE - 1, dE, 23, 59, 59, 999)
      starts_at = startDate.toISOString()
      ends_at = endDate.toISOString()
    } else {
      starts_at = new Date(startsAtRaw).toISOString()
      ends_at = new Date(endsAtRaw).toISOString()
    }

    const payload = {
      title: fd.get('title') as string,
      description: (fd.get('description') as string) || null,
      location: (fd.get('location') as string) || null,
      starts_at,
      ends_at,
      all_day: allDay,
      category_id: (fd.get('category_id') as string) || null,
      recurrence: recurrence as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
      recurrence_end_date: (fd.get('recurrence_end_date') as string) || null,
    }

    startTransition(async () => {
      const result = existing
        ? await updateEvent(existing.id, payload)
        : await createEvent(payload)

      if ('error' in result && result.error) setError(result.error)
      else { setOpen(false); setError(null) }
    })
  }

  const handleDelete = () => {
    if (!existing) return
    if (!confirm(`Supprimer "${existing.title}" ?`)) return
    startTransition(async () => {
      const result = await deleteEvent(existing.id)
      if ('error' in result && result.error) setError(result.error)
      else { setOpen(false); setError(null) }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Modifier l'événement" : 'Nouvel événement'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={existing?.title}
              placeholder="Ex: RDV dentiste"
              autoFocus={!existing}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="all_day"
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="all_day" className="cursor-pointer">Toute la journée</Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Début</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type={allDay ? 'date' : 'datetime-local'}
                required
                defaultValue={allDay ? defaultStart.slice(0, 10) : defaultStart}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Fin</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type={allDay ? 'date' : 'datetime-local'}
                required
                defaultValue={allDay ? defaultEnd.slice(0, 10) : defaultEnd}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Catégorie</Label>
            <Select name="category_id" defaultValue={existing?.category_id ?? undefined}>
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu (optionnel)</Label>
            <Input
              id="location"
              name="location"
              defaultValue={existing?.location ?? ''}
              placeholder="Ex: Cabinet Dr Martin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrence">Récurrence</Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as typeof recurrence)}>
              <SelectTrigger id="recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                <SelectItem value="daily">Chaque jour</SelectItem>
                <SelectItem value="weekly">Chaque semaine</SelectItem>
                <SelectItem value="monthly">Chaque mois</SelectItem>
                <SelectItem value="yearly">Chaque année</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrence !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="recurrence_end_date">Jusqu&apos;au (optionnel)</Label>
              <Input
                id="recurrence_end_date"
                name="recurrence_end_date"
                type="date"
                defaultValue={existing?.recurrence_end_date ?? ''}
              />
              <p className="text-xs text-muted-foreground">
                Vide = sans limite (max 2 ans)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Notes (optionnel)</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={existing?.description ?? ''}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            {existing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={pending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? 'Enregistrement...' : existing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function NewEventButton({ categories }: { categories: Category[] }) {
  return (
    <EventDialog
      categories={categories}
      trigger={
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvel événement
        </Button>
      }
    />
  )
}
