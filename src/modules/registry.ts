import { Wallet, Calendar, Bike, type LucideIcon } from 'lucide-react'

export type ModuleKey = 'budget' | 'calendar' | 'triathlon'

export interface ModuleDefinition {
  key: ModuleKey
  name: string
  description: string
  icon: LucideIcon
  href: string
  accent: string
  glow: string
  enabled: boolean
  comingSoon?: boolean
}

export const MODULES: ModuleDefinition[] = [
  {
    key: 'budget',
    name: 'Budget',
    description: 'Gestion des finances, épargne et objectifs',
    icon: Wallet,
    href: '/modules/budget',
    accent: 'from-orange-500 to-amber-400',
    glow: 'rgba(249, 115, 22, 0.4)',
    enabled: true,
  },
  {
    key: 'calendar',
    name: 'Agenda',
    description: 'Événements, rappels et planning',
    icon: Calendar,
    href: '/modules/calendar',
    accent: 'from-amber-400 to-yellow-300',
    glow: 'rgba(251, 191, 36, 0.4)',
    enabled: true,
  },
  {
    key: 'triathlon',
    name: 'Triathlon',
    description: 'Entraînement et préparation',
    icon: Bike,
    href: '/modules/triathlon',
    accent: 'from-rose-500 to-orange-500',
    glow: 'rgba(244, 63, 94, 0.4)',
    enabled: true,
    comingSoon: true,
  },
]
