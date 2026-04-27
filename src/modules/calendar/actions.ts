'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const EventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  starts_at: z.string(),
  ends_at: z.string(),
  all_day: z.boolean().default(false),
  category_id: z.string().uuid().nullable().optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
  recurrence_end_date: z.string().nullable().optional(),
  reminders_minutes: z.array(z.number().int().min(0)).default([10080, 1440]),
})

export async function createEvent(input: z.input<typeof EventSchema>) {
  const parsed = EventSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('calendar_events').insert({
    ...parsed,
    user_id: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/modules/calendar', 'layout')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateEvent(id: string, input: Partial<z.input<typeof EventSchema>>) {
  const parsed = EventSchema.partial().parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('calendar_events').update(parsed).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/calendar', 'layout')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/calendar', 'layout')
  revalidatePath('/dashboard')
  return { success: true }
}
