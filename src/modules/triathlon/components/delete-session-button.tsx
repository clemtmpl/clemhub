'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteSession } from '../actions'

export function DeleteSessionButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('Supprimer cette séance ?')) return
    startTransition(async () => {
      await deleteSession(id)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 mt-0.5 flex-shrink-0"
      aria-label="Supprimer"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
