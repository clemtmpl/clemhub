'use client'

import { useTransition } from 'react'
import type { Database } from '@/types/database'
import { getIcon } from '../icons'
import { formatEUR, subscriptionToMonthly, subscriptionToYearly } from '../lib/calculations'
import { toggleSubscription } from '../actions'
import { cn } from '@/lib/utils'

type Subscription = Database['public']['Tables']['budget_subscriptions']['Row']

export function SubscriptionList({ subscriptions }: { subscriptions: Subscription[] }) {
  const [isPending, startTransition] = useTransition()

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Aucun abonnement enregistré</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {subscriptions.map((sub, i) => {
        const Icon = getIcon(sub.icon ?? 'CreditCard')
        const monthly = subscriptionToMonthly(sub)
        const yearly = subscriptionToYearly(sub)

        return (
          <div
            key={sub.id}
            className={cn(
              'group relative rounded-xl border border-border bg-card p-4 animate-fade-up',
              'hover:border-primary/30 transition-all',
              !sub.is_active && 'opacity-50'
            )}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${sub.color}20`, color: sub.color ?? '#F97316' }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{sub.name}</p>
                <p className="text-xs text-muted-foreground">
                  {sub.frequency === 'monthly' ? 'Mensuel' : sub.frequency === 'yearly' ? 'Annuel' : 'Hebdo'}
                </p>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-3 border-t border-border">
              <div>
                <p className="text-lg font-semibold">{formatEUR(monthly)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">par mois</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">{formatEUR(yearly, { compact: true })}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">par an</p>
              </div>
            </div>

            <button
              onClick={() => startTransition(() => { toggleSubscription(sub.id, !sub.is_active) })}
              disabled={isPending}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-1 rounded-md bg-accent hover:bg-accent/70 text-muted-foreground"
              aria-label={sub.is_active ? 'Désactiver' : 'Activer'}
            >
              {sub.is_active ? 'Pause' : 'Activer'}
            </button>
          </div>
        )
      })}
    </div>
  )
}