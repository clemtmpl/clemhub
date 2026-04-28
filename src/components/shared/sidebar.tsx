import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/(auth)/actions'
import { NavContent } from './nav-content'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const profile = profileData as { full_name?: string | null } | null
  const displayName = profile?.full_name ?? user!.email ?? ''
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar border-r border-sidebar-border z-20">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-ember-gradient flex items-center justify-center font-bold text-background">
              C
            </div>
            <div className="absolute inset-0 rounded-lg bg-ember-gradient blur-lg opacity-40 group-hover:opacity-60 transition-opacity -z-10" />
          </div>
          <span className="font-semibold tracking-tight">Clemhub</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Navigation
        </div>
        <NavContent />
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 border border-sidebar-border">
            <AvatarFallback className="bg-accent text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user!.email}</p>
          </div>
        </div>
        <form action={signout}>
          <Button variant="outline" size="sm" type="submit" className="w-full justify-start gap-2">
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </Button>
        </form>
      </div>
    </aside>
  )
}
