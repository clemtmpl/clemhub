'use client'

import { useTransition } from 'react'
import type { ResolvedStep } from '../lib/calculations'
import { formatEUR } from '../lib/calculations'
import { getIcon } from '../icons'
import { toggleStepAchieved } from '../actions'
import { Lock, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function SavingsStepCard({
  resolved,
  index,
}: {
  resolved: ResolvedStep
  index: number
}) {
  const [pending, startTransition] = useTransition()
  const { step, targetAmount, currentAmount, pct, isUnlocked, isComplete, isCurrent, monthsToComplete } = resolved
  const Icon = getIcon(step.icon ?? 'Target')

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-5 animate-fade-up transition-all',
        isComplete && 'border-emerald-500/30 bg-emerald-500/5',
        isCurrent && 'border-primary/40 bg-primary/5',
        !isUnlocked && 'opacity-60'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {isComplete && (
        <div className="absolute -top-2 -right-2 rounded-full bg-emerald-500 text-emerald-950 h-6 w-6 flex items-center justify-center">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-2 -right-2 rounded-full bg-primary text-primary-foreground px-2 h-6 flex items-center text-[10px] font-bold uppercase tracking-wider">
          En cours
        </div>
      )}
      {!isUnlocked && (
        <div className="absolute -top-2 -right-2 rounded-full bg-muted text-muted-foreground h-6 w-6 flex items-center justify-center">
          <Lock className="h-3 w-3" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0',
              isComplete && 'bg-emerald-500/20 text-emerald-400',
              isCurrent && 'bg-primary/20 text-primary',
              !isUnlocked && 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
            #{step.step_order}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold leading-tight mb-1">{step.name}</h3>
          {step.description && (
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {step.description}
            </p>
          )}

          {targetAmount > 0 && (
            <>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="text-lg font-semibold">{formatEUR(currentAmount)}</p>
                <p className="text-xs text-muted-foreground">/ {formatEUR(targetAmount)}</p>
              </div>

              <div className="relative h-1.5 rounded-full bg-accent overflow-hidden mb-2">
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 transition-all duration-700 rounded-full',
                    isComplete ? 'bg-emerald-500' : 'bg-primary'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className={cn('font-medium', isComplete ? 'text-emerald-400' : 'text-primary')}>
                  {pct.toFixed(0)}%
                </span>
                {!isComplete && monthsToComplete !== null && (
                  <span className="text-muted-foreground">~{monthsToComplete} mois à ce rythme</span>
                )}
              </div>
            </>
          )}

          {targetAmount === 0 && (
            <div className="mt-2 flex items-center gap-2">
              {isComplete ? (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Atteint
                  {step.achieved_at && (
                    <span className="text-muted-foreground ml-1">
                      le {new Date(step.achieved_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </span>
              ) : isUnlocked ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => startTransition(() => { toggleStepAchieved(step.id, true) })}
                  disabled={pending}
                >
                  <Sparkles className="h-3 w-3" />
                  Marquer comme atteint
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Termine d&apos;abord les paliers précédents
                </span>
              )}
            </div>
          )}

          {targetAmount > 0 && isComplete && step.is_achieved && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] text-muted-foreground"
                onClick={() => startTransition(() => { toggleStepAchieved(step.id, false) })}
                disabled={pending}
              >
                Annuler le marquage
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
