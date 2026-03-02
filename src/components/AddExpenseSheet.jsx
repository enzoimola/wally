import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CURRENCIES, convertToEUR } from '../utils/currency'

export default function AddExpenseSheet({ onClose, initialData = null }) {
  const categories = useStore((s) => s.categories)
  const defaultCurrency = useStore((s) => s.defaultCurrency)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const addExpense = useStore((s) => s.addExpense)
  const updateExpense = useStore((s) => s.updateExpense)

  const [amount, setAmount] = useState(initialData?.originalAmount?.toString() || '')
  const [currency, setCurrency] = useState(initialData?.currency || defaultCurrency)
  const [description, setDescription] = useState(initialData?.description || '')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '')
  const [date, setDate] = useState(
    initialData?.date || new Date().toISOString().slice(0, 10)
  )
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  const selectedCategory = categories.find((c) => c.id === categoryId)

  function handleSubmit(e) {
    e.preventDefault()
    if (!amount || isNaN(parseFloat(amount))) return

    const originalAmount = parseFloat(amount)
    const amountEUR = convertToEUR(originalAmount, currency, exchangeRates)

    const payload = {
      originalAmount,
      currency,
      amountEUR,
      description: description.trim(),
      categoryId,
      date: new Date(date + 'T12:00:00').toISOString(),
    }

    if (initialData?.id) {
      updateExpense(initialData.id, payload)
    } else {
      addExpense(payload)
    }
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-bg-secondary rounded-t-3xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
          <h2 className="text-lg font-semibold">
            {initialData ? 'Editar gasto' : 'Nuevo gasto'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-tertiary text-text-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 pb-safe">
          {/* Amount + Currency */}
          <div className="bg-bg-card rounded-2xl p-4">
            <label className="text-xs text-text-muted mb-2 block">Monto</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                className="flex items-center gap-1 bg-bg-tertiary rounded-xl px-3 py-2 text-sm font-medium shrink-0"
              >
                {CURRENCIES[currency]?.symbol} {currency}
                <ChevronDown className="w-3 h-3 text-text-muted" />
              </button>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="flex-1 bg-transparent text-3xl font-bold text-text-primary placeholder-text-muted outline-none w-full"
              />
            </div>

            {showCurrencyPicker && (
              <div className="mt-3 flex gap-2">
                {Object.entries(CURRENCIES).map(([code, { flag, symbol }]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => { setCurrency(code); setShowCurrencyPicker(false) }}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                      currency === code
                        ? 'bg-accent text-white'
                        : 'bg-bg-tertiary text-text-secondary'
                    }`}
                  >
                    {flag} {code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-bg-card rounded-2xl px-4 py-3">
            <label className="text-xs text-text-muted mb-1 block">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿En qué gastaste?"
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

          {/* Category */}
          <div>
            <label className="text-xs text-text-muted mb-2 block px-1">Categoría</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all ${
                    categoryId === cat.id
                      ? 'bg-accent/20 ring-1 ring-accent'
                      : 'bg-bg-card'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[10px] text-text-secondary leading-tight text-center">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-accent font-semibold text-white text-base active:scale-95 transition-transform shadow-lg shadow-accent/30"
          >
            {initialData ? 'Guardar cambios' : 'Agregar gasto'}
          </button>
        </form>
      </div>
    </>
  )
}
