import Link from 'next/link'
import { ArrowRight, Waves, Bike, PersonStanding, Dumbbell, TrendingUp, CheckCircle2 } from 'lucide-react'
import { getTriathlonData } from '@/modules/triathlon/queries'
import { PHASES, PROGRAM, getPhaseForWeek, DISCIPLINE_COLORS, DISCIPLINE_LABELS } from '@/modules/triathlon/data'

const TOTAL_WEEKS = 25

function getCurrentWeek(completed: Array<{ week: number; day: number }>) {
  const completedSet = new Set(completed.map((c) => `${c.week}-${c.day}`))
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const days = PROGRAM[w] ?? {}
    const totalDays = Object.keys(days).length
    const completedDays = Object.keys(days).filter((d) => completedSet.has(`${w}-${d}`)).length
    if (completedDays < totalDays) return w
  }
  return TOTAL_WEEKS
}

function DisciplineIcon({ discipline }: { discipline: string }) {
  switch (discipline) {
    case 'swim': return <Waves className="h-4 w-4" />
    case 'bike': return <Bike className="h-4 w-4" />
    case 'run': return <PersonStanding className="h-4 w-4" />
    default: return <Dumbbell className="h-4 w-4" />
  }
}

export default async function TriathlonPage() {
  const { sessions, weights, completed } = await getTriathlonData()

  const currentWeek = getCurrentWeek(completed)
  const currentPhase = getPhaseForWeek(currentWeek)

  const totalWorkoutsCompleted = completed.length
  const totalProgramDays = Object.values(PROGRAM).reduce(
    (acc, week) => acc + Object.keys(week).length,
    0
  )
  const progressPct = Math.round((totalWorkoutsCompleted / totalProgramDays) * 100)

  const weekCompleted = completed.filter((c) => c.week === currentWeek)
  const weekDays = PROGRAM[currentWeek] ?? {}
  const weekProgress = Math.round((weekCompleted.length / Math.max(Object.keys(weekDays).length, 1)) * 100)

  const recentSessions = sessions.slice(0, 5)

  const byDiscipline = sessions.reduce<Record<string, { count: number; totalMin: number; totalKm: number }>>(
    (acc, s) => {
      if (!acc[s.discipline]) acc[s.discipline] = { count: 0, totalMin: 0, totalKm: 0 }
      acc[s.discipline].count++
      acc[s.discipline].totalMin += s.duration_min ?? 0
      acc[s.discipline].totalKm += s.distance_km ?? 0
      return acc
    },
    {}
  )

  const latestWeight = weights[0]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Triathlon</h1>
          <p className="text-muted-foreground mt-1 text-sm">Préparation Half Ironman · 25 semaines</p>
        </div>
        <Link
          href="/modules/triathlon/log"
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Loguer une séance
        </Link>
      </div>

      {/* Progression globale */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Phase actuelle</p>
            <h2 className="font-semibold mt-0.5" style={{ color: currentPhase.color }}>
              Phase {currentPhase.id} — {currentPhase.name}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight">S{currentWeek}</p>
            <p className="text-xs text-muted-foreground">/ {TOTAL_WEEKS} semaines</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{currentPhase.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progression programme</span>
            <span>{progressPct}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-accent overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, backgroundColor: currentPhase.color }}
            />
          </div>
          <div className="flex gap-2 mt-3">
            {PHASES.map((phase) => (
              <div key={phase.id} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="h-1.5 w-full rounded-full"
                  style={{
                    backgroundColor: phase.id <= currentPhase.id ? phase.color : undefined,
                    opacity: phase.id <= currentPhase.id ? 1 : 0.2,
                    background: phase.id > currentPhase.id ? 'hsl(var(--accent))' : undefined,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">P{phase.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Semaine en cours */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-semibold">Semaine {currentWeek}</h2>
              <span className="text-xs text-muted-foreground">{weekCompleted.length}/{Object.keys(weekDays).length} séances</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-accent overflow-hidden mb-4">
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                style={{ width: `${weekProgress}%` }}
              />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
                const sessions_day = weekDays[day] ?? []
                const isCompleted = completed.some((c) => c.week === currentWeek && c.day === day)
                const isRest = sessions_day[0]?.type === 'repos'
                const hasSession = sessions_day.length > 0
                const discipline = sessions_day.find((s) => s.discipline)?.discipline

                return (
                  <div
                    key={day}
                    className={`rounded-lg p-2 text-center text-xs transition-colors ${
                      isCompleted
                        ? 'bg-primary/20 border border-primary/40'
                        : isRest
                        ? 'bg-muted/20 border border-border'
                        : 'bg-accent/50 border border-border'
                    }`}
                  >
                    <p className="text-muted-foreground mb-1">J{day}</p>
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary mx-auto" />
                    ) : hasSession && discipline ? (
                      <div className="h-3.5 w-3.5 rounded-full mx-auto" style={{ backgroundColor: DISCIPLINE_COLORS[discipline as keyof typeof DISCIPLINE_COLORS] }} />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full mx-auto bg-muted-foreground/20" />
                    )}
                  </div>
                )
              })}
            </div>
            <Link
              href="/modules/triathlon/programme"
              className="inline-flex items-center gap-1 text-primary hover:underline mt-4 text-xs font-medium"
            >
              Voir le programme détaillé <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Séances récentes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-semibold">Séances récentes</h2>
              <Link href="/modules/triathlon/historique" className="text-xs text-primary hover:underline">
                Tout voir
              </Link>
            </div>
            {recentSessions.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Aucune séance enregistrée</p>
                <Link
                  href="/modules/triathlon/log"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  Loguer ma première séance
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentSessions.map((s) => (
                  <li key={s.id} className="py-3 flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${DISCIPLINE_COLORS[s.discipline as keyof typeof DISCIPLINE_COLORS]}20`, color: DISCIPLINE_COLORS[s.discipline as keyof typeof DISCIPLINE_COLORS] }}
                    >
                      <DisciplineIcon discipline={s.discipline} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{DISCIPLINE_LABELS[s.discipline as keyof typeof DISCIPLINE_LABELS] ?? s.discipline}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.date).toLocaleDateString('fr-FR')}
                        {s.duration_min ? ` · ${s.duration_min}min` : ''}
                        {s.distance_km ? ` · ${s.distance_km}km` : ''}
                      </p>
                    </div>
                    {s.rpe && (
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-accent">
                        RPE {s.rpe}/10
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Stats par discipline */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">Volume total</h2>
            <div className="space-y-3">
              {(['swim', 'bike', 'run'] as const).map((disc) => {
                const stats = byDiscipline[disc]
                return (
                  <div key={disc} className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${DISCIPLINE_COLORS[disc]}20`, color: DISCIPLINE_COLORS[disc] }}
                    >
                      <DisciplineIcon discipline={disc} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{DISCIPLINE_LABELS[disc]}</p>
                      {stats ? (
                        <p className="text-xs text-muted-foreground">
                          {stats.count} séances · {Math.round(stats.totalMin / 60)}h{Math.round(stats.totalMin % 60).toString().padStart(2, '0')}
                          {stats.totalKm > 0 ? ` · ${stats.totalKm.toFixed(0)}km` : ''}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Aucune séance</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Poids */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="font-semibold">Poids</h2>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            {latestWeight ? (
              <>
                <p className="text-3xl font-bold tracking-tight mt-1">{latestWeight.weight_kg} kg</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(latestWeight.date).toLocaleDateString('fr-FR')}
                  {latestWeight.body_fat_pct ? ` · ${latestWeight.body_fat_pct}% MG` : ''}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Aucune mesure</p>
            )}
            <Link
              href="/modules/triathlon/log"
              className="inline-flex items-center gap-1 text-primary hover:underline mt-3 text-xs font-medium"
            >
              Peser <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Liens rapides */}
          <div className="space-y-2">
            <Link
              href="/modules/triathlon/muscu"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
            >
              <Dumbbell className="h-4 w-4 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Muscu</p>
                <p className="text-xs text-muted-foreground">Exercices et progression</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
