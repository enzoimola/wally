import { LayoutDashboard, List, TrendingUp, Settings, Plus } from 'lucide-react'

const TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { id: 'expenses', icon: List, label: 'Gastos' },
  { id: 'ADD', icon: Plus, label: '' },
  { id: 'incomes', icon: TrendingUp, label: 'Ingresos' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
]

export default function BottomNav({ current, onChange, onAdd }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
      <div className="bg-bg-secondary/90 glass border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around px-2 h-16">
          {TABS.map((tab) => {
            if (tab.id === 'ADD') {
              return (
                <button
                  key="add"
                  onClick={onAdd}
                  className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-accent shadow-lg shadow-accent/40 active:scale-95 transition-transform"
                >
                  <Plus className="w-7 h-7 text-white" />
                </button>
              )
            }
            const isActive = current === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
