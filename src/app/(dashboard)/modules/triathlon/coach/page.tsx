import { CoachChat } from '@/modules/triathlon/components/coach-chat'

export default function CoachPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Coach IA</h1>
        <p className="text-muted-foreground text-sm mt-1">Ton coach triathlon personnel, disponible 24h/24</p>
      </div>
      <CoachChat />
    </div>
  )
}
