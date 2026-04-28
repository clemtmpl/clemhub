import { getTriathlonCompleted } from '@/modules/triathlon/queries'
import { PHASES, PROGRAM, getPhaseForWeek, DISCIPLINE_COLORS, DISCIPLINE_LABELS, SESSION_TYPE_LABELS } from '@/modules/triathlon/data'
import { WeekToggle } from '@/modules/triathlon/components/week-toggle'

const TOTAL_WEEKS = 25

function sessionTypeColor(type: string) {
  switch (type) {
    case 'seuil': return 'text-amber-400 bg-amber-500/10'
    case 'fractionne': return 'text-rose-400 bg-rose-500/10'
    case 'fartlek': return 'text-orange-400 bg-orange-500/10'
    case 'recup': return 'text-sky-400 bg-sky-500/10'
    case 'muscu': return 'text-violet-400 bg-violet-500/10'
    case 'repos': return 'text-muted-foreground bg-muted/50'
    case 'sprint': return 'text-rose-400 bg-rose-500/10'
    default: return 'text-emerald-400 bg-emerald-500/10'
  }
}

export default async function ProgrammePage() {
  const completed = await getTriathlonCompleted()
  const completedSet = new Set(completed.map((c) => `${c.week}-${c.day}`))

  // Determine current week
  let currentWeek = TOTAL_WEEKS
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const days = PROGRAM[w] ?? {}
    const totalDays = Object.keys(days).length
    const completedDays = Object.keys(days).filter((d) => completedSet.has(`${w}-${d}`)).length
    if (completedDays < totalDays) { currentWeek = w; break }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Programme 25 semaines</h1>
        <p className="text-muted-foreground text-sm mt-1">Préparation Half Ironman — coche les séances au fur et à mesure</p>
      </div>

      {/* Phases overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PHASES.map((phase) => (
          <div
            key={phase.id}
            className="rounded-xl border p-4"
            style={{ borderColor: `${phase.color}30`, backgroundColor: `${phase.color}08` }}
          >
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: phase.color }}>
              Phase {phase.id}
            </p>
            <p className="font-semibold mt-0.5 text-sm">{phase.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              S{phase.weeks[0]}–S{phase.weeks[phase.weeks.length - 1]}
            </p>
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="space-y-4">
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((week) => {
          const phase = getPhaseForWeek(week)
          const weekDays = PROGRAM[week] ?? {}
          const weekCompleted = Object.keys(weekDays).filter((d) => completedSet.has(`${week}-${d}`)).length
          const isCurrentWeek = week === currentWeek

          return (
            <div
              key={week}
              className={`rounded-xl border bg-card overflow-hidden ${
                isCurrentWeek ? 'border-primary/40 shadow-sm shadow-primary/10' : 'border-border'
              }`}
            >
              {/* Week header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: phase.color }}
                  >
                    {week}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Semaine {week}
                      {isCurrentWeek && (
                        <span className="ml-2 text-xs text-primary font-normal">(en cours)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{phase.name}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {weekCompleted}/{Object.keys(weekDays).length}
                </span>
              </div>

              {/* Days grid */}
              <div className="divide-y divide-border">
                {Object.entries(weekDays).map(([dayStr, sessions]) => {
                  const day = Number(dayStr)
                  const key = `${week}-${day}`
                  const isDone = completedSet.has(key)
                  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

                  return (
                    <div key={day} className={`flex items-start gap-3 px-5 py-3 ${isDone ? 'opacity-60' : ''}`}>
                      <WeekToggle week={week} day={day} isDone={isDone} />
                      <div className="pt-0.5 w-8 flex-shrink-0">
                        <p className="text-xs font-medium text-muted-foreground">{dayLabels[day - 1]}</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {sessions.map((session, idx) => (
                          <div key={idx} className="flex flex-wrap items-start gap-2">
                            {session.discipline && (
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${DISCIPLINE_COLORS[session.discipline]}15`,
                                  color: DISCIPLINE_COLORS[session.discipline],
                                }}
                              >
                                {DISCIPLINE_LABELS[session.discipline]}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sessionTypeColor(session.type)}`}>
                              {SESSION_TYPE_LABELS[session.type]}
                            </span>
                            <div className="w-full">
                              <p className="text-sm font-medium">{session.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{session.detail}</p>
                              {(session.duration || session.distance) && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {[session.duration, session.distance].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
