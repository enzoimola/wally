import { useState, useEffect } from 'react'
import { useStore } from './store/useStore'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Incomes from './pages/Incomes'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'
import AddExpenseSheet from './components/AddExpenseSheet'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [showAddExpense, setShowAddExpense] = useState(false)
  const fetchExchangeRates = useStore((s) => s.fetchExchangeRates)
  const ratesUpdatedAt = useStore((s) => s.ratesUpdatedAt)

  useEffect(() => {
    // Fetch rates on mount if older than 4 hours or never fetched
    const fourHours = 4 * 60 * 60 * 1000
    const needsUpdate =
      !ratesUpdatedAt || Date.now() - new Date(ratesUpdatedAt).getTime() > fourHours
    if (needsUpdate) fetchExchangeRates()
  }, [])

  return (
    <div className="flex flex-col min-h-dvh bg-bg-primary text-text-primary max-w-md mx-auto relative">
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {page === 'dashboard' && <Dashboard onAddExpense={() => setShowAddExpense(true)} />}
        {page === 'expenses' && <Expenses onAddExpense={() => setShowAddExpense(true)} />}
        {page === 'incomes' && <Incomes />}
        {page === 'settings' && <Settings />}
      </main>

      <BottomNav current={page} onChange={setPage} onAdd={() => setShowAddExpense(true)} />

      {showAddExpense && (
        <AddExpenseSheet onClose={() => setShowAddExpense(false)} />
      )}
    </div>
  )
}
