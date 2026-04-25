import {
  getBudgetOverview,
  getBudgetProfile,
  getPlannedExpenses,
  getSavingsPlan,
} from '@/modules/budget/queries'
import { SavingsStepCard } from '@/modules/budget/components/savings-step-card'
import { AccountsPanel } from '@/modules/budget/components/accounts-panel'
import {
  formatEUR,
  plannedExpenseToMonthly,
  resolveSavingsPlan,
  summarizeTransactions,
  totalSubscriptionsMonthly,
} from '@/modules/budget/lib/calculations'
import { Target, Lightbulb } from 'lucide-react'

export default async function PlanPage() {
  const [
    { subscriptions, transactions, accounts },
    profile,
    plannedExpenses,
    steps,
  ] = await Promise.all([
    getBudgetOverview(),
    getBudgetProfile(),
    getPlannedExpenses(),
    getSavingsPlan(),
  ])

  const summary = summarizeTransactions(transactions)
  const subsMonthly = totalSubscriptionsMonthly(subscriptions)
  const activePlannedMonthly = plannedExpenses
    .filter((e) => e.status === 'active')
    .reduce((acc, e) => acc + plannedExpenseToMonthly(e), 0)

  const referenceIncome =
    Number(profile?.monthly_net_salary ?? 0) +
    Number(profile?.monthly_mission_fees ?? 0) * 0.5 +
    Number(profile?.monthly_meal_vouchers ?? 0)

  const referenceExpenses = subsMonthly + activePlannedMonthly
  const monthlySavingCapacity = Math.max(
    0,
    summary.income > 0
      ? summary.income - summary.expenses - subsMonthly - activePlannedMonthly
      : referenceIncome - referenceExpenses
  )

  const resolvedSteps = resolveSavingsPlan(steps, accounts, profile, monthlySavingCapacity)
  const totalAchieved = resolvedSteps.filter((r) => r.isComplete).length
  const totalSteps = resolvedSteps.length
  const totalPatrimony = accounts.reduce((acc, a) => acc + Number(a.balance), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Plan d&apos;épargne
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ta trajectoire patrimoniale étape par étape
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Capacité d&apos;épargne</p>
            <p className="text-xl font-semibold mt-1">{formatEUR(monthlySavingCapacity, { compact: true })}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">par mois</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Projection annuelle</p>
            <p className="text-xl font-semibold mt-1 text-primary">{formatEUR(monthlySavingCapacity * 12, { compact: true })}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">à ce rythme</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paliers franchis</p>
            <p className="text-xl font-semibold mt-1">{totalAchieved} / {totalSteps}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">étapes</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Patrimoine actuel</p>
            <p className="text-xl font-semibold mt-1">{formatEUR(totalPatrimony, { compact: true })}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">tous comptes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Trajectoire
          </h2>

          {resolvedSteps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">Aucun palier configuré</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedSteps.map((resolved, i) => (
                <SavingsStepCard key={resolved.step.id} resolved={resolved} index={i} />
              ))}
            </div>
          )}

          {resolvedSteps.length > 0 && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1.5">
                <p className="font-medium text-primary">Stratégie recommandée</p>
                <p className="text-muted-foreground leading-relaxed">
                  Concentre tes virements vers le <strong className="text-foreground">Livret A</strong> jusqu&apos;à atteindre{' '}
                  {formatEUR(Number(profile?.monthly_net_salary ?? 0) * 3, { compact: true })}. Ensuite, redirige ton épargne vers le{' '}
                  <strong className="text-foreground">PEA</strong> pour faire travailler ton argent. Maintiens les{' '}
                  <strong className="text-foreground">150 €/mois sur ton assurance vie</strong> en parallèle pour la diversification long terme.
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <AccountsPanel accounts={accounts} />
        </div>
      </div>
    </div>
  )
}
