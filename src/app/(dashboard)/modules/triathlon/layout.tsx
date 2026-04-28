import { TriathlonNav } from '@/modules/triathlon/components/triathlon-nav'

export default function TriathlonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <TriathlonNav />
      {children}
    </div>
  )
}
