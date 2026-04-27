'use client'

import { Bell, BellOff, Smartphone, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '../hooks/use-push-notifications'

export function NotificationSettings() {
  const { isSupported, permission, isSubscribed, isLoading, error, subscribe, unsubscribe } =
    usePushNotifications()

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Notifications non supportées</p>
            <p className="text-sm text-muted-foreground mt-1">
              Ton navigateur ne supporte pas les notifications push. Sur iOS,
              installe l&apos;app sur ton écran d&apos;accueil pour les activer.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isSubscribed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
          }`}
        >
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="font-medium">Notifications push</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isSubscribed
              ? 'Tu recevras un rappel 7 jours avant et 1 jour avant chaque événement'
              : 'Active les rappels pour ne plus rien oublier'}
          </p>
        </div>
      </div>

      {permission === 'denied' && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-4 text-sm text-destructive">
          <p className="font-medium">Permission bloquée</p>
          <p className="text-xs mt-1">
            Les notifications ont été refusées. Pour les réactiver, va dans les paramètres de
            ton navigateur ou de l&apos;app.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        {isSubscribed ? (
          <Button variant="outline" onClick={unsubscribe} disabled={isLoading} className="gap-2">
            <BellOff className="h-4 w-4" />
            {isLoading ? 'Désactivation...' : 'Désactiver les notifs'}
          </Button>
        ) : (
          <Button onClick={subscribe} disabled={isLoading || permission === 'denied'} className="gap-2">
            <Bell className="h-4 w-4" />
            {isLoading ? 'Activation...' : 'Activer les notifs'}
          </Button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Smartphone className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <p>
            <strong className="text-foreground">Sur iPhone :</strong> tu dois d&apos;abord
            installer Clemhub sur ton écran d&apos;accueil (Safari → Partager → Sur l&apos;écran
            d&apos;accueil) pour que les notifs fonctionnent.
          </p>
        </div>
      </div>
    </div>
  )
}
