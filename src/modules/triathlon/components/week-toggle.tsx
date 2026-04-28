'use client'

import { useTransition } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { toggleCompleted } from '../actions'

interface WeekToggleProps {
  week: number
  day: number
  isDone: boolean
}

export function WeekToggle({ week, day, isDone }: WeekToggleProps) {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await toggleCompleted({ week, day })
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="mt-0.5 flex-shrink-0 transition-opacity hover:opacity-70"
      aria-label={isDone ? 'Marquer comme non fait' : 'Marquer comme fait'}
    >
      {isDone ? (
        <CheckCircle2 className="h-5 w-5 text-primary" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground/40" />
      )}
    </button>
  )
}
