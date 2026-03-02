import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { isInMonth } from '../utils/dates'
import MonthNavigator from '../components/MonthNavigator'
import CalendarView from '../components/CalendarView'

export default function Calendar() {
  const expenses = useStore((s) => s.expenses)
  const activeMonth = useStore((s) => s.activeMonth)

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.date, activeMonth)),
    [expenses, activeMonth]
  )

  return (
    <div className="pt-safe pb-24 px-4 min-h-dvh">
      <div className="pt-4 pb-2 space-y-3">
        <h1 className="text-xl font-bold">Calendario</h1>
        <MonthNavigator />
      </div>

      <div className="bg-bg-card rounded-3xl p-4 mt-2">
        <CalendarView expenses={monthExpenses} />
      </div>
    </div>
  )
}
