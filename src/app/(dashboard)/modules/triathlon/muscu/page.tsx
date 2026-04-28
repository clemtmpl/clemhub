import { getTriathlonStrengthSessions } from '@/modules/triathlon/queries'
import { EXERCISE_DB } from '@/modules/triathlon/data'
import { LogStrengthDialog } from '@/modules/triathlon/components/log-strength-dialog'

export default async function MuscuPage() {
  const sessions = await getTriathlonStrengthSessions()

  const byExercise = sessions.reduce<Record<string, typeof sessions>>(
    (acc, s) => {
      if (!acc[s.exercise_key]) acc[s.exercise_key] = []
      acc[s.exercise_key].push(s)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Musculation</h1>
          <p className="text-muted-foreground text-sm mt-1">Exercices complémentaires pour le triathlon</p>
        </div>
        <LogStrengthDialog />
      </div>

      {/* Exercise library */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Bibliothèque d&apos;exercices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(EXERCISE_DB).map(([key, ex]) => {
            const exerciseSessions = byExercise[key] ?? []
            const lastSession = exerciseSessions[0]
            const bestWeight = exerciseSessions.reduce(
              (max, s) => Math.max(max, s.weight_kg ?? 0),
              0
            )

            return (
              <div key={key} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{ex.name}</h3>
                  <LogStrengthDialog exerciseKey={key} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{ex.muscles}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{ex.sets} séries</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{ex.reps} reps</span>
                  {ex.rest && <span className="px-2 py-0.5 rounded-full bg-accent text-muted-foreground">Récup {ex.rest}</span>}
                </div>
                {ex.note && <p className="text-xs text-muted-foreground mt-2 italic">{ex.note}</p>}
                {lastSession && (
                  <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                    Dernière fois : {new Date(lastSession.date).toLocaleDateString('fr-FR')}
                    {lastSession.sets && lastSession.reps ? ` · ${lastSession.sets}×${lastSession.reps}` : ''}
                    {lastSession.weight_kg ? ` · ${lastSession.weight_kg}kg` : ''}
                    {bestWeight > 0 && ` · Best: ${bestWeight}kg`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent strength sessions */}
      {sessions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold mb-4">Historique muscu</h2>
          <ul className="divide-y divide-border">
            {sessions.slice(0, 15).map((s) => {
              const ex = EXERCISE_DB[s.exercise_key]
              return (
                <li key={s.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{ex?.name ?? s.exercise_key}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString('fr-FR')}
                      {s.sets && s.reps ? ` · ${s.sets}×${s.reps}` : ''}
                    </p>
                  </div>
                  {s.weight_kg && (
                    <span className="text-sm font-medium">{s.weight_kg}kg</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
