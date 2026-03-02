import { useState, useMemo } from 'react'
import { Plus, Trash2, Pencil, Search } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatCurrency, convertFromEUR } from '../utils/currency'
import { isInMonth } from '../utils/dates'
import MonthNavigator from '../components/MonthNavigator'
import AddExpenseSheet from '../components/AddExpenseSheet'

export default function Expenses({ onAddExpense }) {
  const expenses = useStore((s) => s.expenses)
  const categories = useStore((s) => s.categories)
  const deleteExpense = useStore((s) => s.deleteExpense)
  const defaultCurrency = useStore((s) => s.defaultCurrency)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const activeMonth = useStore((s) => s.activeMonth)

  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const convert = (eur) => convertFromEUR(eur, defaultCurrency, exchangeRates)

  const monthExpenses = useMemo(
    () => expenses.filter((e) => isInMonth(e.date, activeMonth)),
    [expenses, activeMonth]
  )

  const filtered = useMemo(() => {
    let list = monthExpenses
    if (filterCat !== 'all') list = list.filter((e) => e.categoryId === filterCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          categories.find((c) => c.id === e.categoryId)?.name.toLowerCase().includes(q)
      )
    }
    return list
  }, [monthExpenses, filterCat, search, categories])

  const total = filtered.reduce((s, e) => s + e.amountEUR, 0)

  // Group by date
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach((e) => {
      const day = e.date.slice(0, 10)
      if (!map[day]) map[day] = []
      map[day].push(e)
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  function handleDelete(id) {
    if (deleteConfirm === id) {
      deleteExpense(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div className="pt-safe pb-24 px-4 min-h-dvh">
      {/* Header */}
      <div className="pt-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Gastos</h1>
          <button
            onClick={onAddExpense}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        <MonthNavigator />
      </div>

      {/* Total */}
      <div className="bg-bg-card rounded-2xl px-4 py-3 mb-4 flex justify-between items-center">
        <span className="text-text-muted text-sm">Total del mes</span>
        <span className="text-danger font-bold text-lg">
          -{formatCurrency(convert(total), defaultCurrency)}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar gastos..."
          className="w-full bg-bg-card rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none border border-white/5"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        <button
          onClick={() => setFilterCat('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filterCat === 'all' ? 'bg-accent text-white' : 'bg-bg-card text-text-secondary'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterCat === cat.id ? 'bg-accent text-white' : 'bg-bg-card text-text-secondary'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Grouped expense list */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-text-secondary font-medium mb-1">Sin gastos</p>
          <p className="text-text-muted text-sm">
            {search || filterCat !== 'all' ? 'Ningún resultado para tu búsqueda' : 'No registraste gastos este mes'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, items]) => (
            <div key={day}>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-medium text-text-muted capitalize">
                  {new Date(day + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="text-xs text-text-muted">
                  -{formatCurrency(convert(items.reduce((s, e) => s + e.amountEUR, 0)), defaultCurrency)}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((expense) => {
                  const cat = categories.find((c) => c.id === expense.categoryId)
                  return (
                    <div
                      key={expense.id}
                      className="bg-bg-card rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: `${cat?.color || '#71717A'}20` }}
                      >
                        {cat?.icon || '📦'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {expense.description || cat?.name || 'Gasto'}
                        </p>
                        <p className="text-xs text-text-muted">{cat?.name}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-danger">
                            -{formatCurrency(convert(expense.amountEUR), defaultCurrency)}
                          </p>
                          {expense.currency !== defaultCurrency && (
                            <p className="text-[10px] text-text-muted">
                              {expense.currency} {expense.originalAmount}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-tertiary text-text-muted active:scale-90 transition-transform"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
                            deleteConfirm === expense.id
                              ? 'bg-danger text-white'
                              : 'bg-bg-tertiary text-text-muted'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit sheet */}
      {editingExpense && (
        <AddExpenseSheet
          initialData={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  )
}
