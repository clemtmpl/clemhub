import { createClient } from '@/lib/supabase/server'
import { MODULES } from '@/modules/registry'
import { ModuleCard } from '@/components/shared/module-card'
import { TodayWidget } from '@/modules/calendar/components/today-widget'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'toi'
  const hour = new Date().getHours()
  const greeting = hour < 6 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="space-y-10">
      <div className="space-y-2 animate-fade-up">
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="text-ember-gradient animate-shine">{firstName}</span>
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Bienvenue sur ton portail. Accède à tous tes outils depuis un seul endroit.
        </p>
      </div>

      <TodayWidget />

      <div>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Mes modules
          </h2>
          <span className="text-xs text-muted-foreground">
            {MODULES.filter((m) => m.enabled).length} disponibles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.filter((m) => m.enabled).map((module, index) => (
            <ModuleCard
              key={module.key}
              moduleKey={module.key}
              name={module.name}
              description={module.description}
              href={module.href}
              accent={module.accent}
              glow={module.glow}
              comingSoon={module.comingSoon}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
