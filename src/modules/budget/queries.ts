import { createClient } from '@/lib/supabase/server'
import { monthRange } from './lib/calculations'

export async function getBudgetOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { start, end } = monthRange()

  const [categoriesRes, subscriptionsRes, transactionsRes, accountsRes] = await Promise.all([
    supabase.from('budget_categories').select('*').eq('user_id', user.id).order('sort_order'),
    supabase.from('budget_subscriptions').select('*').eq('user_id', user.id).order('amount', { ascending: false }),
    supabase.from('budget_transactions').select('*').eq('user_id', user.id).gte('occurred_on', start).lte('occurred_on', end).order('occurred_on', { ascending: false }),
    supabase.from('budget_accounts').select('*').eq('user_id', user.id).eq('is_active', true),
  ])

  return {
    categories: categoriesRes.data ?? [],
    subscriptions: subscriptionsRes.data ?? [],
    transactions: transactionsRes.data ?? [],
    accounts: accountsRes.data ?? [],
  }
}

export async function getRecentTransactions(limit = 5) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('budget_transactions')
    .select('*, category:budget_categories(name, icon, color)')
    .eq('user_id', user.id)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getMissions(limit = 12) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('budget_missions')
    .select('*')
    .eq('user_id', user.id)
    .order('week_start', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function getCurrentWeekMission() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today)
  monday.setDate(diff)
  const weekStart = monday.toISOString().slice(0, 10)

  const { data } = await supabase
    .from('budget_missions')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .maybeSingle()

  return data
}

export async function getEnvelopesWithSpending() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { start, end } = monthRange()

  const { data: envelopes } = await supabase
    .from('budget_envelopes')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (!envelopes || envelopes.length === 0) return []

  const { data: transactions } = await supabase
    .from('budget_transactions')
    .select('category_id, amount')
    .eq('user_id', user.id)
    .eq('kind', 'expense')
    .gte('occurred_on', start)
    .lte('occurred_on', end)

  const spendingByCategory = new Map<string, number>()
  for (const tx of transactions ?? []) {
    if (!tx.category_id) continue
    spendingByCategory.set(
      tx.category_id,
      (spendingByCategory.get(tx.category_id) ?? 0) + Number(tx.amount)
    )
  }

  return envelopes.map((env) => ({
    ...env,
    spent: env.category_id ? spendingByCategory.get(env.category_id) ?? 0 : 0,
  }))
}

export async function getPlannedExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('budget_planned_expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('status', { ascending: true })
    .order('amount', { ascending: false })

  return data ?? []
}

export async function getSavingsPlan() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('budget_savings_plan')
    .select('*')
    .eq('user_id', user.id)
    .order('step_order', { ascending: true })

  return data ?? []
}

export async function getBudgetProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('budget_profile')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return data
}