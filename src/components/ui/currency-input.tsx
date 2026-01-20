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

  // Format value on mount or change
  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(value)
      setDisplayValue(formatted)
    } else {
      setDisplayValue('')
    }
  }, [value, currency, locale])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Remove non-numeric chars except dot/comma
    const cleanValue = inputValue.replace(/[^0-9.,]/g, '')

    // This is a naive implementation to support typing "1000" -> "$ 1,000.00"
    // For "as user types" experience, it's best to allow free typing and format on blur
    // or use a specialized library. Here we do free typing and format only on blur to avoid cursor jumping.
    setDisplayValue(inputValue)
  }

  const handleBlur = () => {
    // Parse the display value to a number
    // Remove currency symbol and group separators, normalize decimal separator
    const numericString = displayValue
      .replace(/[^0-9.,-]/g, '')
      .replace(/,/g, '') // remove thousands separator (assuming en-US logic mostly)

    const parsed = parseFloat(numericString)
    if (!isNaN(parsed)) {
      onChange(parsed)
      // Re-format for display
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

  const handleFocus = () => {
    // When focused, show raw number for editing if needed, or keep formatted
    // Standard UX: keep formatted but allow editing.
    // Simpler: select all
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
