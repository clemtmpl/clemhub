'use client'

import { useState } from 'react'
import type { Database } from '@/types/database'
import { EventDialog } from './event-dialog'
import { formatTime, getWeekGrid, isSameDay, parseISO } from '../lib/dates'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type Category = Database['public']['Tables']['calendar_categories']['Row']
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  categories: Category[]
}

const HOUR_HEIGHT = 48
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function WeekView({ currentDate, events, categories }: WeekViewProps) {
  const [creatingForDate, setCreatingForDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const days = getWeekGrid(currentDate)
  const today = new Date()

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 bg-card z-10">
          <div />
          {days.map((day, i) => {
            const isToday = isSameDay(day, today)
            return (
              <div key={i} className="text-center py-2 border-l border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {format(day, 'EEE', { locale: fr })}
                </p>
                <p
                  className={cn(
                    'inline-flex items-center justify-center text-sm h-7 w-7 rounded-full mt-0.5',
                    isToday && 'bg-primary text-primary-foreground font-semibold'
                  )}
                >
                  {day.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        <div className="overflow-y-auto max-h-[700px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
            <div className="border-r border-border">
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_HEIGHT }}
                  className="text-[10px] text-muted-foreground text-right pr-2 pt-1 border-b border-border"
                >
                  {h.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {days.map((day, dayIdx) => {
              const dayEvents = events.filter((e) =>
                isSameDay(parseISO(e.starts_at), day)
              )
              return (
                <div
                  key={dayIdx}
                  className="relative border-r border-border"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const hour = Math.floor(y / HOUR_HEIGHT)
                    const minute = Math.floor(((y % HOUR_HEIGHT) / HOUR_HEIGHT) * 60 / 15) * 15
                    const date = new Date(day)
                    date.setHours(hour, minute, 0, 0)
                    setCreatingForDate(date)
                  }}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      style={{ height: HOUR_HEIGHT }}
                      className="border-b border-border hover:bg-accent/30 transition-colors cursor-pointer"
                    />
                  ))}

                  {dayEvents.map((event) => {
                    if (event.all_day) return null
                    const start = parseISO(event.starts_at)
                    const end = parseISO(event.ends_at)
                    const top = start.getHours() * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT
                    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                    const height = Math.max(duration * HOUR_HEIGHT, 24)

                    const cat = categories.find((c) => c.id === event.category_id)
                    const color = event.color_override ?? cat?.color ?? '#F97316'

                    return (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          const realId = event.id.includes('__') ? event.id.split('__')[0] : event.id
                          setSelectedEvent({ ...event, id: realId })
                        }}
                        className="absolute left-0.5 right-0.5 rounded text-left px-1.5 py-0.5 overflow-hidden hover:opacity-90 transition-opacity"
                        style={{
                          top,
                          height,
                          backgroundColor: `${color}30`,
                          borderLeft: `2px solid ${color}`,
                          color,
                        }}
                      >
                        <p className="text-[10px] font-medium tabular-nums opacity-80">
                          {formatTime(event.starts_at)}
                        </p>
                        <p className="text-xs font-medium truncate">{event.title}</p>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
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

      {selectedEvent && (
        <EventDialog
          categories={categories}
          existing={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(o) => !o && setSelectedEvent(null)}
        />
      )}
    </>
  )
}
