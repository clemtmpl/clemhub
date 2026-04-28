'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const SessionSchema = z.object({
  date: z.string(),
  discipline: z.enum(['swim', 'bike', 'run']),
  duration_min: z.coerce.number().positive().nullable().optional(),
  distance_km: z.coerce.number().positive().nullable().optional(),
  heart_rate_avg: z.coerce.number().int().positive().nullable().optional(),
  rpe: z.coerce.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export async function logSession(input: z.input<typeof SessionSchema>) {
  const parsed = SessionSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('triathlon_sessions').insert({
    ...parsed,
    user_id: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/modules/triathlon', 'layout')
  return { success: true }
}

export async function deleteSession(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('triathlon_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/modules/triathlon', 'layout')
  return { success: true }
}

const WeightSchema = z.object({
  date: z.string(),
  weight_kg: z.coerce.number().positive(),
  body_fat_pct: z.coerce.number().min(0).max(60).nullable().optional(),
})

export async function logWeight(input: z.input<typeof WeightSchema>) {
  const parsed = WeightSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('triathlon_weights').insert({
    ...parsed,
    user_id: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/modules/triathlon', 'layout')
  return { success: true }
}

const CompletedSchema = z.object({
  week: z.coerce.number().int().min(1).max(25),
  day: z.coerce.number().int().min(1).max(7),
})

export async function toggleCompleted(input: z.input<typeof CompletedSchema>) {
  const { week, day } = CompletedSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: existing } = await supabase
    .from('triathlon_completed')
    .select('id')
    .eq('user_id', user.id)
    .eq('week', week)
    .eq('day', day)
    .maybeSingle()

  if (existing) {
    await supabase.from('triathlon_completed').delete().eq('id', existing.id)
  } else {
    await supabase.from('triathlon_completed').insert({ user_id: user.id, week, day })
  }

  revalidatePath('/modules/triathlon', 'layout')
  return { success: true }
}

const StrengthSessionSchema = z.object({
  date: z.string(),
  exercise_key: z.string().min(1),
  sets: z.coerce.number().int().positive().nullable().optional(),
  reps: z.coerce.number().int().positive().nullable().optional(),
  weight_kg: z.coerce.number().positive().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export async function logStrengthSession(input: z.input<typeof StrengthSessionSchema>) {
  const parsed = StrengthSessionSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('triathlon_strength_sessions').insert({
    ...parsed,
    user_id: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath('/modules/triathlon', 'layout')
  return { success: true }
}

export async function askCoach(messages: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: 'Coach IA non configuré' }

  const systemPrompt = `Tu es un coach de triathlon expert spécialisé dans la préparation au Half Ironman (Ironman 70.3).
Tu accompagnes un athlète dans un programme de 25 semaines qui comprend natation, vélo, course à pied et musculation.
Tu parles français, tu es encourageant mais direct. Tu donnes des conseils pratiques et basés sur la science du sport.
Tu connais les zones d'entraînement (Z1-Z5), la périodisation, la nutrition du sport, la récupération et la prévention des blessures.
Tes réponses sont concises (2-4 paragraphes max) sauf si une explication détaillée est nécessaire.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { error: `Erreur API: ${err}` }
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    return { message: text }
  } catch {
    return { error: 'Impossible de contacter le coach IA' }
  }
}
