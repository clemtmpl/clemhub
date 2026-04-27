import { createClient } from '@/lib/supabase/server'
import { endOfDay, startOfDay } from 'date-fns'
import { expandRecurringEvents } from './lib/recurrence'

export async function getCalendarCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('calendar_categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  return data ?? []
}

export async function getEventsInRange(rangeStart: Date, rangeEnd: Date) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: ponctuels } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .eq('recurrence', 'none')
    .gte('ends_at', rangeStart.toISOString())
    .lte('starts_at', rangeEnd.toISOString())

  const { data: recurrents } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', user.id)
    .neq('recurrence', 'none')
    .lte('starts_at', rangeEnd.toISOString())

  const all = [...(ponctuels ?? []), ...(recurrents ?? [])]
  return expandRecurringEvents(all, rangeStart, rangeEnd)
}

export async function getTodayEvents() {
  const today = new Date()
  return getEventsInRange(startOfDay(today), endOfDay(today))
}

export async function getEventById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  return data
}
