import { NotificationSettings } from '@/modules/calendar/components/notification-settings'
import { Settings } from 'lucide-react'

export default function CalendarSettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Paramètres du calendrier
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure tes notifications et préférences
        </p>
      </div>

      <NotificationSettings />
    </div>
  )
}
