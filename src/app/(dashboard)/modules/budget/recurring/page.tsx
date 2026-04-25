import { getBudgetOverview, getPlannedExpenses } from '@/modules/budget/queries'
import { SubscriptionList } from '@/modules/budget/components/subscription-list'
import { PlannedExpenseList } from '@/modules/budget/components/planned-expense-list'
import { PlannedExpenseDialog } from '@/modules/budget/components/planned-expense-dialog'
import {
  formatEUR,
  plannedExpenseToMonthly,
  totalSubscriptionsMonthly,
} from '@/modules/budget/lib/calculations'
import { CreditCard } from 'lucide-react'

export default async function RecurringPage() {
  const [{ subscriptions, categories }, plannedExpenses] = await Promise.all([
    getBudgetOverview(),
    getPlannedExpenses(),
  ])

  const subsMonthly = totalSubscriptionsMonthly(subscriptions)
  const activePlanned = plannedExpenses.filter((e) => e.status === 'active')
  const simulatedPlanned = plannedExpenses.filter(
    (e) => e.status === 'planned' && e.simulate_as_saving
  )
  const waitingPlanned = plannedExpenses.filter(
    (e) => e.status === 'planned' && !e.simulate_as_saving
  )

  const activePlannedMonthly = activePlanned.reduce(
    (acc, e) => acc + plannedExpenseToMonthly(e),
    0
  )
  const simulatedMonthly = simulatedPlanned.reduce(
    (acc, e) => acc + plannedExpenseToMonthly(e),
    0
  )
  const waitingMonthly = waitingPlanned.reduce(
    (acc, e) => acc + plannedExpenseToMonthly(e),
    0
  )

  const totalFixedMonthly = subsMonthly + activePlannedMonthly + simulatedMonthly

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Dépenses récurrentes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Abonnements et dépenses planifiées (loyer, crédit, etc.)
          </p>
        </div>
        <PlannedExpenseDialog categories={categories} />
      </div>

      {/* Total général */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Abonnements</p>
            <p className="text-xl font-semibold mt-1">{formatEUR(subsMonthly)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">/mois</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">En cours</p>
            <p className="text-xl font-semibold mt-1">{formatEUR(activePlannedMonthly)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">/mois</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Simulés</p>
            <p className="text-xl font-semibold mt-1 text-primary">{formatEUR(simulatedMonthly)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">/mois (comme si)</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prévus (inactifs)</p>
            <p className="text-xl font-semibold mt-1 text-muted-foreground">{formatEUR(waitingMonthly)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">/mois</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-border flex items-baseline justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Charge mensuelle totale</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              (abonnements + en cours + simulés)
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight">{formatEUR(totalFixedMonthly)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatEUR(totalFixedMonthly * 12, { compact: true })} / an
            </p>
          </div>
        </div>
      </div>

      {/* Dépenses en cours */}
      {activePlanned.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              En cours
            </h2>
            <span className="text-xs text-muted-foreground">
              {activePlanned.length} dépense{activePlanned.length > 1 ? 's' : ''}
            </span>
          </div>
          <PlannedExpenseList expenses={activePlanned} />
        </section>
      )}

      {/* Dépenses simulées */}
      {simulatedPlanned.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-primary">
              Simulées (entraînement)
            </h2>
            <span className="text-xs text-muted-foreground">
              {simulatedPlanned.length} dépense{simulatedPlanned.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-3">
            <p className="text-xs text-primary">
              💡 Ces montants sont mis de côté virtuellement pour tester ta capacité à les absorber. Ton épargne réelle continue d&apos;augmenter normalement.
            </p>
          </div>
          <PlannedExpenseList expenses={simulatedPlanned} />
        </section>
      )}

      {/* Dépenses en attente */}
      {waitingPlanned.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Prévues
            </h2>
            <span className="text-xs text-muted-foreground">
              {waitingPlanned.length} dépense{waitingPlanned.length > 1 ? 's' : ''}
            </span>
          </div>
          <PlannedExpenseList expenses={waitingPlanned} />
        </section>
      )}

      {/* Abonnements */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Abonnements
          </h2>
          <span className="text-xs text-muted-foreground">
            {subscriptions.filter((s) => s.is_active).length} actifs
          </span>
        </div>
        <SubscriptionList subscriptions={subscriptions} />
      </section>
    </div>
  )
}