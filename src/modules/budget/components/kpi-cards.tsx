import { ArrowDownRight, ArrowUpRight, PiggyBank, TrendingUp } from 'lucide-react'
import { formatEUR } from '../lib/calculations'
import { cn } from '@/lib/utils'

interface KpiCardsProps {
  income: number
  expenses: number
  savings: number
  yearlyProjection: number
}

export function KpiCards({ income, expenses, savings, yearlyProjection }: KpiCardsProps) {
  const savingsRate = income > 0 ? (savings / income) * 100 : 0

  const cards = [
    {
      label: 'Revenus du mois',
      value: formatEUR(income),
      icon: ArrowUpRight,
      iconClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      trend: null,
    },
    {
      label: 'Dépenses du mois',
      value: formatEUR(expenses),
      icon: ArrowDownRight,
      iconClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      trend: null,
    },
    {
      label: 'Épargne du mois',
      value: formatEUR(savings),
      icon: PiggyBank,
      iconClass: 'text-primary bg-primary/10 border-primary/20',
      trend: `${savingsRate.toFixed(0)}% de tes revenus`,
    },
    {
      label: 'Projection annuelle',
      value: formatEUR(yearlyProjection, { compact: true }),
      icon: TrendingUp,
      iconClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      trend: 'à ce rythme',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="animate-fade-up rounded-xl border border-border bg-card p-4 sm:p-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs sm:text-sm text-muted-foreground">{card.label}</p>
              <div className={cn('rounded-lg border p-1.5', card.iconClass)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-semibold tracking-tight">{card.value}</p>
            {card.trend && (
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{card.trend}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}