import { useState, useEffect } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import { useStore } from './store/useStore'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Incomes from './pages/Incomes'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'
import AddExpenseSheet from './components/AddExpenseSheet'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const fetchExchangeRates = useStore((s) => s.fetchExchangeRates)
  const ratesUpdatedAt = useStore((s) => s.ratesUpdatedAt)

  useEffect(() => {
    const fourHours = 4 * 60 * 60 * 1000
    const needsUpdate =
      !ratesUpdatedAt || Date.now() - new Date(ratesUpdatedAt).getTime() > fourHours
    if (needsUpdate) fetchExchangeRates()
  }, [])

  return (
    <div className="flex flex-col min-h-dvh bg-bg-primary text-text-primary max-w-md mx-auto relative">
      {/* Settings button — top right corner */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-0 right-0 z-30 pt-safe pr-4 pb-2 pl-2"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
      >
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-tertiary text-text-secondary">
          <SettingsIcon className="w-4 h-4" />
        </div>
      </button>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {page === 'dashboard' && <Dashboard onAddExpense={() => setShowAddExpense(true)} />}
        {page === 'expenses' && <Expenses onAddExpense={() => setShowAddExpense(true)} />}
        {page === 'incomes' && <Incomes />}
        {page === 'calendar' && <Calendar />}
      </main>

      <BottomNav current={page} onChange={setPage} onAdd={() => setShowAddExpense(true)} />

      {showAddExpense && (
        <AddExpenseSheet onClose={() => setShowAddExpense(false)} />
      )}

      {/* Settings overlay */}
      {showSettings && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowSettings(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto bg-bg-primary max-w-md mx-auto">
            <div className="flex items-center justify-between px-4 pt-safe pb-3 border-b border-white/5 sticky top-0 bg-bg-primary z-10">
              <h2 className="text-lg font-bold">Ajustes</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-tertiary text-text-secondary"
              >
                ✕
              </button>
            </div>
            <div className="pb-safe">
              <Settings />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
