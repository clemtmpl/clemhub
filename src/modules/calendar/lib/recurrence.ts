import { addDays, addMonths, addWeeks, addYears, isAfter, isBefore, parseISO, startOfDay } from 'date-fns'
import type { Database } from '@/types/database'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']

export function expandRecurringEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  const expanded: CalendarEvent[] = []

  for (const event of events) {
    if (event.recurrence === 'none' || !event.recurrence) {
      expanded.push(event)
      continue
    }

    const baseStart = parseISO(event.starts_at)
    const baseEnd = parseISO(event.ends_at)
    const duration = baseEnd.getTime() - baseStart.getTime()

    const recEnd = event.recurrence_end_date
      ? parseISO(event.recurrence_end_date)
      : addYears(baseStart, 2)

    let occurrenceStart = baseStart
    let count = 0
    const maxOccurrences = 200

    while (count < maxOccurrences && !isAfter(startOfDay(occurrenceStart), startOfDay(recEnd))) {
      const occurrenceEnd = new Date(occurrenceStart.getTime() + duration)
      if (
        !isAfter(occurrenceStart, rangeEnd) &&
        !isBefore(occurrenceEnd, rangeStart)
      ) {
        expanded.push({
          ...event,
          id: `${event.id}__${count}`,
          starts_at: occurrenceStart.toISOString(),
          ends_at: occurrenceEnd.toISOString(),
          recurrence_parent_id: event.id,
        } as CalendarEvent)
      }

      if (isAfter(occurrenceStart, rangeEnd)) break

      switch (event.recurrence) {
        case 'daily':   occurrenceStart = addDays(occurrenceStart, 1); break
        case 'weekly':  occurrenceStart = addWeeks(occurrenceStart, 1); break
        case 'monthly': occurrenceStart = addMonths(occurrenceStart, 1); break
        case 'yearly':  occurrenceStart = addYears(occurrenceStart, 1); break
        default:
          count = maxOccurrences
          break
      }
      count++
    }
  }

  return expanded.sort(
    (a, b) => parseISO(a.starts_at).getTime() - parseISO(b.starts_at).getTime()
  )
}

export function getRealEventId(eventId: string): string {
  return eventId.includes('__') ? eventId.split('__')[0] : eventId
}
