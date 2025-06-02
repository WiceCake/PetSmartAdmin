/**
 * Currency formatting utilities for Philippine Peso (₱)
 * Centralized currency formatting for the PetSmart Admin Dashboard
 */

export interface CurrencyFormatOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  showSymbol?: boolean
  compact?: boolean
}

/**
 * Format amount as Philippine Peso with proper locale formatting
 */
export const formatCurrency = (
  amount: number | string, 
  options: CurrencyFormatOptions = {}
): string => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    compact = false
  } = options

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount)) {
    return showSymbol ? '₱0.00' : '0.00'
  }

  // Use Philippine locale for proper number formatting
  const formatter = new Intl.NumberFormat('en-PH', {
    style: compact ? 'decimal' : 'currency',
    currency: 'PHP',
    minimumFractionDigits,
    maximumFractionDigits,
    notation: compact ? 'compact' : 'standard'
  })

  if (compact) {
    // For compact notation, manually add the peso symbol
    const formatted = formatter.format(numericAmount)
    return showSymbol ? `₱${formatted}` : formatted
  }

  // For standard currency formatting, replace PHP with ₱ symbol
  const formatted = formatter.format(numericAmount)
  return formatted.replace('PHP', '₱').replace('₱ ', '₱')
}

/**
 * Format amount as simple peso with symbol
 */
export const formatPeso = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount)) {
    return '₱0.00'
  }

  return `₱${numericAmount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * Format amount for display in tables and lists
 */
export const formatCurrencyCompact = (amount: number | string): string => {
  return formatCurrency(amount, { compact: true })
}

/**
 * Format amount without currency symbol (for calculations display)
 */
export const formatAmount = (amount: number | string): string => {
  return formatCurrency(amount, { showSymbol: false })
}

/**
 * Parse currency string back to number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove peso symbol and any non-numeric characters except decimal point
  const cleaned = currencyString.replace(/[₱,\s]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Validate if a string represents a valid currency amount
 */
export const isValidCurrency = (value: string): boolean => {
  const cleaned = value.replace(/[₱,\s]/g, '')
  const parsed = parseFloat(cleaned)
  return !isNaN(parsed) && parsed >= 0
}

/**
 * Format currency for different contexts
 */
export const formatCurrencyByContext = (
  amount: number | string,
  context: 'table' | 'card' | 'chart' | 'summary' = 'table'
): string => {
  switch (context) {
    case 'table':
      return formatPeso(amount)
    case 'card':
      return formatCurrency(amount, { compact: true })
    case 'chart':
      return formatCurrency(amount, { compact: true, maximumFractionDigits: 0 })
    case 'summary':
      return formatCurrency(amount)
    default:
      return formatPeso(amount)
  }
}

/**
 * Currency constants
 */
export const CURRENCY_CONFIG = {
  symbol: '₱',
  code: 'PHP',
  name: 'Philippine Peso',
  locale: 'en-PH',
  decimals: 2
} as const

/**
 * Legacy support - maintain backward compatibility
 */
export const formatPhilippinePeso = formatPeso
export const formatPHP = formatCurrency
