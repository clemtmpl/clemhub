'use client'

import { useTransition } from 'react'
import { getIcon } from '../icons'
import { envelopeColors, formatEUR, getEnvelopeStatus } from '../lib/calculations'
import { deleteEnvelope } from '../actions'
import { Trash2, AlertTriangle, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface EnvelopeWithSpending {
  id: string
  name: string
  monthly_limit: number
  icon: string | null
  color: string | null
  alert_threshold_pct: number | null
  spent: number
}

export function EnvelopeCard({
  envelope,
  index,
}: {
  envelope: EnvelopeWithSpending
  index: number
}) {
  const [pending, startTransition] = useTransition()
  const Icon = getIcon(envelope.icon ?? 'Wallet')
  const limit = Number(envelope.monthly_limit)
  const threshold = envelope.alert_threshold_pct ?? 75

  const status = getEnvelopeStatus(envelope.spent, limit, threshold)
  const colors = envelopeColors(status.level)

  return (
    <div
      className="group relative rounded-xl border border-border bg-card p-5 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className="h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${envelope.color}20`, color: envelope.color ?? '#F97316' }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{envelope.name}</p>
          <p className="text-xs text-muted-foreground">
            Limite mensuelle : {formatEUR(limit)}
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-muted-foreground hover:text-destructive transition-opacity"
          onClick={() => {
            if (confirm(`Supprimer l'enveloppe "${envelope.name}" ?`)) {
              startTransition(() => {
                deleteEnvelope(envelope.id)
              })
            }
          }}
          disabled={pending}
          aria-label="Supprimer"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold tracking-tight">{formatEUR(envelope.spent)}</p>
          <p className="text-xs text-muted-foreground">/ {formatEUR(limit)}</p>
        </div>

        <div className="relative h-2 rounded-full bg-accent overflow-hidden">
          <div
            className={cn(
              'absolute inset-y-0 left-0 transition-all duration-500 ease-out rounded-full',
              colors.bar
            )}
            style={{ width: `${status.pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className={cn('font-medium', colors.text)}>
            {status.pct.toFixed(0)}% utilisé
          </span>
          {status.isOverLimit ? (
            <span className="flex items-center gap-1 text-rose-400">
              <CircleAlert className="h-3 w-3" />
              Dépassé de {formatEUR(Math.abs(status.remaining))}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Reste {formatEUR(status.remaining)}
            </span>
          )}
        </div>
      </div>

      {status.isNearLimit && !status.isOverLimit && (
        <div
          className={cn(
            'mt-4 flex items-start gap-2 rounded-lg border p-2.5',
            colors.bg,
            colors.border
          )}
        >
          <AlertTriangle className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', colors.text)} />
          <p className={cn('text-xs', colors.text)}>
            Tu approches de ta limite mensuelle. Pense à temporiser pour le reste du mois.
          </p>
        </div>
      )}
    </div>
  )
}
