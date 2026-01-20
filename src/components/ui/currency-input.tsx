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
      // Check if current input matches the numeric value to prevent cursor jump during typing if we were to format constantly
      // But here we format only on mount/update from prop
      const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(value)

      // If the parsed display value is different from the prop value, update display
      // This allows free typing without aggressive re-formatting while typing
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
    // Allow digits, dots, commas, minus
    if (/^[0-9.,$-]*$/.test(inputValue) || inputValue === '') {
      setDisplayValue(inputValue)

      // Try to parse for the parent
      // Remove currency symbols and non-numeric characters except dot/comma/minus
      // Simplified parsing logic
      const numericString = inputValue.replace(/[^0-9.-]/g, '')
      const parsed = parseFloat(numericString)
      if (!isNaN(parsed)) {
        onChange(parsed)
      }
    }
  }

  const handleBlur = () => {
    // On blur, format nicely
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
      onChange(0)
      setDisplayValue('')
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
