'use client'

import { useState, useTransition, useEffect } from 'react'
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

function toLocalDatetime(iso: string) {
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm")
}

function toLocalDate(iso: string) {
  return format(new Date(iso), 'yyyy-MM-dd')
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

  // Controlled state — tout ce qui est dans le formulaire
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [recurrence, setRecurrence] = useState('none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')

  // Réinitialise TOUT à chaque ouverture du dialog
  useEffect(() => {
    if (!open) return
    const base = existing ? new Date(existing.starts_at) : initialDate ?? new Date()
    const isAd = existing?.all_day ?? false
    setTitle(existing?.title ?? '')
    setDescription(existing?.description ?? '')
    setLocation(existing?.location ?? '')
    setCategoryId(existing?.category_id ?? '')
    setAllDay(isAd)
    setRecurrence(existing?.recurrence ?? 'none')
    setRecurrenceEndDate(existing?.recurrence_end_date ?? '')
    setError(null)

    if (isAd) {
      setStartsAt(existing ? toLocalDate(existing.starts_at) : format(base, 'yyyy-MM-dd'))
      setEndsAt(existing ? toLocalDate(existing.ends_at) : format(base, 'yyyy-MM-dd'))
    } else {
      setStartsAt(existing ? toLocalDatetime(existing.starts_at) : format(base, "yyyy-MM-dd'T'HH:mm"))
      setEndsAt(
        existing
          ? toLocalDatetime(existing.ends_at)
          : format(new Date(base.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")
      )
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Quand allDay change, on convertit le format sans perdre la date
  const handleAllDayChange = (checked: boolean) => {
    setAllDay(checked)
    if (checked) {
      setStartsAt(startsAt.slice(0, 10))
      setEndsAt(endsAt.slice(0, 10))
    } else {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const hh2 = String(now.getHours() + 1).padStart(2, '0')
      setStartsAt(`${startsAt.slice(0, 10)}T${hh}:${mm}`)
      setEndsAt(`${endsAt.slice(0, 10)}T${hh2}:${mm}`)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    let starts_at: string
    let ends_at: string
    if (allDay) {
      const [yS, mS, dS] = startsAt.slice(0, 10).split('-').map(Number)
      const [yE, mE, dE] = endsAt.slice(0, 10).split('-').map(Number)
      starts_at = new Date(yS, mS - 1, dS, 0, 0, 0, 0).toISOString()
      ends_at = new Date(yE, mE - 1, dE, 23, 59, 59, 999).toISOString()
    } else {
      starts_at = new Date(startsAt).toISOString()
      ends_at = new Date(endsAt).toISOString()
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      starts_at,
      ends_at,
      all_day: allDay,
      category_id: categoryId || null,
      recurrence: recurrence as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
      recurrence_end_date: recurrenceEndDate || null,
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
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: RDV dentiste"
              autoFocus={!existing}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="all_day"
              type="checkbox"
              checked={allDay}
              onChange={(e) => handleAllDayChange(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="all_day" className="cursor-pointer">Toute la journée</Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Début</Label>
              <Input
                id="starts_at"
                type={allDay ? 'date' : 'datetime-local'}
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ends_at">Fin</Label>
              <Input
                id="ends_at"
                type={allDay ? 'date' : 'datetime-local'}
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Cabinet Dr Martin"
            />
          </div>

          <div className="space-y-2">
            <Label>Récurrence</Label>
            <Select value={recurrence} onValueChange={setRecurrence}>
              <SelectTrigger>
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
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Vide = sans limite (max 2 ans)</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Notes (optionnel)</Label>
            <Textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
