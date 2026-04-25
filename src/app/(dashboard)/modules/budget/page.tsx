import Link from 'next/link'
import {
  getBudgetOverview,
  getBudgetProfile,
  getEnvelopesWithSpending,
  getPlannedExpenses,
  getSavingsPlan,
} from '@/modules/budget/queries'
import { KpiCards } from '@/modules/budget/components/kpi-cards'
import { ExpenseDonut } from '@/modules/budget/components/expense-donut'
import { AddTransactionDialog } from '@/modules/budget/components/add-transaction-dialog'
import {
  formatEUR,
  getEnvelopeStatus,
  plannedExpenseToMonthly,
  resolveSavingsPlan,
  summarizeTransactions,
  totalSubscriptionsMonthly,
} from '@/modules/budget/lib/calculations'
import { ArrowRight, Sparkles, Target, CreditCard, Plane, AlertTriangle } from 'lucide-react'

export default async function BudgetPage() {
  const [
    { categories, subscriptions, transactions, accounts },
    profile,
    plannedExpenses,
    envelopes,
    steps,
  ] = await Promise.all([
    getBudgetOverview(),
    getBudgetProfile(),
    getPlannedExpenses(),
    getEnvelopesWithSpending(),
    getSavingsPlan(),
  ])

  const summary = summarizeTransactions(transactions)
  const subsMonthly = totalSubscriptionsMonthly(subscriptions)
  const activePlanned = plannedExpenses.filter((e) => e.status === 'active')
  const simulatedPlanned = plannedExpenses.filter((e) => e.status === 'planned' && e.simulate_as_saving)
  const activePlannedMonthly = activePlanned.reduce((acc, e) => acc + plannedExpenseToMonthly(e), 0)
  const simulatedMonthly = simulatedPlanned.reduce((acc, e) => acc + plannedExpenseToMonthly(e), 0)

  const totalExpenses = summary.expenses + subsMonthly + activePlannedMonthly + simulatedMonthly
  const monthlySavingCapacity = Math.max(0, summary.income - totalExpenses + simulatedMonthly)

  const catMap = new Map(categories.map((c) => [c.id, c]))
  const donutData = Object.entries(summary.byCategory)
    .map(([catId, value]) => {
      const cat = catMap.get(catId)
      return { name: cat?.name ?? 'Autre', value, color: cat?.color ?? '#64748B' }
    })
    .sort((a, b) => b.value - a.value)

  if (subsMonthly > 0 && !donutData.some((d) => d.name === 'Abonnements')) {
    const subCat = categories.find((c) => c.key === 'subscriptions')
    donutData.push({ name: 'Abonnements', value: subsMonthly, color: subCat?.color ?? '#F97316' })
  }
  if (activePlannedMonthly > 0) {
    donutData.push({ name: 'Charges planifiées', value: activePlannedMonthly, color: '#10B981' })
  }

  const resolvedSteps = resolveSavingsPlan(steps, accounts, profile, monthlySavingCapacity)
  const currentStep = resolvedSteps.find((r) => r.isCurrent)

  const envelopesInAlert = envelopes.filter((e) => {
    const s = getEnvelopeStatus(e.spent, Number(e.monthly_limit), e.alert_threshold_pct ?? 75)
    return s.isNearLimit
  })

  const totalPatrimony = accounts.reduce((acc, a) => acc + Number(a.balance), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground mt-1 text-sm">Vue d&apos;ensemble de tes finances ce mois-ci</p>
        </div>
        <AddTransactionDialog categories={categories} />
      </div>

      <KpiCards
        income={summary.income}
        expenses={totalExpenses}
        savings={monthlySavingCapacity}
        yearlyProjection={monthlySavingCapacity * 12}
      />

      {envelopesInAlert.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-amber-400">
                {envelopesInAlert.length} enveloppe{envelopesInAlert.length > 1 ? 's' : ''} en alerte
              </p>
              <p className="text-muted-foreground mt-1">
                {envelopesInAlert.map((e) => e.name).join(', ')} approche{envelopesInAlert.length === 1 ? '' : 'nt'} de la limite mensuelle.
              </p>
              <Link
                href="/modules/budget/envelopes"
                className="inline-flex items-center gap-1 text-amber-400 hover:underline mt-2 text-xs font-medium"
              >
                Voir les détails <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {currentStep && (
            <Link
              href="/modules/budget/plan"
              className="block rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-amber-500/5 p-5 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-medium">
                      Palier en cours · #{currentStep.step.step_order}
                    </p>
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h3 className="font-semibold mb-2">{currentStep.step.name}</h3>

                  {currentStep.targetAmount > 0 && (
                    <>
                      <div className="flex items-baseline justify-between mb-1">
                        <p className="text-2xl font-bold tracking-tight">
                          {formatEUR(currentStep.currentAmount, { compact: true })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          / {formatEUR(currentStep.targetAmount, { compact: true })}
                        </p>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-accent overflow-hidden mb-2">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${currentStep.pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-primary font-medium">{currentStep.pct.toFixed(0)}%</span>
                        {currentStep.monthsToComplete !== null && (
                          <span className="text-muted-foreground">~{currentStep.monthsToComplete} mois à ce rythme</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Link>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-semibold">Répartition des dépenses</h2>
              <span className="text-xs text-muted-foreground">ce mois</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExpenseDonut data={donutData} />
              <div className="space-y-2">
                {donutData.slice(0, 6).map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium">{formatEUR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-semibold">Dernières transactions</h2>
              <span className="text-xs text-muted-foreground">{transactions.length} ce mois</span>
            </div>
            {transactions.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Aucune transaction ce mois-ci</p>
                <AddTransactionDialog categories={categories} />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {transactions.slice(0, 8).map((tx) => {
                  const cat = catMap.get(tx.category_id ?? '')
                  return (
                    <li key={tx.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{tx.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {cat?.name ?? 'Sans catégorie'} · {new Date(tx.occurred_on).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <p className={tx.kind === 'income' ? 'font-medium text-emerald-400' : 'font-medium'}>
                        {tx.kind === 'income' ? '+' : '−'}{formatEUR(Number(tx.amount))}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Patrimoine</p>
            <p className="text-3xl font-bold tracking-tight mt-1">{formatEUR(totalPatrimony, { compact: true })}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Réparti sur {accounts.length} compte{accounts.length > 1 ? 's' : ''}
            </p>
            <Link
              href="/modules/budget/plan"
              className="inline-flex items-center gap-1 text-primary hover:underline mt-3 text-xs font-medium"
            >
              Détails et plan <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2">
            <Link
              href="/modules/budget/missions"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
            >
              <Plane className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Missions</p>
                <p className="text-xs text-muted-foreground">Tracker frais Rodez</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/modules/budget/recurring"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
            >
              <CreditCard className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Récurrents</p>
                <p className="text-xs text-muted-foreground">{formatEUR(subsMonthly + activePlannedMonthly)}/mois</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/modules/budget/envelopes"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Enveloppes</p>
                <p className="text-xs text-muted-foreground">
                  {envelopes.length} active{envelopes.length > 1 ? 's' : ''}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
