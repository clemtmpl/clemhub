export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(252,211,77,0.05),transparent_50%)] pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-ember-gradient flex items-center justify-center font-bold text-background text-xl">
                C
              </div>
              <div className="absolute inset-0 rounded-xl bg-ember-gradient blur-xl opacity-50 -z-10" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Clemhub</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
