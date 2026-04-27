import {
  addDays, addMonths, addWeeks, addYears, eachDayOfInterval, endOfDay, endOfMonth,
  endOfWeek, format, isSameDay, isSameMonth, isWithinInterval, parseISO, startOfDay,
  startOfMonth, startOfWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export const DAYS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export function getMonthGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function getWeekGrid(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: weekStart, end: weekEnd })
}

export function formatMonthLabel(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: fr })
}

export function formatDayLabel(date: Date, opts?: { withWeekday?: boolean }): string {
  return format(date, opts?.withWeekday ? 'EEEE d MMMM' : 'd MMMM', { locale: fr })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

export function formatTimeRange(start: Date | string, end: Date | string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function formatRelativeDay(date: Date): string {
  const today = startOfDay(new Date())
  const target = startOfDay(date)
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Demain'
  if (diff === -1) return 'Hier'
  if (diff > 0 && diff <= 7) return `Dans ${diff} jours`
  return formatDayLabel(date, { withWeekday: true })
}

export {
  addDays, addMonths, addWeeks, addYears, isSameDay, isSameMonth, isWithinInterval,
  startOfDay, endOfDay, parseISO, format,
}
