'use client'

import { useState } from 'react'
import type { Database } from '@/types/database'
import { EventDialog } from './event-dialog'
import { formatTime } from '../lib/dates'
import { getRealEventId } from '../lib/recurrence'
import { cn } from '@/lib/utils'

type Category = Database['public']['Tables']['calendar_categories']['Row']
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

interface EventPillProps {
  event: CalendarEvent
  categories: Category[]
  compact?: boolean
}

export function EventPill({ event, categories, compact = false }: EventPillProps) {
  const [open, setOpen] = useState(false)
  const cat = categories.find((c) => c.id === event.category_id)
  const color = event.color_override ?? cat?.color ?? '#F97316'

  const realId = getRealEventId(event.id)
  const realEvent = realId === event.id ? event : { ...event, id: realId }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className={cn(
          'group w-full text-left rounded transition-all hover:opacity-90',
          compact
            ? 'px-1.5 py-0.5 text-[10px] truncate'
            : 'px-2 py-1 text-xs flex items-center gap-1.5'
        )}
        style={{
          backgroundColor: `${color}25`,
          borderLeft: `2px solid ${color}`,
          color: color,
        }}
      >
        {!compact && !event.all_day && (
          <span className="font-medium tabular-nums opacity-80">
            {formatTime(event.starts_at)}
          </span>
        )}
        <span className="truncate font-medium">{event.title}</span>
      </button>

      <EventDialog
        categories={categories}
        existing={realEvent}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
