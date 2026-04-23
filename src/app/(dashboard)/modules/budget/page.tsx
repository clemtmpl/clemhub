import { getBudgetOverview } from '@/modules/budget/queries'
import { KpiCards } from '@/modules/budget/components/kpi-cards'
import { SubscriptionList } from '@/modules/budget/components/subscription-list'
import { ExpenseDonut } from '@/modules/budget/components/expense-donut'
import { AddTransactionDialog } from '@/modules/budget/components/add-transaction-dialog'
import {
  formatEUR,
  summarizeTransactions,
  totalSubscriptionsMonthly,
} from '@/modules/budget/lib/calculations'

export default async function BudgetPage() {
  const { categories, subscriptions, transactions } = await getBudgetOverview()

  const summary = summarizeTransactions(transactions)
  const monthlySubs = totalSubscriptionsMonthly(subscriptions)
  const projectedYearly = summary.savings * 12

  // Données du donut : dépenses par catégorie + abonnements
  const catMap = new Map(categories.map((c) => [c.id, c]))
  const donutData = Object.entries(summary.byCategory)
    .map(([catId, value]) => {
      const cat = catMap.get(catId)
      return { name: cat?.name ?? 'Autre', value, color: cat?.color ?? '#64748B' }
    })
    .sort((a, b) => b.value - a.value)

  // Ajoute abonnements s'ils ne sont pas déjà trackés
  if (monthlySubs > 0 && !donutData.some((d) => d.name === 'Abonnements')) {
    const subCat = categories.find((c) => c.key === 'subscriptions')
    donutData.push({
      name: 'Abonnements',
      value: monthlySubs,
      color: subCat?.color ?? '#F97316',
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground mt-1">
            Vue d&apos;ensemble de tes finances
          </p>
        </div>
        <AddTransactionDialog categories={categories} />
      </div>

      <KpiCards
        income={summary.income}
        expenses={summary.expenses + monthlySubs}
        savings={summary.savings - monthlySubs}
        yearlyProjection={(summary.savings - monthlySubs) * 12}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-semibold">Abonnements</h2>
            <div className="text-right">
              <p className="text-sm font-medium">{formatEUR(monthlySubs)}/mois</p>
              <p className="text-xs text-muted-foreground">{formatEUR(monthlySubs * 12, { compact: true })} / an</p>
            </div>
          </div>
          <SubscriptionList subscriptions={subscriptions} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-semibold">Répartition</h2>
            <span className="text-xs text-muted-foreground">ce mois</span>
          </div>
          <ExpenseDonut data={donutData} />
          <div className="mt-4 space-y-2">
            {donutData.slice(0, 5).map((d) => (
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
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">Aucune transaction ce mois-ci</p>
            <AddTransactionDialog categories={categories} />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.slice(0, 10).map((tx) => {
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
  )
}