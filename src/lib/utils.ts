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

// Phone mask enforcement
export const applyPhoneMask = (value: string, country: 'US' | 'BR' | 'ES') => {
  const digits = value.replace(/\D/g, '')

  if (country === 'US') {
    // (XXX) XXX-XXXX
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  if (country === 'BR') {
    // (XX) XXXXX-XXXX
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  if (country === 'ES') {
    // XXX XX XX XX
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 7)
      return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
  }

  return value
}

// Document mask enforcement based on Acceptance Criteria
export const applyDocumentMask = (
  value: string,
  country: 'US' | 'BR' | 'ES',
) => {
  const digits = value.replace(/\D/g, '')

  if (country === 'US') {
    // SSN: ###-##-####
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
  }

  if (country === 'BR') {
    // CPF: ###.###.###-##
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  if (country === 'ES') {
    // DNI: ########-#
    // Typically 8 digits + Letter, but masking for numeric part often shown as 12345678-A or similar
    // Requirement says: ########-#
    if (digits.length <= 8) return digits
    return `${digits.slice(0, 8)}-${digits.slice(8, 9)}`
  }

  return value
}

// Export data to CSV
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
          // Escape quotes and wrap in quotes if contains comma or quotes
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

export const formatCurrency = (
  value: number,
  language: Language = 'en',
  currency: string = 'USD',
) => {
  let locale = 'en-US'
  let currencyCode = currency

  // Override currency code for display based on User Story requirements
  if (language === 'pt') {
    locale = 'pt-BR'
    currencyCode = 'BRL' // R$ 1.234,56
  } else if (language === 'es') {
    locale = 'es-ES'
    currencyCode = 'EUR' // € 1.234,56
  } else {
    locale = 'en-US'
    currencyCode = 'USD' // $1,234.56
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
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

  // Default EN
  return format(d, 'MM/dd/yyyy', { locale: enUS })
}
