'use client'

import { useTransition } from 'react'
import type { Database } from '@/types/database'
import { getIcon } from '../icons'
import { formatEUR, plannedExpenseToMonthly, statusColor, statusLabel } from '../lib/calculations'
import {
  deletePlannedExpense,
  setPlannedExpenseStatus,
  togglePlannedSimulation,
} from '../actions'
import { Button } from '@/components/ui/button'
import { Trash2, Play, CircleCheck, Beaker } from 'lucide-react'
import { cn } from '@/lib/utils'

type PlannedExpense = Database['public']['Tables']['budget_planned_expenses']['Row']

export function PlannedExpenseList({ expenses }: { expenses: PlannedExpense[] }) {
  const [isPending, startTransition] = useTransition()

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted-foreground">Aucune dépense planifiée pour le moment</p>
        <p className="text-xs text-muted-foreground mt-1">
          Ajoute ton futur loyer, crédit voiture, etc.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((exp, i) => {
        const Icon = getIcon(exp.icon ?? 'Calendar')
        const monthly = plannedExpenseToMonthly(exp)

        return (
          <div
            key={exp.id}
            className="group rounded-xl border border-border bg-card p-4 animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${exp.color}20`, color: exp.color ?? '#F97316' }}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{exp.name}</p>
                  <span
                    className={cn(
                      'text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border',
                      statusColor(exp.status)
                    )}
                  >
                    {statusLabel(exp.status)}
                  </span>
                  {exp.simulate_as_saving && (
                    <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/10 flex items-center gap-1">
                      <Beaker className="h-2.5 w-2.5" />
                      Simulé
                    </span>
                  )}
                </div>
                {exp.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{exp.notes}</p>
                )}
              </div>

              <div className="text-right">
                <p className="font-semibold">{formatEUR(monthly)}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  par mois
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 justify-end flex-wrap">
              {exp.status === 'planned' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5"
                  onClick={() =>
                    startTransition(() => {
                      togglePlannedSimulation(exp.id, !exp.simulate_as_saving)
                    })
                  }
                  disabled={isPending}
                >
                  <Beaker className="h-3 w-3" />
                  {exp.simulate_as_saving ? 'Arrêter la simu' : 'Simuler'}
                </Button>
              )}

              {exp.status === 'planned' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5"
                  onClick={() =>
                    startTransition(() => {
                        setPlannedExpenseStatus(exp.id, 'active')
                    })
                }
                  disabled={isPending}
                >
                  <Play className="h-3 w-3" />
                  Activer
                </Button>
              )}

              {exp.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5"
                  onClick={() =>
                    startTransition(() => {
                        setPlannedExpenseStatus(exp.id, 'active')
                    })
                    }
                  disabled={isPending}
                >
                  <CircleCheck className="h-3 w-3" />
                  Terminer
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-destructive"
                onClick={() => {
                    if (confirm(`Supprimer "${exp.name}" ?`)) {
                        startTransition(() => {
                        deletePlannedExpense(exp.id)
                        })
                    }
                }}
                disabled={isPending}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}