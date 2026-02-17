import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Language } from './translations'
import { format } from 'date-fns'
import { ptBR, es, enUS } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Check for generic or placeholder values to enforce data integrity
export const isGenericOrPlaceholder = (
  value: string | undefined | null,
): boolean => {
  if (!value) return false
  const lower = value.toString().toLowerCase().trim()

  if (lower.length > 2 && /^(\w)\1+$/.test(lower)) return true
  if (lower.length > 4 && '01234567890123456789'.includes(lower)) return true

  const placeholders = [
    'test',
    'teste',
    'xyz',
    'abc',
    'n/a',
    'na',
    'none',
    'null',
    'undefined',
    'string',
    'text',
  ]
  if (placeholders.includes(lower)) return true

  return false
}

export const applyPhoneMask = (value: string, country: 'US' | 'BR' | 'ES') => {
  const digits = value.replace(/\D/g, '')

  if (country === 'US') {
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  if (country === 'BR') {
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  if (country === 'ES') {
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 7)
      return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  return value
}

export const applyDateMask = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
}

export const isPhoneValid = (value: string, country: 'US' | 'BR' | 'ES') => {
  if (!value) return false
  const digits = value.replace(/\D/g, '')
  if (country === 'US') return digits.length === 10
  if (country === 'BR') return digits.length === 10 || digits.length === 11
  if (country === 'ES') return digits.length === 9
  return digits.length >= 8
}

export const applyDocumentMask = (
  value: string,
  country: 'US' | 'BR' | 'ES',
) => {
  const digits = value.replace(/\D/g, '')

  if (country === 'US') {
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
  }

  if (country === 'BR') {
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  if (country === 'ES') {
    if (digits.length <= 8) return digits
    return `${digits.slice(0, 8)}-${digits.slice(8, 9)}`
  }

  return value
}

export const applyZipCodeMask = (value: string, country: string) => {
  const digits = value.replace(/\D/g, '')

  if (country === 'US') {
    return digits.slice(0, 5)
  }
  if (country === 'BR' || country === 'Brazil') {
    if (digits.length <= 5) return digits
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
  }
  if (country === 'ES' || country === 'Spain') {
    return digits.slice(0, 5)
  }
  return value
}

export const exportToCSV = (
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
) => {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return ''
          const stringCell = String(cell)
          if (
            stringCell.includes(',') ||
            stringCell.includes('"') ||
            stringCell.includes('\n')
          ) {
            return `"${stringCell.replace(/"/g, '""')}"`
          }
          return stringCell
        })
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    filename.endsWith('.csv') ? filename : `${filename}.csv`,
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const getCurrencyLocale = (currency: string) => {
  const currencyLocales: Record<string, string> = {
    USD: 'en-US',
    BRL: 'pt-BR',
    EUR: 'de-DE', // Standard Euro formatting
  }
  return currencyLocales[currency] || 'en-US'
}

export const formatCurrency = (value: number, currency: string = 'USD') => {
  const locale = getCurrencyLocale(currency)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value)
}

export const formatDate = (
  date: string | Date | undefined,
  language: Language = 'en',
) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (language === 'pt') {
    return format(d, 'dd/MM/yyyy', { locale: ptBR })
  }
  if (language === 'es') {
    return format(d, 'dd/MM/yyyy', { locale: es })
  }

  return format(d, 'MM/dd/yyyy', { locale: enUS })
}


