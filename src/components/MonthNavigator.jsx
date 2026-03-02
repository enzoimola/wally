import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getMonthLabel, prevMonth, nextMonth, currentYearMonth } from '../utils/dates'

export default function MonthNavigator() {
  const activeMonth = useStore((s) => s.activeMonth)
  const setActiveMonth = useStore((s) => s.setActiveMonth)

  const isCurrentMonth = activeMonth === currentYearMonth()

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setActiveMonth(prevMonth(activeMonth))}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-tertiary text-text-secondary active:scale-95 transition-transform"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-base font-semibold capitalize flex-1 text-center">
        {getMonthLabel(activeMonth)}
      </span>

      <button
        onClick={() => setActiveMonth(nextMonth(activeMonth))}
        disabled={isCurrentMonth}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-transform ${
          isCurrentMonth
            ? 'text-text-muted opacity-40'
            : 'bg-bg-tertiary text-text-secondary active:scale-95'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
