import { getBudgetOverview, getEnvelopesWithSpending } from '@/modules/budget/queries'
import { EnvelopeCard } from '@/modules/budget/components/envelope-card'
import { EnvelopeDialog } from '@/modules/budget/components/envelope-dialog'
import { formatEUR, getEnvelopeStatus } from '@/modules/budget/lib/calculations'
import { Sparkles, PartyPopper } from 'lucide-react'

export default async function EnvelopesPage() {
  const [{ categories }, envelopes] = await Promise.all([
    getBudgetOverview(),
    getEnvelopesWithSpending(),
  ])

  const totalLimit = envelopes.reduce((acc, e) => acc + Number(e.monthly_limit), 0)
  const totalSpent = envelopes.reduce((acc, e) => acc + e.spent, 0)
  const totalRemaining = totalLimit - totalSpent

  const inAlert = envelopes.filter((e) => {
    const s = getEnvelopeStatus(
      e.spent,
      Number(e.monthly_limit),
      e.alert_threshold_pct ?? 75
    )
    return s.isNearLimit
  }).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Enveloppes
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Plafonne tes dépenses plaisir et reste sur tes objectifs
          </p>
        </div>
        <EnvelopeDialog categories={categories} />
      </div>

      {envelopes.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Limite totale</p>
              <p className="text-xl font-semibold mt-1">{formatEUR(totalLimit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dépensé ce mois</p>
              <p className="text-xl font-semibold mt-1">{formatEUR(totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reste disponible</p>
              <p className={`text-xl font-semibold mt-1 ${totalRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatEUR(totalRemaining)}
              </p>
            </div>
          </div>

          {inAlert > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-amber-400">
                ⚠️ {inAlert} enveloppe{inAlert > 1 ? 's' : ''} en alerte ce mois-ci
              </p>
            </div>
          )}
        </div>
      )}

      {envelopes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <PartyPopper className="h-6 w-6 text-primary" />
          </div>
          <p className="font-medium">Aucune enveloppe pour l&apos;instant</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Crée ta première enveloppe pour plafonner tes dépenses plaisir et garder le contrôle sur ton budget mensuel.
          </p>
          <div className="mt-5">
            <EnvelopeDialog categories={categories} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {envelopes.map((env, i) => (
            <EnvelopeCard
              key={env.id}
              envelope={{
                id: env.id,
                name: env.name,
                monthly_limit: Number(env.monthly_limit),
                icon: env.icon,
                color: env.color,
                alert_threshold_pct: env.alert_threshold_pct,
                spent: env.spent,
              }}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
