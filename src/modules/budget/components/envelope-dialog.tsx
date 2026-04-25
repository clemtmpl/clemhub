'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import type { Database } from '@/types/database'
import { createEnvelope } from '../actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Category = Database['public']['Tables']['budget_categories']['Row']

export function EnvelopeDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const expenseCats = categories.filter((c) => c.kind === 'expense')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle enveloppe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle enveloppe</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            startTransition(async () => {
              const result = await createEnvelope({
                name: fd.get('name') as string,
                monthly_limit: fd.get('monthly_limit') as string,
                category_id: (fd.get('category_id') as string) || null,
                alert_threshold_pct: fd.get('alert_threshold_pct') as string,
                icon: 'Wallet',
                color: '#EC4899',
              })
              if ('error' in result && result.error) setError(result.error)
              else { setOpen(false); setError(null) }
            })
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l&apos;enveloppe</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Ex: Sorties & plaisir"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="monthly_limit">Limite mensuelle (€)</Label>
              <Input
                id="monthly_limit"
                name="monthly_limit"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue="250"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert_threshold_pct">Alerte à (%)</Label>
              <Input
                id="alert_threshold_pct"
                name="alert_threshold_pct"
                type="number"
                min="0"
                max="100"
                required
                defaultValue="75"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Catégorie liée</Label>
            <Select name="category_id">
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {expenseCats.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Les transactions de cette catégorie compteront dans l&apos;enveloppe
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Création...' : "Créer l'enveloppe"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
