'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronRight, Plus } from 'lucide-react'
import type { Database } from '@/types/database'
import { EventDialog } from './event-dialog'
import { EventPill } from './event-pill'
import {
  DAYS_FR, formatRelativeDay, formatTimeRange, formatTime,
  getMonthGrid, isSameDay, isSameMonth, parseISO,
} from '../lib/dates'
import { getRealEventId } from '../lib/recurrence'
import { cn } from '@/lib/utils'

type Category = Database['public']['Tables']['calendar_categories']['Row']
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  categories: Category[]
}

export function MonthView({ currentDate, events, categories }: MonthViewProps) {
  const today = new Date()
  const days = getMonthGrid(currentDate)

  const [selectedDay, setSelectedDay] = useState<Date>(today)
  const [creatingForDate, setCreatingForDate] = useState<Date | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const eventsByDay = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const dayKey = format(parseISO(event.starts_at), 'yyyy-MM-dd')
    const arr = eventsByDay.get(dayKey) ?? []
    arr.push(event)
    eventsByDay.set(dayKey, arr)
  }

  const selectedDayKey = format(selectedDay, 'yyyy-MM-dd')
  const selectedDayEvents = (eventsByDay.get(selectedDayKey) ?? []).sort(
    (a, b) => parseISO(a.starts_at).getTime() - parseISO(b.starts_at).getTime()
  )

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    if (!isMobile) setCreatingForDate(day)
  }

  return (
    <>
      {/* Grille calendrier */}
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

        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, today)
            const isSelected = isSameDay(day, selectedDay)
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDay.get(dayKey) ?? []
            const visibleEvents = dayEvents.slice(0, 3)
            const hiddenCount = dayEvents.length - visibleEvents.length

            return (
              <div
                key={i}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'relative border-r border-b border-border cursor-pointer transition-colors',
                  'min-h-[56px] sm:min-h-[90px]',
                  'p-1 sm:p-1.5',
                  'hover:bg-accent/30',
                  !isCurrentMonth && 'bg-muted/20',
                  isSelected && isMobile && 'bg-primary/5',
                  (i + 1) % 7 === 0 && 'border-r-0'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center text-xs h-6 w-6 rounded-full',
                      isToday && 'bg-primary text-primary-foreground font-semibold',
                      isSelected && isMobile && !isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                      !isToday && !isCurrentMonth && 'text-muted-foreground/40',
                      !isToday && isCurrentMonth && 'text-foreground'
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* Desktop : event pills */}
                <div className="hidden sm:block space-y-0.5">
                  {visibleEvents.map((event) => (
                    <EventPill key={event.id} event={event} categories={categories} compact />
                  ))}
                  {hiddenCount > 0 && (
                    <p className="text-[10px] text-muted-foreground px-1.5">
                      +{hiddenCount} autre{hiddenCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Mobile : points de couleur */}
                <div className="sm:hidden flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 3).map((event) => {
                    const cat = categories.find((c) => c.id === event.category_id)
                    const color = event.color_override ?? cat?.color ?? '#F97316'
                    return (
                      <span
                        key={event.id}
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile : panneau du jour sélectionné */}
      <div className="sm:hidden rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <p className="font-semibold text-sm">{formatRelativeDay(selectedDay)}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {format(selectedDay, 'EEEE d MMMM', { locale: fr })}
            </p>
          </div>
          <EventDialog
            categories={categories}
            initialDate={selectedDay}
            trigger={
              <button
                type="button"
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              >
                <Plus className="h-4 w-4" />
              </button>
            }
          />
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Aucun événement</p>
          </div>
        ) : (
          <ul>
            {selectedDayEvents.map((event) => {
              const cat = categories.find((c) => c.id === event.category_id)
              const color = event.color_override ?? cat?.color ?? '#F97316'
              const realId = getRealEventId(event.id)

              return (
                <EventDialog
                  key={event.id}
                  categories={categories}
                  existing={{ ...event, id: realId }}
                  trigger={
                    <li className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 cursor-pointer active:bg-accent/50 transition-colors select-none">
                      <div
                        className="w-1 self-stretch rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.all_day
                            ? 'Toute la journée'
                            : formatTimeRange(event.starts_at, event.ends_at)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </li>
                  }
                />
              )
            })}
          </ul>
        )}
      </div>

      {/* Desktop : dialog de création */}
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
