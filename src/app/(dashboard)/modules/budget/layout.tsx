import { BudgetNav } from '@/modules/budget/components/budget-nav'

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <BudgetNav />
      {children}
    </div>
  )
}