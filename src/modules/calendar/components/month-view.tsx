'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import type { Database } from '@/types/database'
import { EventDialog } from './event-dialog'
import { EventPill } from './event-pill'
import {
  DAYS_FR, getMonthGrid, isSameDay, isSameMonth, parseISO,
} from '../lib/dates'
import { cn } from '@/lib/utils'

type Category = Database['public']['Tables']['calendar_categories']['Row']
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  categories: Category[]
}

export function MonthView({ currentDate, events, categories }: MonthViewProps) {
  const [creatingForDate, setCreatingForDate] = useState<Date | null>(null)
  const days = getMonthGrid(currentDate)
  const today = new Date()

  const eventsByDay = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const dayKey = format(parseISO(event.starts_at), 'yyyy-MM-dd')
    const arr = eventsByDay.get(dayKey) ?? []
    arr.push(event)
    eventsByDay.set(dayKey, arr)
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS_FR.map((day, i) => (
            <div
              key={i}
              className="text-center py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 auto-rows-fr">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, today)
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDay.get(dayKey) ?? []
            const visibleEvents = dayEvents.slice(0, 3)
            const hiddenCount = dayEvents.length - visibleEvents.length

            return (
              <div
                key={i}
                onClick={() => setCreatingForDate(day)}
                className={cn(
                  'group relative min-h-[90px] border-r border-b border-border p-1.5 cursor-pointer transition-colors',
                  'hover:bg-accent/30',
                  !isCurrentMonth && 'bg-muted/20',
                  (i + 1) % 7 === 0 && 'border-r-0'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center text-xs h-6 w-6 rounded-full',
                      isToday && 'bg-primary text-primary-foreground font-semibold',
                      !isToday && !isCurrentMonth && 'text-muted-foreground/40',
                      !isToday && isCurrentMonth && 'text-foreground'
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {visibleEvents.map((event) => (
                    <EventPill
                      key={event.id}
                      event={event}
                      categories={categories}
                      compact
                    />
                  ))}
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      className="w-full text-left text-[10px] text-muted-foreground hover:text-foreground px-1.5"
                    >
                      +{hiddenCount} autre{hiddenCount > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {creatingForDate && (
        <EventDialog
          categories={categories}
          initialDate={creatingForDate}
          open={!!creatingForDate}
          onOpenChange={(o) => !o && setCreatingForDate(null)}
        />
      )}
    </>
  )
}
