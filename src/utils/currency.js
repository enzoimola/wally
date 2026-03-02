export const CURRENCIES = {
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
  USD: { symbol: '$', name: 'Dólar', flag: '🇺🇸' },
  ARS: { symbol: '$', name: 'Peso Arg.', flag: '🇦🇷' },
}

/**
 * Convert an amount from EUR (base) to target currency.
 */
export function convertFromEUR(amountEUR, targetCurrency, rates) {
  if (targetCurrency === 'EUR') return amountEUR
  const rate = rates[targetCurrency]
  if (!rate) return amountEUR
  return amountEUR * rate
}

/**
 * Convert an amount in any currency to EUR.
 */
export function convertToEUR(amount, fromCurrency, rates) {
  if (fromCurrency === 'EUR') return amount
  const rate = rates[fromCurrency]
  if (!rate) return amount
  return amount / rate
}

/**
 * Format a number as currency string.
 */
export function formatCurrency(amount, currency = 'EUR') {
  const { symbol } = CURRENCIES[currency] || { symbol: currency }
  const formatted = Math.abs(amount).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${symbol}${formatted}`
}

/**
 * Format a small amount with up to 0 decimals for compact display.
 */
export function formatCompact(amount, currency = 'EUR') {
  const { symbol } = CURRENCIES[currency] || { symbol: currency }
  if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`
  }
  return `${symbol}${amount.toFixed(0)}`
}
