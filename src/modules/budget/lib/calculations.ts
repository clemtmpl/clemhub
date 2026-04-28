import type { Database } from '@/types/database'

type SavingsStep = Database['public']['Tables']['budget_savings_plan']['Row']
type Account = Database['public']['Tables']['budget_accounts']['Row']
type BudgetProfile = Database['public']['Tables']['budget_profile']['Row']

export interface ResolvedStep {
  step: SavingsStep
  targetAmount: number
  currentAmount: number
  pct: number
  isUnlocked: boolean
  isComplete: boolean
  isCurrent: boolean
  monthsToComplete: number | null
}

export function resolveSavingsPlan(
  steps: SavingsStep[],
  accounts: Account[],
  profile: BudgetProfile | null,
  monthlySavingCapacity: number
): ResolvedStep[] {
  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order)

  const computeTarget = (step: SavingsStep): number => {
    if (step.target_amount) return Number(step.target_amount)
    if (step.target_formula) {
      const salary = Number(profile?.monthly_net_salary ?? 0)
      const match = step.target_formula.match(/^(\d+(?:\.\d+)?)x\s*salary$/i)
      if (match && salary) return parseFloat(match[1]) * salary
    }
    return 0
  }

  const sumByAccountKind = (kind: string | null): number => {
    if (!kind) return accounts.reduce((acc, a) => acc + Number(a.balance), 0)
    return accounts
      .filter((a) => a.kind === kind && a.is_active)
      .reduce((acc, a) => acc + Number(a.balance), 0)
  }

  let foundCurrent = false

  return sortedSteps.map((step) => {
    const targetAmount = computeTarget(step)
    const currentAmount = sumByAccountKind(step.account_target)
    const isComplete = step.is_achieved || (targetAmount > 0 && currentAmount >= targetAmount)
    const pct = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : (isComplete ? 100 : 0)

    const isCurrent = !foundCurrent && !isComplete
    if (isCurrent) foundCurrent = true

    const isUnlocked = isComplete || isCurrent
    const remaining = Math.max(0, targetAmount - currentAmount)
    const monthsToComplete =
      monthlySavingCapacity > 0 && remaining > 0
        ? Math.ceil(remaining / monthlySavingCapacity)
        : null

    return { step, targetAmount, currentAmount, pct, isUnlocked, isComplete, isCurrent, monthsToComplete }
  })
}

type Subscription = Database['public']['Tables']['budget_subscriptions']['Row']
type Transaction = Database['public']['Tables']['budget_transactions']['Row']
type Mission = Database['public']['Tables']['budget_missions']['Row']

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

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
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

export interface MissionSummary {
  weekStart: string
  weekEnd: string
  received: number
  spent: number
  saved: number
  savingsRate: number
}

export function summarizeMission(mission: Mission): MissionSummary {
  const spent =
    Number(mission.cost_housing ?? 0) +
    Number(mission.cost_food ?? 0) +
    Number(mission.cost_transport ?? 0) +
    Number(mission.cost_other ?? 0)
  const received = Number(mission.fees_received)
  const saved = received - spent
  return {
    weekStart: mission.week_start,
    weekEnd: mission.week_end,
    received,
    spent,
    saved,
    savingsRate: received > 0 ? (saved / received) * 100 : 0,
  }
}

/**
 * Retourne le lundi de la semaine d'une date donnée (ISO, format YYYY-MM-DD)
 */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // lundi
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  return d.toISOString().slice(0, 10)
}

export function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart)
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)

  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `${fmt(start)} → ${fmt(end)}`
}

type PlannedExpense = Database['public']['Tables']['budget_planned_expenses']['Row']

export function plannedExpenseToMonthly(exp: PlannedExpense): number {
  return exp.frequency === 'yearly' ? Number(exp.amount) / 12 : Number(exp.amount)
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'planned': return 'Prévu'
    case 'active':  return 'En cours'
    case 'ended':   return 'Terminé'
    default:        return status
  }
}

export function statusColor(status: string): string {
  switch (status) {
    case 'planned': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    case 'active':  return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    case 'ended':   return 'text-muted-foreground bg-muted border-border'
    default:        return ''
  }
}

export interface EnvelopeStatus {
  pct: number
  remaining: number
  isOverLimit: boolean
  isNearLimit: boolean
  level: 'safe' | 'warning' | 'danger' | 'over'
}

export function getEnvelopeStatus(
  spent: number,
  limit: number,
  alertThreshold = 75
): EnvelopeStatus {
  const pct = limit > 0 ? (spent / limit) * 100 : 0
  const remaining = limit - spent

  let level: EnvelopeStatus['level']
  if (pct >= 100) level = 'over'
  else if (pct >= 90) level = 'danger'
  else if (pct >= alertThreshold) level = 'warning'
  else level = 'safe'

  return {
    pct: Math.min(pct, 100),
    remaining,
    isOverLimit: pct >= 100,
    isNearLimit: pct >= alertThreshold,
    level,
  }
}

export function envelopeColors(level: EnvelopeStatus['level']) {
  switch (level) {
    case 'safe':
      return {
        bar: 'bg-emerald-500',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
      }
    case 'warning':
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
      }
    case 'danger':
      return {
        bar: 'bg-orange-500',
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
      }
    case 'over':
      return {
        bar: 'bg-rose-500',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
      }
  }
}