'use client'

import Link from 'next/link'
import type { MouseEvent } from 'react'
import type { ModuleKey } from '@/modules/registry'
import { Wallet, Calendar, Bike, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<ModuleKey, React.ElementType> = {
  budget: Wallet,
  calendar: Calendar,
  triathlon: Bike,
}

interface ModuleCardProps {
  moduleKey: ModuleKey
  name: string
  description: string
  href: string
  accent: string
  glow: string
  comingSoon?: boolean
  index: number
}

export function ModuleCard({ moduleKey, name, description, href, accent, glow, comingSoon, index }: ModuleCardProps) {
  const Icon = ICONS[moduleKey]

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`)
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <Link href={href} className="group block animate-fade-up" style={{ animationDelay: `${index * 80}ms` }}>
      <div
        onMouseMove={handleMouseMove}
        className={cn(
          'spotlight-card relative h-full rounded-2xl border border-border bg-card p-6',
          'transition-all duration-300 ease-out',
          'hover:border-primary/40 hover:-translate-y-1',
          'hover:shadow-[0_8px_40px_-12px_var(--glow-color)]'
        )}
        style={{ ['--glow-color' as string]: glow }}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-6">
            <div className="relative">
              <div className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                'transition-transform duration-300 group-hover:scale-110',
                accent
              )}>
                <Icon className="h-6 w-6 text-background" strokeWidth={2.5} />
              </div>
              <div
                className={cn(
                  'absolute inset-0 rounded-xl bg-gradient-to-br blur-xl opacity-0 -z-10',
                  'transition-opacity duration-300 group-hover:opacity-60',
                  accent
                )}
              />
            </div>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
            {comingSoon && (
              <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Bientôt
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  )
}
