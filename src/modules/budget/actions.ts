'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const TransactionSchema = z.object({
  amount: z.coerce.number().positive(),
  kind: z.enum(['income', 'expense']),
  label: z.string().min(1).max(120),
  category_id: z.string().uuid().nullable().optional(),
  note: z.string().max(500).optional().nullable(),
  occurred_on: z.string().optional(),
})

export async function createTransaction(input: z.input<typeof TransactionSchema>) {
  const parsed = TransactionSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('budget_transactions').insert({
    ...parsed,
    user_id: user.id,
    occurred_on: parsed.occurred_on ?? new Date().toISOString().slice(0, 10),
  })

  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('budget_transactions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

const SubscriptionSchema = z.object({
  name: z.string().min(1).max(80),
  amount: z.coerce.number().positive(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  billing_day: z.coerce.number().int().min(1).max(31).nullable().optional(),
  icon: z.string().default('CreditCard'),
  color: z.string().default('#F97316'),
  category_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).optional().nullable(),
})

export async function createSubscription(input: z.input<typeof SubscriptionSchema>) {
  const parsed = SubscriptionSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('budget_subscriptions').insert({
    ...parsed,
    user_id: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function toggleSubscription(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('budget_subscriptions').update({ is_active }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('budget_subscriptions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}