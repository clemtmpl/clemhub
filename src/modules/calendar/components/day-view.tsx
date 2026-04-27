'use client'

import type { Database } from '@/types/database'
import { EventPill } from './event-pill'
import { formatDayLabel, formatRelativeDay, formatTimeRange, parseISO } from '../lib/dates'
import { Clock, MapPin, AlignLeft } from 'lucide-react'

type Category = Database['public']['Tables']['calendar_categories']['Row']
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  categories: Category[]
}

export function DayView({ currentDate, events, categories }: DayViewProps) {
  const sortedEvents = [...events].sort(
    (a, b) => parseISO(a.starts_at).getTime() - parseISO(b.starts_at).getTime()
  )

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">{formatRelativeDay(currentDate)}</p>
        <h2 className="text-2xl font-semibold capitalize">{formatDayLabel(currentDate, { withWeekday: true })}</h2>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">Aucun événement ce jour</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedEvents.map((event) => {
            const cat = categories.find((c) => c.id === event.category_id)
            const color = event.color_override ?? cat?.color ?? '#F97316'
            return (
              <li
                key={event.id}
                className="rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
                style={{ borderLeftColor: color, borderLeftWidth: 3 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{event.title}</h3>
                  {cat && (
                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {cat.name}
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    {event.all_day ? (
                      <span>Toute la journée</span>
                    ) : (
                      <span>{formatTimeRange(event.starts_at, event.ends_at)}</span>
                    )}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.description && (
                    <div className="flex items-start gap-2">
                      <AlignLeft className="h-3.5 w-3.5 mt-0.5" />
                      <span className="line-clamp-2">{event.description}</span>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
