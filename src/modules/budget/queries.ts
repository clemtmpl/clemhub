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