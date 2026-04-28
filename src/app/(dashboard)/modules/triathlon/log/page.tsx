import { LogSessionForm } from '@/modules/triathlon/components/log-session-form'
import { LogWeightForm } from '@/modules/triathlon/components/log-weight-form'
import { getTriathlonWeights } from '@/modules/triathlon/queries'

export default async function LogPage() {
  const weights = await getTriathlonWeights(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log</h1>
        <p className="text-muted-foreground text-sm mt-1">Enregistre tes séances et métriques</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Séance d&apos;entraînement</h2>
          <LogSessionForm />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Poids corporel</h2>
          <LogWeightForm />
          {weights.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Dernières mesures</p>
              <ul className="space-y-2">
                {weights.map((w) => (
                  <li key={w.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{new Date(w.date).toLocaleDateString('fr-FR')}</span>
                    <span className="font-medium">
                      {w.weight_kg} kg
                      {w.body_fat_pct ? <span className="text-muted-foreground ml-2">· {w.body_fat_pct}% MG</span> : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
