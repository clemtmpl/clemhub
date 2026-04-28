import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shared/sidebar'
import { MobileTopbar } from '@/components/shared/mobile-topbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as { full_name?: string | null } | null
  const displayName = profile?.full_name ?? user.email ?? ''

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileTopbar displayName={displayName} email={user.email ?? ''} />
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
