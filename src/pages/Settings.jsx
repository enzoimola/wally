import { useState } from 'react'
import { Plus, Trash2, Pencil, RefreshCw, Globe, Tag } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CURRENCIES } from '../utils/currency'

const EMOJI_OPTIONS = ['🍕','🚌','🎬','💊','🛍️','🏠','📚','📦','☕','🍺','✈️','🎮','💄','🐶','⚡','🎓','🏋️','🎵','🍔','💰']
const COLOR_OPTIONS = ['#F59E0B','#3B82F6','#8B5CF6','#EF4444','#EC4899','#14B8A6','#6366F1','#71717A','#22C55E','#F97316','#06B6D4','#84CC16']

function CategorySheet({ onClose, initial = null }) {
  const addCategory = useStore((s) => s.addCategory)
  const updateCategory = useStore((s) => s.updateCategory)

  const [name, setName] = useState(initial?.name || '')
  const [icon, setIcon] = useState(initial?.icon || '📦')
  const [color, setColor] = useState(initial?.color || '#71717A')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (initial?.id) {
      updateCategory(initial.id, { name: name.trim(), icon, color })
    } else {
      addCategory({ name: name.trim(), icon, color })
    }
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-bg-secondary rounded-t-3xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
          <h2 className="text-lg font-semibold">{initial ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-tertiary text-text-secondary">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 pb-safe">
          {/* Name */}
          <div className="bg-bg-card rounded-2xl px-4 py-3">
            <label className="text-xs text-text-muted mb-1 block">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Café, Gym..."
              autoFocus
              className="w-full bg-transparent text-base text-text-primary placeholder-text-muted outline-none"
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="text-xs text-text-muted mb-2 block px-1">Ícono</label>
            <div className="grid grid-cols-10 gap-1">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setIcon(e)}
                  className={`h-9 flex items-center justify-center rounded-xl text-lg transition-all ${
                    icon === e ? 'bg-accent/20 ring-1 ring-accent' : 'bg-bg-card'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-text-muted mb-2 block px-1">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-secondary scale-110' : ''
                  }`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 bg-bg-card rounded-2xl px-4 py-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}20` }}>
              {icon}
            </div>
            <span className="font-medium">{name || 'Mi categoría'}</span>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-accent font-semibold text-white text-base active:scale-95 transition-transform"
          >
            {initial ? 'Guardar' : 'Crear categoría'}
          </button>
        </form>
      </div>
    </>
  )
}

export default function Settings() {
  const categories = useStore((s) => s.categories)
  const deleteCategory = useStore((s) => s.deleteCategory)
  const defaultCurrency = useStore((s) => s.defaultCurrency)
  const setDefaultCurrency = useStore((s) => s.setDefaultCurrency)
  const exchangeRates = useStore((s) => s.exchangeRates)
  const ratesUpdatedAt = useStore((s) => s.ratesUpdatedAt)
  const fetchExchangeRates = useStore((s) => s.fetchExchangeRates)

  const [showCatSheet, setShowCatSheet] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [fetching, setFetching] = useState(false)

  async function handleRefreshRates() {
    setFetching(true)
    await fetchExchangeRates()
    setFetching(false)
  }

  function handleDeleteCat(id) {
    if (deleteConfirm === id) {
      deleteCategory(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const ratesLabel = ratesUpdatedAt
    ? new Date(ratesUpdatedAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Nunca'

  return (
    <div className="pt-safe pb-24 px-4 min-h-dvh">
      <div className="pt-4 pb-4">
        <h1 className="text-xl font-bold">Ajustes</h1>
      </div>

      {/* Currency section */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Moneda</h2>
        </div>

        <div className="bg-bg-card rounded-2xl p-4 space-y-4">
          {/* Default currency */}
          <div>
            <p className="text-xs text-text-muted mb-2">Moneda por defecto</p>
            <div className="flex gap-2">
              {Object.entries(CURRENCIES).map(([code, { flag, name }]) => (
                <button
                  key={code}
                  onClick={() => setDefaultCurrency(code)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    defaultCurrency === code
                      ? 'bg-accent text-white'
                      : 'bg-bg-tertiary text-text-secondary'
                  }`}
                >
                  {flag} {code}
                </button>
              ))}
            </div>
          </div>

          {/* Exchange rates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-text-muted">Tipo de cambio (base EUR)</p>
              <button
                onClick={handleRefreshRates}
                disabled={fetching}
                className="flex items-center gap-1 text-accent text-xs font-medium active:scale-95 transition-transform"
              >
                <RefreshCw className={`w-3 h-3 ${fetching ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>

            <div className="space-y-1.5">
              {Object.entries(exchangeRates).map(([code, rate]) => (
                <div key={code} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-sm text-text-secondary">
                    {CURRENCIES[code]?.flag} 1 EUR =
                  </span>
                  <span className="text-sm font-medium">
                    {CURRENCIES[code]?.symbol}{rate.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {code}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-text-muted mt-2">
              Actualizado: {ratesLabel}
            </p>
          </div>
        </div>
      </section>

      {/* Categories section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-text-muted" />
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Categorías</h2>
          </div>
          <button
            onClick={() => setShowCatSheet(true)}
            className="flex items-center gap-1 text-accent text-xs font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva
          </button>
        </div>

        <div className="bg-bg-card rounded-2xl overflow-hidden">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                idx < categories.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: `${cat.color}20` }}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{cat.name}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                <button
                  onClick={() => setEditingCat(cat)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-bg-tertiary text-text-muted active:scale-90 transition-transform"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteCat(cat.id)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
                    deleteConfirm === cat.id
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
      </section>

      {(showCatSheet || editingCat) && (
        <CategorySheet
          initial={editingCat}
          onClose={() => {
            setShowCatSheet(false)
            setEditingCat(null)
          }}
        />
      )}
    </div>
  )
}
