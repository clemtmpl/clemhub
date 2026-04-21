import { Wallet, Calendar, Bike, type LucideIcon } from 'lucide-react'

export type ModuleKey = 'budget' | 'calendar' | 'triathlon'

export interface ModuleDefinition {
  key: ModuleKey
  name: string
  description: string
  icon: LucideIcon
  href: string
  gradient: string
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
    gradient: 'from-emerald-500 to-teal-600',
    enabled: true,
    comingSoon: true,
  },
  {
    key: 'calendar',
    name: 'Agenda',
    description: 'Événements, rappels et planning',
    icon: Calendar,
    href: '/modules/calendar',
    gradient: 'from-blue-500 to-indigo-600',
    enabled: true,
    comingSoon: true,
  },
  {
    key: 'triathlon',
    name: 'Triathlon',
    description: 'Entraînement et préparation',
    icon: Bike,
    href: '/modules/triathlon',
    gradient: 'from-orange-500 to-red-600',
    enabled: true,
    comingSoon: true,
  },
]