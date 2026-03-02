import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'

export function getMonthLabel(yearMonth) {
  // yearMonth: 'YYYY-MM'
  const date = parseISO(`${yearMonth}-01`)
  return format(date, 'MMMM yyyy', { locale: es })
}

export function getMonthRange(yearMonth) {
  const date = parseISO(`${yearMonth}-01`)
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export function isInMonth(isoDateString, yearMonth) {
  const { start, end } = getMonthRange(yearMonth)
  const date = parseISO(isoDateString)
  return isWithinInterval(date, { start, end })
}

export function formatDate(isoString) {
  return format(parseISO(isoString), "d 'de' MMM", { locale: es })
}

export function formatDayShort(isoString) {
  return format(parseISO(isoString), 'dd/MM', { locale: es })
}

export function prevMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function nextMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function currentYearMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
