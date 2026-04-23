import {
  Briefcase, Plane, UtensilsCrossed, TrendingUp, CreditCard, Home, ShoppingCart, Car,
  Gamepad2, Heart, Shield, MoreHorizontal, Wallet, PiggyBank, Tv, Sparkles, Play,
  Music, Dumbbell, FileText, Cloud, Smartphone, Circle, Target, type LucideIcon,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase, Plane, UtensilsCrossed, TrendingUp, CreditCard, Home, ShoppingCart, Car,
  Gamepad2, Heart, Shield, MoreHorizontal, Wallet, PiggyBank, Tv, Sparkles, Play,
  Music, Dumbbell, FileText, Cloud, Smartphone, Circle, Target,
}

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Circle
}