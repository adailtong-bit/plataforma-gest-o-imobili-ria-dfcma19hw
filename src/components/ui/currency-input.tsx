import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface CurrencyInputProps extends Omit<
  React.ComponentProps<'input'>,
  'onChange'
> {
  value?: number
  onChange: (value: number) => void
  currency?: string
  locale?: string
}

export function CurrencyInput({
  value,
  onChange,
  currency = 'USD',
  locale = 'en-US',
  className,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')

  // Format value on mount or external update
  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(value)

      // Only update display if logic matches numeric
      // We allow the user to type freely
      const currentNumeric = parseFloat(displayValue.replace(/[^0-9.-]/g, ''))
      if (currentNumeric !== value || !displayValue) {
        setDisplayValue(formatted)
      }
    } else {
      setDisplayValue('')
    }
  }, [value, currency, locale])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Allow digits, dots, commas, minus, and currency symbols briefly
    // But we mostly care about digits
    if (/^[0-9.,$-]*$/.test(inputValue) || inputValue === '') {
      setDisplayValue(inputValue)

      const numericString = inputValue.replace(/[^0-9.-]/g, '')
      const parsed = parseFloat(numericString)
      if (!isNaN(parsed)) {
        onChange(parsed)
      }
    }
  }

  const handleBlur = () => {
    const numericString = displayValue.replace(/[^0-9.-]/g, '')
    const parsed = parseFloat(numericString)

    if (!isNaN(parsed)) {
      onChange(parsed)
      const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(parsed)
      setDisplayValue(formatted)
    } else {
      if (displayValue.trim() === '') {
        onChange(0)
      }
      // If invalid, we might revert or clear. Here we revert to 0 if empty
    }
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={(e) => e.target.select()}
      className={cn('no-spinner', className)}
      {...props}
    />
  )
}
