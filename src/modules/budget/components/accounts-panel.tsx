'use client'

import { useState, useTransition } from 'react'
import type { Database } from '@/types/database'
import { formatEUR } from '../lib/calculations'
import { updateAccountBalance } from '../actions'
import { getIcon } from '../icons'
import { Pencil, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Account = Database['public']['Tables']['budget_accounts']['Row']

const KIND_LABELS: Record<string, string> = {
  checking: 'Courant',
  savings: 'Épargne',
  investment: 'Investissement',
  cash: 'Liquide',
}

export function AccountsPanel({ accounts }: { accounts: Account[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [pending, startTransition] = useTransition()

  const total = accounts.reduce((acc, a) => acc + Number(a.balance), 0)

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-semibold">Mes comptes</h2>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight">{formatEUR(total, { compact: true })}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Patrimoine total</p>
        </div>
      </div>

      <div className="space-y-2">
        {accounts.map((account) => {
          const Icon = getIcon(account.icon ?? 'Wallet')
          const isEditing = editingId === account.id

          return (
            <div
              key={account.id}
              className="group flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${account.color}20`, color: account.color ?? '#F97316' }}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{account.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {KIND_LABELS[account.kind] ?? account.kind}
                </p>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-8 w-28 text-right"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        startTransition(() => {
                          updateAccountBalance(account.id, Number(editValue) || 0)
                          setEditingId(null)
                        })
                      }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      startTransition(() => {
                        updateAccountBalance(account.id, Number(editValue) || 0)
                        setEditingId(null)
                      })
                    }}
                    disabled={pending}
                    aria-label="Valider"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingId(null)}
                    aria-label="Annuler"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-semibold tabular-nums">{formatEUR(Number(account.balance))}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setEditingId(account.id)
                      setEditValue(String(account.balance))
                    }}
                    aria-label="Modifier le solde"
                  >
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Clique sur ✏️ pour mettre à jour un solde manuellement.
      </p>
    </div>
  )
}
