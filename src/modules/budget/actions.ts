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

const MissionSchema = z.object({
  week_start: z.string(),
  week_end: z.string(),
  fees_received: z.coerce.number().min(0),
  cost_housing: z.coerce.number().min(0).default(0),
  cost_food: z.coerce.number().min(0).default(0),
  cost_transport: z.coerce.number().min(0).default(0),
  cost_other: z.coerce.number().min(0).default(0),
  location: z.string().default('Rodez'),
  notes: z.string().optional().nullable(),
})

export async function upsertMission(input: z.input<typeof MissionSchema>) {
  const parsed = MissionSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('budget_missions')
    .upsert(
      { ...parsed, user_id: user.id },
      { onConflict: 'user_id,week_start' }
    )

  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function deleteMission(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('budget_missions').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

const PlannedExpenseSchema = z.object({
  name: z.string().min(1).max(80),
  amount: z.coerce.number().positive(),
  frequency: z.enum(['monthly', 'yearly']),
  status: z.enum(['planned', 'active', 'ended']),
  starts_on: z.string().nullable().optional(),
  ends_on: z.string().nullable().optional(),
  icon: z.string().default('Calendar'),
  color: z.string().default('#F97316'),
  category_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  simulate_as_saving: z.boolean().default(false),
})

export async function createPlannedExpense(input: z.input<typeof PlannedExpenseSchema>) {
  const parsed = PlannedExpenseSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('budget_planned_expenses').insert({
    ...parsed,
    user_id: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function updatePlannedExpense(
  id: string,
  input: Partial<z.input<typeof PlannedExpenseSchema>>
) {
  const parsed = PlannedExpenseSchema.partial().parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('budget_planned_expenses').update(parsed).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function setPlannedExpenseStatus(
  id: string,
  status: 'planned' | 'active' | 'ended'
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('budget_planned_expenses')
    .update({ status, starts_on: status === 'active' ? new Date().toISOString().slice(0, 10) : null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function togglePlannedSimulation(id: string, simulate_as_saving: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('budget_planned_expenses')
    .update({ simulate_as_saving })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function deletePlannedExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('budget_planned_expenses').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

const EnvelopeSchema = z.object({
  name: z.string().min(1).max(80),
  monthly_limit: z.coerce.number().positive(),
  category_id: z.string().uuid().nullable().optional(),
  icon: z.string().default('Wallet'),
  color: z.string().default('#F97316'),
  alert_threshold_pct: z.coerce.number().int().min(0).max(100).default(75),
})

export async function createEnvelope(input: z.input<typeof EnvelopeSchema>) {
  const parsed = EnvelopeSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('budget_envelopes').insert({
    ...parsed,
    user_id: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function updateEnvelope(
  id: string,
  input: Partial<z.input<typeof EnvelopeSchema>>
) {
  const parsed = EnvelopeSchema.partial().parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('budget_envelopes').update(parsed).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function deleteEnvelope(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('budget_envelopes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

const SavingsPlanStepSchema = z.object({
  step_order: z.coerce.number().int().min(1),
  name: z.string().min(1).max(80),
  description: z.string().max(500).nullable().optional(),
  target_amount: z.coerce.number().min(0).nullable().optional(),
  target_formula: z.string().nullable().optional(),
  account_target: z.string().nullable().optional(),
  icon: z.string().default('Target'),
  color: z.string().default('#F97316'),
})

export async function createSavingsStep(input: z.input<typeof SavingsPlanStepSchema>) {
  const parsed = SavingsPlanStepSchema.parse(input)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('budget_savings_plan').insert({
    ...parsed,
    user_id: user.id,
  })
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function toggleStepAchieved(id: string, is_achieved: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('budget_savings_plan')
    .update({
      is_achieved,
      achieved_at: is_achieved ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function deleteSavingsStep(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('budget_savings_plan').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}

export async function updateAccountBalance(id: string, balance: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('budget_accounts')
    .update({ balance })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/modules/budget', 'layout')
  return { success: true }
}