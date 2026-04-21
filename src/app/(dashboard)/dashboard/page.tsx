import Link from 'next/link'
import { MODULES } from '@/modules/registry'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon portail</h1>
        <p className="text-muted-foreground">Tous tes outils en un seul endroit</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.filter((m) => m.enabled).map((module) => {
          const Icon = module.icon
          return (
            <Link key={module.key} href={module.href} className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className={cn(
                    'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2',
                    module.gradient
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {module.name}
                    {module.comingSoon && (
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Bientôt
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}