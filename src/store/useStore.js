import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Comida', icon: '🍕', color: '#F59E0B' },
  { id: 'transport', name: 'Transporte', icon: '🚌', color: '#3B82F6' },
  { id: 'leisure', name: 'Ocio', icon: '🎬', color: '#8B5CF6' },
  { id: 'health', name: 'Salud', icon: '💊', color: '#EF4444' },
  { id: 'shopping', name: 'Compras', icon: '🛍️', color: '#EC4899' },
  { id: 'home', name: 'Hogar', icon: '🏠', color: '#14B8A6' },
  { id: 'education', name: 'Educación', icon: '📚', color: '#6366F1' },
  { id: 'other', name: 'Otro', icon: '📦', color: '#71717A' },
]

export const useStore = create(
  persist(
    (set, get) => ({
      // ─── Expenses ────────────────────────────────────────────────
      expenses: [],

      addExpense: (expense) =>
        set((s) => ({
          expenses: [
            { ...expense, id: uuidv4(), createdAt: new Date().toISOString() },
            ...s.expenses,
          ],
        })),

      updateExpense: (id, updates) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),

      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      // ─── Incomes ─────────────────────────────────────────────────
      incomes: [],

      addIncome: (income) =>
        set((s) => ({
          incomes: [
            { ...income, id: uuidv4(), createdAt: new Date().toISOString() },
            ...s.incomes,
          ],
        })),

      updateIncome: (id, updates) =>
        set((s) => ({
          incomes: s.incomes.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      deleteIncome: (id) =>
        set((s) => ({ incomes: s.incomes.filter((i) => i.id !== id) })),

      // ─── Categories ──────────────────────────────────────────────
      categories: DEFAULT_CATEGORIES,

      addCategory: (cat) =>
        set((s) => ({
          categories: [...s.categories, { ...cat, id: uuidv4() }],
        })),

      updateCategory: (id, updates) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      // ─── Currency settings ────────────────────────────────────────
      defaultCurrency: 'EUR',
      setDefaultCurrency: (currency) => set({ defaultCurrency: currency }),

      exchangeRates: { USD: 1.08, ARS: 1050 }, // fallback rates (EUR base)
      ratesUpdatedAt: null,
      fetchExchangeRates: async () => {
        try {
          const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD,ARS')
          if (!res.ok) throw new Error('rate fetch failed')
          const data = await res.json()
          set({ exchangeRates: data.rates, ratesUpdatedAt: new Date().toISOString() })
        } catch {
          // keep existing rates
        }
      },

      // ─── Active month (for navigation) ───────────────────────────
      activeMonth: new Date().toISOString().slice(0, 7), // 'YYYY-MM'
      setActiveMonth: (month) => set({ activeMonth: month }),
    }),
    {
      name: 'wally-storage',
      version: 1,
    }
  )
)
