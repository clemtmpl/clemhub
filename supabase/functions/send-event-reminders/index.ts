// @ts-nocheck — Deno runtime, pas Node
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:noreply@clemhub.app'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

interface EventToNotify {
  event_id: string
  user_id: string
  title: string
  starts_at: string
  location: string | null
  reminder_minutes: number
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const sentCount = { sent: 0, skipped: 0, failed: 0 }

  const { data: events, error } = await supabase
    .from('calendar_events')
    .select('id, user_id, title, starts_at, location, reminders_minutes')
    .gte('starts_at', now.toISOString())
    .lte('starts_at', new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString())

  if (error) {
    console.error('Fetch events error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const toNotify: EventToNotify[] = []

  for (const event of events ?? []) {
    const eventStart = new Date(event.starts_at)
    const reminders = event.reminders_minutes ?? [10080, 1440]

    for (const minutes of reminders) {
      const reminderTime = new Date(eventStart.getTime() - minutes * 60 * 1000)
      const diffMs = now.getTime() - reminderTime.getTime()
      if (diffMs >= 0 && diffMs < 20 * 60 * 1000) {
        toNotify.push({
          event_id: event.id,
          user_id: event.user_id,
          title: event.title,
          starts_at: event.starts_at,
          location: event.location,
          reminder_minutes: minutes,
        })
      }
    }
  }

  for (const item of toNotify) {
    const { data: existing } = await supabase
      .from('notification_log')
      .select('id')
      .eq('event_id', item.event_id)
      .eq('reminder_minutes', item.reminder_minutes)
      .maybeSingle()

    if (existing) {
      sentCount.skipped++
      continue
    }

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', item.user_id)

    if (!subs || subs.length === 0) {
      sentCount.skipped++
      continue
    }

    const eventDate = new Date(item.starts_at)
    const reminderLabel =
      item.reminder_minutes === 10080 ? 'Dans 7 jours'
      : item.reminder_minutes === 1440 ? 'Demain'
      : item.reminder_minutes === 60 ? 'Dans 1 heure'
      : `Dans ${item.reminder_minutes} min`

    const dateStr = eventDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })

    const payload = JSON.stringify({
      title: `${reminderLabel} : ${item.title}`,
      body: dateStr + (item.location ? ` · ${item.location}` : ''),
      url: '/modules/calendar',
      tag: `event-${item.event_id}-${item.reminder_minutes}`,
    })

    let success = false
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
        success = true
      } catch (err: any) {
        console.error('Push send error:', err.statusCode, err.body)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }

    if (success) {
      await supabase.from('notification_log').insert({
        user_id: item.user_id,
        event_id: item.event_id,
        reminder_minutes: item.reminder_minutes,
      })
      sentCount.sent++
    } else {
      sentCount.failed++
    }
  }

  return new Response(JSON.stringify({ ...sentCount, total_checked: toNotify.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
