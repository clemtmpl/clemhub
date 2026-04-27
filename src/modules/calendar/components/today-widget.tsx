import Link from 'next/link'
import { Calendar, ArrowRight, Clock, MapPin } from 'lucide-react'
import { getCalendarCategories, getTodayEvents } from '../queries'
import { formatTime, formatTimeRange, parseISO } from '../lib/dates'

export async function TodayWidget() {
  const [events, categories] = await Promise.all([
    getTodayEvents(),
    getCalendarCategories(),
  ])

  const sorted = [...events].sort(
    (a, b) => parseISO(a.starts_at).getTime() - parseISO(b.starts_at).getTime()
  )

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h2 className="font-semibold">Aujourd&apos;hui</h2>
        </div>
        <Link
          href="/modules/calendar"
          className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 group"
        >
          Voir l&apos;agenda
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground">Aucun événement aujourd&apos;hui</p>
          <p className="text-xs text-muted-foreground mt-1">Profite de cette journée libre 🌤️</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.slice(0, 4).map((event) => {
            const cat = categories.find((c) => c.id === event.category_id)
            const color = event.color_override ?? cat?.color ?? '#F97316'
            return (
              <li
                key={event.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors"
                style={{ borderLeft: `2px solid ${color}` }}
              >
                <div className="flex-shrink-0 text-xs font-medium tabular-nums w-12">
                  {event.all_day ? (
                    <span className="text-muted-foreground">Jour</span>
                  ) : (
                    <span style={{ color }}>{formatTime(event.starts_at)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {!event.all_day && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeRange(event.starts_at, event.ends_at)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
          {sorted.length > 4 && (
            <li className="text-xs text-muted-foreground text-center pt-2">
              +{sorted.length - 4} autre{sorted.length - 4 > 1 ? 's' : ''}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
