import type { Database } from '@/types/database'

type Subscription = Database['public']['Tables']['budget_subscriptions']['Row']
type Transaction = Database['public']['Tables']['budget_transactions']['Row']

export function subscriptionToMonthly(sub: Subscription): number {
  switch (sub.frequency) {
    case 'weekly': return Number(sub.amount) * 4.333
    case 'yearly': return Number(sub.amount) / 12
    default: return Number(sub.amount)
  }
}

export function subscriptionToYearly(sub: Subscription): number {
  return subscriptionToMonthly(sub) * 12
}

export function totalSubscriptionsMonthly(subs: Subscription[]): number {
  return subs.filter((s) => s.is_active).reduce((acc, s) => acc + subscriptionToMonthly(s), 0)
}

export function formatEUR(n: number, opts?: { compact?: boolean }): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: opts?.compact ? 0 : 2,
    minimumFractionDigits: opts?.compact ? 0 : 2,
    notation: opts?.compact ? 'compact' : 'standard',
  }).format(n)
}

export function monthRange(date: Date = new Date()): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export interface MonthSummary {
  income: number
  expenses: number
  savings: number
  byCategory: Record<string, number>
}

export function summarizeTransactions(txs: Transaction[]): MonthSummary {
  const summary: MonthSummary = { income: 0, expenses: 0, savings: 0, byCategory: {} }
  for (const tx of txs) {
    const amount = Number(tx.amount)
    if (tx.kind === 'income') summary.income += amount
    else {
      summary.expenses += amount
      const key = tx.category_id ?? 'uncategorized'
      summary.byCategory[key] = (summary.byCategory[key] ?? 0) + amount
    }
  }
  summary.savings = summary.income - summary.expenses
  return summary
}