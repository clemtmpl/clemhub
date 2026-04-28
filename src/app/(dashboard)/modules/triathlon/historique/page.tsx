import { getTriathlonSessions, getTriathlonWeights } from '@/modules/triathlon/queries'
import { DISCIPLINE_COLORS, DISCIPLINE_LABELS } from '@/modules/triathlon/data'
import { Waves, Bike, PersonStanding } from 'lucide-react'
import { SessionHistoryChart } from '@/modules/triathlon/components/session-history-chart'
import { DeleteSessionButton } from '@/modules/triathlon/components/delete-session-button'

function DisciplineIcon({ discipline }: { discipline: string }) {
  switch (discipline) {
    case 'swim': return <Waves className="h-4 w-4" />
    case 'bike': return <Bike className="h-4 w-4" />
    default: return <PersonStanding className="h-4 w-4" />
  }
}

export default async function HistoriquePage() {
  const [sessions, weights] = await Promise.all([
    getTriathlonSessions(100),
    getTriathlonWeights(30),
  ])

  const totalByDisc = sessions.reduce<Record<string, { count: number; totalMin: number; totalKm: number }>>(
    (acc, s) => {
      if (!acc[s.discipline]) acc[s.discipline] = { count: 0, totalMin: 0, totalKm: 0 }
      acc[s.discipline].count++
      acc[s.discipline].totalMin += s.duration_min ?? 0
      acc[s.discipline].totalKm += s.distance_km ?? 0
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historique</h1>
        <p className="text-muted-foreground text-sm mt-1">{sessions.length} séances enregistrées</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['swim', 'bike', 'run'] as const).map((disc) => {
          const stats = totalByDisc[disc]
          const color = DISCIPLINE_COLORS[disc]
          return (
            <div key={disc} className="rounded-xl border border-border bg-card p-4">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <DisciplineIcon discipline={disc} />
              </div>
              <p className="text-sm font-medium">{DISCIPLINE_LABELS[disc]}</p>
              {stats ? (
                <>
                  <p className="text-2xl font-bold tracking-tight mt-1">{stats.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(stats.totalMin / 60)}h{Math.round(stats.totalMin % 60).toString().padStart(2, '0')}
                    {stats.totalKm > 0 ? ` · ${stats.totalKm.toFixed(0)}km` : ''}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold tracking-tight mt-1">0</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Chart */}
      {sessions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Volume hebdomadaire</h2>
          <SessionHistoryChart sessions={sessions} />
        </div>
      )}

      {/* Weight trend */}
      {weights.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Évolution du poids</h2>
          <div className="space-y-2">
            {weights.slice(0, 10).map((w) => (
              <div key={w.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24">{new Date(w.date).toLocaleDateString('fr-FR')}</span>
                <div className="flex-1 relative h-1.5 rounded-full bg-accent overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    style={{ width: `${Math.min(((w.weight_kg - 50) / 50) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-16 text-right">{w.weight_kg} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4">Toutes les séances</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Aucune séance enregistrée</p>
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((s) => {
              const color = DISCIPLINE_COLORS[s.discipline as keyof typeof DISCIPLINE_COLORS]
              return (
                <li key={s.id} className="py-3 flex items-start gap-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <DisciplineIcon discipline={s.discipline} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-medium">{DISCIPLINE_LABELS[s.discipline as keyof typeof DISCIPLINE_LABELS]}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {s.duration_min && (
                        <span className="text-xs text-muted-foreground">{s.duration_min} min</span>
                      )}
                      {s.distance_km && (
                        <span className="text-xs text-muted-foreground">{s.distance_km} km</span>
                      )}
                      {s.heart_rate_avg && (
                        <span className="text-xs text-muted-foreground">FC {s.heart_rate_avg} bpm</span>
                      )}
                      {s.rpe && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-muted-foreground">RPE {s.rpe}/10</span>
                      )}
                    </div>
                    {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
                  </div>
                  <DeleteSessionButton id={s.id} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
