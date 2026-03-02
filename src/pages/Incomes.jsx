import { useState, useMemo } from 'react'
import { Plus, Trash2, Pencil, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatCurrency, convertFromEUR, convertToEUR, CURRENCIES } from '../utils/currency'
import { isInMonth } from '../utils/dates'
import MonthNavigator from '../components/MonthNavigator'

function IncomeSheet({ onClose, initial = null }) {
  const defaultCurrency = useStore((s) => s.defaultCurrency)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const addIncome = useStore((s) => s.addIncome)
  const updateIncome = useStore((s) => s.updateIncome)
  const activeMonth = useStore((s) => s.activeMonth)

  const [amount, setAmount] = useState(initial?.originalAmount?.toString() || '')
  const [currency, setCurrency] = useState(initial?.currency || defaultCurrency)
  const [label, setLabel] = useState(initial?.label || '')
  const [date, setDate] = useState(
    initial?.date?.slice(0, 10) || `${activeMonth}-01`
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!amount || isNaN(parseFloat(amount))) return
    const originalAmount = parseFloat(amount)
    const amountEUR = convertToEUR(originalAmount, currency, exchangeRates)
    const payload = {
      originalAmount,
      currency,
      amountEUR,
      label: label.trim() || 'Ingreso',
      date: new Date(date + 'T12:00:00').toISOString(),
    }
    if (initial?.id) {
      updateIncome(initial.id, payload)
    } else {
      addIncome(payload)
    }
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-bg-secondary rounded-t-3xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
          <h2 className="text-lg font-semibold">{initial ? 'Editar ingreso' : 'Nuevo ingreso'}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-tertiary text-text-secondary"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 pb-safe">
          {/* Amount */}
          <div className="bg-bg-card rounded-2xl p-4">
            <label className="text-xs text-text-muted mb-2 block">Monto</label>
            <div className="flex items-center gap-3">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-bg-tertiary rounded-xl px-3 py-2 text-sm font-medium outline-none text-text-primary"
              >
                {Object.entries(CURRENCIES).map(([code, { flag }]) => (
                  <option key={code} value={code}>{flag} {code}</option>
                ))}
              </select>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="flex-1 bg-transparent text-3xl font-bold text-success placeholder-text-muted outline-none"
              />
            </div>
          </div>

          {/* Label */}
          <div className="bg-bg-card rounded-2xl px-4 py-3">
            <label className="text-xs text-text-muted mb-1 block">Nombre</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Sueldo, Freelance..."
              className="w-full bg-transparent text-base text-text-primary placeholder-text-muted outline-none"
            />
          </div>

          {/* Date */}
          <div className="bg-bg-card rounded-2xl px-4 py-3">
            <label className="text-xs text-text-muted mb-1 block">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-base text-text-primary outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-success font-semibold text-white text-base active:scale-95 transition-transform shadow-lg shadow-success/20"
          >
            {initial ? 'Guardar cambios' : 'Agregar ingreso'}
          </button>
        </form>
      </div>
    </>
  )
}

export default function Incomes() {
  const incomes = useStore((s) => s.incomes)
  const deleteIncome = useStore((s) => s.deleteIncome)
  const defaultCurrency = useStore((s) => s.defaultCurrency)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const activeMonth = useStore((s) => s.activeMonth)

  const [showSheet, setShowSheet] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const convert = (eur) => convertFromEUR(eur, defaultCurrency, exchangeRates)

  const monthIncomes = useMemo(
    () => incomes.filter((i) => isInMonth(i.date, activeMonth)),
    [incomes, activeMonth]
  )

  const total = monthIncomes.reduce((s, i) => s + i.amountEUR, 0)

  function handleDelete(id) {
    if (deleteConfirm === id) {
      deleteIncome(id)
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
          <h1 className="text-xl font-bold">Ingresos</h1>
          <button
            onClick={() => setShowSheet(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-success shadow-lg shadow-success/20 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        <MonthNavigator />
      </div>

      {/* Total card */}
      <div className="bg-gradient-to-br from-success/20 to-success/5 border border-success/20 rounded-3xl p-5 mb-4">
        <p className="text-text-muted text-xs font-medium mb-1">Total ingresos del mes</p>
        <p className="text-4xl font-bold text-success">
          {formatCurrency(convert(total), defaultCurrency)}
        </p>
        <p className="text-text-muted text-xs mt-2">
          {monthIncomes.length} {monthIncomes.length === 1 ? 'ingreso' : 'ingresos'}
        </p>
      </div>

      {/* Income list */}
      {monthIncomes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">💰</div>
          <p className="text-text-secondary font-medium mb-1">Sin ingresos este mes</p>
          <p className="text-text-muted text-sm mb-4">
            Agregá tus ingresos para ver tu balance disponible
          </p>
          <button
            onClick={() => setShowSheet(true)}
            className="bg-success text-white px-5 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            Agregar ingreso
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {monthIncomes.map((income) => (
            <div key={income.id} className="bg-bg-card rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{income.label}</p>
                <p className="text-xs text-text-muted">
                  {new Date(income.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">
                    +{formatCurrency(convert(income.amountEUR), defaultCurrency)}
                  </p>
                  {income.currency !== defaultCurrency && (
                    <p className="text-[10px] text-text-muted">
                      {income.currency} {income.originalAmount}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditingIncome(income)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-tertiary text-text-muted active:scale-90 transition-transform"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(income.id)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
                    deleteConfirm === income.id
                      ? 'bg-danger text-white'
                      : 'bg-bg-tertiary text-text-muted'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showSheet || editingIncome) && (
        <IncomeSheet
          initial={editingIncome}
          onClose={() => {
            setShowSheet(false)
            setEditingIncome(null)
          }}
        />
      )}
    </div>
  )
}
