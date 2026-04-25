import { getMissions, getCurrentWeekMission } from '@/modules/budget/queries'
import { MissionForm } from '@/modules/budget/components/mission-form'
import { formatEUR, formatWeekLabel, getWeekStart, summarizeMission } from '@/modules/budget/lib/calculations'
import { Plane, TrendingUp } from 'lucide-react'

export default async function MissionsPage() {
  const [missions, current] = await Promise.all([
    getMissions(),
    getCurrentWeekMission(),
  ])

  const thisWeek = getWeekStart()

  // Stats globales
  const totalReceived = missions.reduce((acc, m) => acc + Number(m.fees_received), 0)
  const totalSpent = missions.reduce(
    (acc, m) =>
      acc +
      Number(m.cost_housing ?? 0) +
      Number(m.cost_food ?? 0) +
      Number(m.cost_transport ?? 0) +
      Number(m.cost_other ?? 0),
    0
  )
  const totalSaved = totalReceived - totalSpent
  const avgSaved = missions.length > 0 ? totalSaved / missions.length : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            Missions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tracke tes frais de mission et combien tu mets de côté chaque semaine
          </p>
        </div>
      </div>

      {/* KPI missions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Semaines trackées</p>
          <p className="text-2xl font-semibold mt-1">{missions.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total perçu</p>
          <p className="text-2xl font-semibold mt-1">{formatEUR(totalReceived, { compact: true })}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total épargné</p>
          <p className="text-2xl font-semibold mt-1 text-primary">{formatEUR(totalSaved, { compact: true })}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            <p className="text-xs text-muted-foreground">Moyenne/sem</p>
          </div>
          <p className="text-2xl font-semibold mt-1">{formatEUR(avgSaved, { compact: true })}</p>
        </div>
      </div>

      {/* Form semaine courante */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-semibold">
              {current ? 'Modifier cette semaine' : 'Nouvelle semaine'}
            </h2>
            <p className="text-xs text-muted-foreground">{formatWeekLabel(thisWeek)}</p>
          </div>
        </div>
        <MissionForm initialWeekStart={thisWeek} existing={current} />
      </div>

      {/* Historique */}
      {missions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Historique</h2>
          <ul className="divide-y divide-border">
            {missions.map((m) => {
              const s = summarizeMission(m)
              return (
                <li key={m.id} className="py-3 grid grid-cols-4 gap-3 items-center">
                  <div>
                    <p className="text-sm font-medium">{formatWeekLabel(m.week_start)}</p>
                    <p className="text-xs text-muted-foreground">{m.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Perçu</p>
                    <p className="text-sm font-medium">{formatEUR(s.received)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Dépensé</p>
                    <p className="text-sm font-medium text-rose-400">{formatEUR(s.spent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Épargné</p>
                    <p className="text-sm font-semibold text-primary">{formatEUR(s.saved)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}