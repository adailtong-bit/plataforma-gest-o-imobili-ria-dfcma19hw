import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Language } from './translations'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Basic mask enforcement
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

export const applyDocumentMask = (
  value: string,
  country: 'US' | 'BR' | 'ES',
) => {
  const digits = value.replace(/\D/g, '')

  if (country === 'US') {
    // SSN: XXX-XX-XXXX
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
  }

  if (country === 'BR') {
    // CPF: XXX.XXX.XXX-XX
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9)
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
  }

  if (country === 'ES') {
    // DNI: 8 digits + Letter (Handling only digits here for simplicity mostly, usually users type letter at end)
    // Simple mask for 12345678A -> usually no separators or just space
    if (digits.length <= 8) return digits
    return digits.slice(0, 9)
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
  if (language === 'es') {
    // Custom ES format requested: $1.200,00 or €
    // If currency is USD, requested format was $1.200,00
    // If we want to support EUR for ES context:
    const currencyCode =
      currency === 'USD' && language === 'es' ? 'USD' : currency
    // Using es-ES locale
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currencyCode,
    }).format(value)
  }

  if (language === 'pt') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL', // Assuming BRL for PT context as per example R$ 1.200,00
    }).format(value)
  }

  // Default EN
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export const formatDate = (date: string | Date, language: Language = 'en') => {
  if (language === 'es' || language === 'pt') {
    // ES/PT requested format: DD/MM/YYYY
    return format(new Date(date), 'dd/MM/yyyy')
  }

  // Default EN
  return format(new Date(date), 'MM/dd/yyyy')
}
