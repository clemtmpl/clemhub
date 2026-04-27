'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i)
  }
  return view
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<PermissionState>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setIsSupported(supported)
    if (!supported) {
      setPermission('unsupported')
      return
    }

    setPermission(Notification.permission as PermissionState)

    navigator.serviceWorker.ready.then(async (registration) => {
      const sub = await registration.pushManager.getSubscription()
      setIsSubscribed(!!sub)
    })
  }, [])

  const subscribe = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      await navigator.serviceWorker.ready

      const perm = await Notification.requestPermission()
      setPermission(perm as PermissionState)

      if (perm !== 'granted') {
        setError('Permission refusée')
        return
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) throw new Error('Clé VAPID manquante')

      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const sub = subscription.toJSON()
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: user.id,
            endpoint: sub.endpoint!,
            p256dh: sub.keys!.p256dh,
            auth: sub.keys!.auth,
            user_agent: navigator.userAgent,
            device_label: getDeviceLabel(),
            last_used_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,endpoint' }
        )

      if (dbError) throw dbError

      setIsSubscribed(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      console.error('Push subscribe error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()

        const supabase = createClient()
        await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
      }

      setIsSubscribed(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  }
}

function getDeviceLabel(): string {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Android/i.test(ua)) return 'Android'
  if (/Mac/i.test(ua)) return 'macOS'
  if (/Windows/i.test(ua)) return 'Windows'
  return 'Appareil'
}
