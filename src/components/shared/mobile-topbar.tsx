'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { NavContent } from './nav-content'
import { signout } from '@/app/(auth)/actions'

interface MobileTopbarProps {
  displayName: string
  email: string
}

export function MobileTopbar({ displayName, email }: MobileTopbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="lg:hidden sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-ember-gradient flex items-center justify-center font-bold text-background text-sm">
            C
          </div>
          <span className="font-semibold">Clemhub</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-sidebar border-sidebar-border p-0">
            <SheetHeader className="border-b border-sidebar-border p-4">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-[calc(100%-65px)]">
              <div className="flex-1 overflow-y-auto">
                <NavContent onNavigate={() => setOpen(false)} />
              </div>
              <div className="border-t border-sidebar-border p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
                <form action={signout}>
                  <Button variant="outline" size="sm" type="submit" className="w-full justify-start gap-2">
                    <LogOut className="h-3.5 w-3.5" />
                    Déconnexion
                  </Button>
                </form>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
