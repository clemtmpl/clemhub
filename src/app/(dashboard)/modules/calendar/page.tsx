import { addMonths, addWeeks, addDays, endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Settings as SettingsIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getCalendarCategories, getEventsInRange } from '@/modules/calendar/queries'
import { MonthView } from '@/modules/calendar/components/month-view'
import { WeekView } from '@/modules/calendar/components/week-view'
import { DayView } from '@/modules/calendar/components/day-view'
import { NewEventButton } from '@/modules/calendar/components/event-dialog'
import { formatDayLabel, formatMonthLabel } from '@/modules/calendar/lib/dates'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type View = 'month' | 'week' | 'day'

interface PageProps {
  searchParams: Promise<{ view?: string; date?: string }>
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams
  const view: View = (['month', 'week', 'day'] as const).includes(params.view as View)
    ? (params.view as View)
    : 'month'
  const currentDate = params.date ? new Date(params.date) : new Date()

  if (isNaN(currentDate.getTime())) redirect('/modules/calendar')

  let rangeStart: Date, rangeEnd: Date
  switch (view) {
    case 'week':
      rangeStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      rangeEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      break
    case 'day':
      rangeStart = startOfDay(currentDate)
      rangeEnd = endOfDay(currentDate)
      break
    default:
      rangeStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
      rangeEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
  }

  const [categories, events] = await Promise.all([
    getCalendarCategories(),
    getEventsInRange(rangeStart, rangeEnd),
  ])

  const navStep = (delta: number): string => {
    let target: Date
    switch (view) {
      case 'week':  target = addWeeks(currentDate, delta); break
      case 'day':   target = addDays(currentDate, delta); break
      default:      target = addMonths(currentDate, delta)
    }
    return `/modules/calendar?view=${view}&date=${target.toISOString().slice(0, 10)}`
  }

  const todayHref = `/modules/calendar?view=${view}&date=${new Date().toISOString().slice(0, 10)}`

  let label: string
  switch (view) {
    case 'week':
      label = `Semaine du ${format(rangeStart, 'd MMM', { locale: fr })}`
      break
    case 'day':
      label = formatDayLabel(currentDate, { withWeekday: true })
      break
    default:
      label = formatMonthLabel(currentDate)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground mt-1 text-sm">Planifie ta semaine et tes rendez-vous</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/modules/calendar/settings">
            <Button variant="outline" size="icon" aria-label="Paramètres">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </Link>
          <NewEventButton categories={categories} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Link href={navStep(-1)}>
            <Button variant="outline" size="icon" aria-label="Précédent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={navStep(1)}>
            <Button variant="outline" size="icon" aria-label="Suivant">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={todayHref}>
            <Button variant="outline" size="sm">Aujourd&apos;hui</Button>
          </Link>
          <h2 className="text-base sm:text-lg font-semibold ml-2 capitalize">{label}</h2>
        </div>

        <div className="flex rounded-lg border border-border p-0.5">
          {(['month', 'week', 'day'] as const).map((v) => (
            <Link
              key={v}
              href={`/modules/calendar?view=${v}&date=${currentDate.toISOString().slice(0, 10)}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
            </Link>
          ))}
        </div>
      </div>

      {view === 'month' && (
        <MonthView currentDate={currentDate} events={events} categories={categories} />
      )}
      {view === 'week' && (
        <WeekView currentDate={currentDate} events={events} categories={categories} />
      )}
      {view === 'day' && (
        <DayView currentDate={currentDate} events={events} categories={categories} />
      )}

      <div className="flex items-center gap-3 flex-wrap pt-2">
        <span className="text-xs text-muted-foreground">Catégories :</span>
        {categories.map((cat) => (
          <span key={cat.id} className="inline-flex items-center gap-1.5 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-muted-foreground">{cat.name}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
