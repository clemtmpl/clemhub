import { createClient } from '@/lib/supabase/server'

export async function getTriathlonSessions(limit = 50) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('triathlon_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getTriathlonWeights(limit = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('triathlon_weights')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getTriathlonCompleted() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('triathlon_completed')
    .select('*')
    .eq('user_id', user.id)

  return data ?? []
}

export async function getTriathlonStrengthSessions(limit = 50) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('triathlon_strength_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getTriathlonData() {
  const [sessions, weights, completed, strengthSessions] = await Promise.all([
    getTriathlonSessions(),
    getTriathlonWeights(),
    getTriathlonCompleted(),
    getTriathlonStrengthSessions(),
  ])
  return { sessions, weights, completed, strengthSessions }
}
