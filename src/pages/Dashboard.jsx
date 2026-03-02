import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatCurrency, convertFromEUR } from '../utils/currency'
import { isInMonth, prevMonth } from '../utils/dates'
import MonthNavigator from '../components/MonthNavigator'
import CalendarView from '../components/CalendarView'

export default function Dashboard({ onAddExpense }) {
  const expenses = useStore((s) => s.expenses)
  const incomes = useStore((s) => s.incomes)
  const categories = useStore((s) => s.categories)
  const activeMonth = useStore((s) => s.activeMonth)
  const defaultCurrency = useStore((s) => s.defaultCurrency)
  const exchangeRates = useStore((s) => s.exchangeRates)

  const convert = (eur) => convertFromEUR(eur, defaultCurrency, exchangeRates)

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.date, activeMonth)),
    [expenses, activeMonth]
  )

  const monthIncomes = useMemo(
    () => incomes.filter((i) => isInMonth(i.date, activeMonth)),
    [incomes, activeMonth]
  )

  const totalExpenses = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amountEUR, 0),
    [monthExpenses]
  )

  const totalIncome = useMemo(
    () => monthIncomes.reduce((sum, i) => sum + i.amountEUR, 0),
    [monthIncomes]
  )

  const balance = totalIncome - totalExpenses
  const spentPct = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0

  // Previous month comparison
  const prevMonthKey = prevMonth(activeMonth)
  const prevExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.date, prevMonthKey)),
    [expenses, prevMonthKey]
  )
  const prevTotal = prevExpenses.reduce((sum, e) => sum + e.amountEUR, 0)
  const expenseDiff = prevTotal > 0 ? ((totalExpenses - prevTotal) / prevTotal) * 100 : null

  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    const map = {}
    monthExpenses.forEach((e) => {
      map[e.categoryId] = (map[e.categoryId] || 0) + e.amountEUR
    })
    return Object.entries(map)
      .map(([id, total]) => {
        const cat = categories.find((c) => c.id === id)
        return { id, name: cat?.name || 'Otro', color: cat?.color || '#71717A', total }
      })
      .sort((a, b) => b.total - a.total)
  }, [monthExpenses, categories])

  const hasData = monthExpenses.length > 0 || monthIncomes.length > 0

  return (
    <div className="pt-safe pb-24 px-4 space-y-4 min-h-dvh">
      {/* Header */}
      <div className="pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Wally</span>
          </div>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            Gasto
          </button>
        </div>
        <MonthNavigator />
      </div>

      {/* ── BALANCE PRINCIPAL ── */}
      <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-3xl p-5">
        {/* Disponible — número grande y destacado */}
        <p className="text-text-muted text-xs font-medium mb-0.5">Disponible para gastar</p>
        <p className={`text-5xl font-black tracking-tight mb-1 ${balance >= 0 ? 'text-text-primary' : 'text-danger'}`}>
          {formatCurrency(convert(balance), defaultCurrency)}
        </p>
        {totalIncome === 0 && (
          <p className="text-xs text-text-muted mb-3">Agregá ingresos para ver tu balance</p>
        )}

        {/* Barra de progreso */}
        {totalIncome > 0 && (
          <div className="mb-3">
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  spentPct > 85 ? 'bg-danger' : spentPct > 60 ? 'bg-warning' : 'bg-accent'
                }`}
                style={{ width: `${spentPct}%` }}
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Gastaste el {spentPct.toFixed(0)}% de tus ingresos este mes
            </p>
          </div>
        )}

        {/* Ingresos / Gastos en fila */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-white/5 rounded-2xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="text-[11px] text-text-muted">Ingresos</span>
            </div>
            <p className="text-base font-bold text-success">
              +{formatCurrency(convert(totalIncome), defaultCurrency)}
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-danger" />
              <span className="text-[11px] text-text-muted">Gastos</span>
            </div>
            <p className="text-base font-bold text-danger">
              -{formatCurrency(convert(totalExpenses), defaultCurrency)}
            </p>
            {expenseDiff !== null && (
              <p className={`text-[10px] mt-0.5 ${expenseDiff > 0 ? 'text-danger' : 'text-success'}`}>
                {expenseDiff > 0 ? '▲' : '▼'} {Math.abs(expenseDiff).toFixed(1)}% vs mes ant.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── CALENDARIO ── */}
      {hasData && (
        <div className="bg-bg-card rounded-3xl p-4">
          <h3 className="text-sm font-semibold mb-4">Gastos por día</h3>
          <CalendarView expenses={monthExpenses} />
        </div>
      )}

      {/* ── GRÁFICO POR CATEGORÍA ── */}
      {categoryData.length > 0 && (
        <div className="bg-bg-card rounded-3xl p-4">
          <h3 className="text-sm font-semibold mb-4">Por categoría</h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={56}
                    paddingAngle={2}
                    dataKey="total"
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => formatCurrency(convert(val), defaultCurrency)}
                    contentStyle={{
                      background: '#1C1C1F',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    itemStyle={{ color: '#FAFAFA' }}
                    labelStyle={{ color: '#A1A1AA' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
              {categoryData.slice(0, 5).map((cat) => {
                const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0
                return (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-text-secondary flex-1 truncate">{cat.name}</span>
                    <span className="text-xs font-medium shrink-0">{pct.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-5xl mb-4">💸</div>
          <p className="text-text-secondary font-medium mb-1">Sin movimientos</p>
          <p className="text-text-muted text-sm mb-4">
            Agregá ingresos y gastos para ver tu resumen mensual
          </p>
          <button
            onClick={onAddExpense}
            className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            Agregar primer gasto
          </button>
        </div>
      )}
    </div>
  )
}
