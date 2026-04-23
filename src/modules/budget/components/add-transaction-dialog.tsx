'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import type { Database } from '@/types/database'
import { createTransaction } from '../actions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Category = Database['public']['Tables']['budget_categories']['Row']

export function AddTransactionDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<'income' | 'expense'>('expense')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const filteredCats = categories.filter((c) => c.kind === kind)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle transaction</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            startTransition(async () => {
              const result = await createTransaction({
                kind,
                amount: fd.get('amount') as string,
                label: fd.get('label') as string,
                category_id: (fd.get('category_id') as string) || null,
                note: (fd.get('note') as string) || null,
                occurred_on: fd.get('occurred_on') as string,
              })
              if ('error' in result && result.error) setError(result.error)
              else { setOpen(false); setError(null) }
            })
          }}
          className="space-y-4"
        >
          <Tabs value={kind} onValueChange={(v) => setKind(v as 'income' | 'expense')}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="expense">Dépense</TabsTrigger>
              <TabsTrigger value="income">Revenu</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" min="0" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occurred_on">Date</Label>
              <Input
                id="occurred_on"
                name="occurred_on"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Description</Label>
            <Input id="label" name="label" type="text" required placeholder="Ex: Courses Lidl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Catégorie</Label>
            <Select name="category_id">
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {filteredCats.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea id="note" name="note" rows={2} />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}