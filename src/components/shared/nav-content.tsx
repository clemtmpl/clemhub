'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home } from 'lucide-react'
import { MODULES } from '@/modules/registry'
import { cn } from '@/lib/utils'

interface NavContentProps {
  onNavigate?: () => void
}

export function NavContent({ onNavigate }: NavContentProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', name: 'Portail', icon: Home, key: 'dashboard' },
    ...MODULES.filter((m) => m.enabled).map((m) => ({
      href: m.href,
      name: m.name,
      icon: m.icon,
      key: m.key,
    })),
  ]

  return (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item, i) => {
        const Icon = item.icon
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              'animate-fade-up',
              isActive
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
            )}
            <Icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                isActive ? 'text-primary' : 'group-hover:text-foreground'
              )}
            />
            <span>{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
