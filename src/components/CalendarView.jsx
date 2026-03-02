import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { formatCurrency, convertFromEUR } from '../utils/currency'
import { getMonthRange } from '../utils/dates'
import { parseISO, getDate, getDay, getDaysInMonth, format } from 'date-fns'
import { es } from 'date-fns/locale'

const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function CalendarView({ expenses }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const categories = useStore((s) => s.categories)
  const defaultCurrency = useStore((s) => s.defaultCurrency)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const activeMonth = useStore((s) => s.activeMonth)

  const convert = (eur) => convertFromEUR(eur, defaultCurrency, exchangeRates)

  const { start } = getMonthRange(activeMonth)
  const daysInMonth = getDaysInMonth(start)

  // Day of week the month starts on (0=Mon … 6=Sun)
  const startDow = (getDay(start) + 6) % 7 // convert Sun=0 → Mon=0

  // Map day number → total expenses
  const dailyTotals = useMemo(() => {
    const map = {}
    expenses.forEach((e) => {
      const d = getDate(parseISO(e.date))
      map[d] = (map[d] || 0) + e.amountEUR
    })
    return map
  }, [expenses])

  const maxDay = Math.max(...Object.values(dailyTotals), 0)

  // Expenses for selected day
  const selectedExpenses = useMemo(() => {
    if (!selectedDay) return []
    return expenses.filter((e) => getDate(parseISO(e.date)) === selectedDay)
  }, [expenses, selectedDay])

  function heatColor(total) {
    if (!total) return null
    const intensity = Math.min(total / (maxDay || 1), 1)
    if (intensity < 0.33) return 'bg-accent/20 text-accent'
    if (intensity < 0.66) return 'bg-accent/40 text-accent-light'
    return 'bg-accent/70 text-white'
  }

  const today = new Date()
  const isCurrentMonth =
    today.getFullYear() === parseInt(activeMonth.slice(0, 4)) &&
    today.getMonth() + 1 === parseInt(activeMonth.slice(5, 7))

  // Build grid cells (blanks + days)
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`blank-${idx}`} />
          const total = dailyTotals[day]
          const heat = heatColor(total)
          const isToday = isCurrentMonth && today.getDate() === day
          const isSelected = selectedDay === day

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`
                relative flex flex-col items-center justify-center rounded-xl py-1.5 transition-all
                ${isSelected ? 'ring-1 ring-accent scale-95' : ''}
                ${heat || 'bg-bg-tertiary/40'}
              `}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-accent' : ''}`}>
                {day}
              </span>
              {total ? (
                <span className="text-[8px] leading-tight mt-0.5 opacity-80">
                  {formatCurrency(convert(total), defaultCurrency).replace(/[€$]/g, '')}
                </span>
              ) : null}
              {isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-text-muted mb-2 px-1 capitalize">
            {format(
              new Date(parseInt(activeMonth.slice(0, 4)), parseInt(activeMonth.slice(5, 7)) - 1, selectedDay),
              "EEEE d 'de' MMMM",
              { locale: es }
            )}
          </p>
          {selectedExpenses.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-3">Sin gastos este día</p>
          ) : (
            <div className="space-y-2">
              {selectedExpenses.map((e) => {
                const cat = categories.find((c) => c.id === e.categoryId)
                return (
                  <div key={e.id} className="bg-bg-card rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                      style={{ background: `${cat?.color || '#71717A'}20` }}
                    >
                      {cat?.icon || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {e.description || cat?.name || 'Gasto'}
                      </p>
                      <p className="text-xs text-text-muted">{cat?.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-danger shrink-0">
                      -{formatCurrency(convert(e.amountEUR), defaultCurrency)}
                    </p>
                  </div>
                )
              })}
              <div className="flex justify-end px-1">
                <p className="text-xs text-text-muted">
                  Total: <span className="font-semibold text-danger">
                    -{formatCurrency(convert(selectedExpenses.reduce((s, e) => s + e.amountEUR, 0)), defaultCurrency)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
