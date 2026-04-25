'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Plane, CreditCard, Target, Sparkles } from 'lucide-react'

const TABS = [
  { href: '/modules/budget',               name: 'Dashboard',   icon: LayoutDashboard },
  { href: '/modules/budget/missions',      name: 'Missions',    icon: Plane },
  { href: '/modules/budget/recurring',     name: 'Récurrents',  icon: CreditCard },
  { href: '/modules/budget/envelopes',     name: 'Enveloppes',  icon: Sparkles },
  { href: '/modules/budget/plan',          name: 'Plan',        icon: Target },
]

export function BudgetNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-border -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <nav className="flex gap-1 overflow-x-auto scrollbar-none -mb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive =
            tab.href === '/modules/budget'
              ? pathname === '/modules/budget'
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}