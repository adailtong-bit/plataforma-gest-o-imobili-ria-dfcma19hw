import * as React from 'react'
import { Input } from '@/components/ui/input'

export function localApplyPhoneMask(value: string, country: string): string {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''

  if (country === 'BR') {
    if (digits.length <= 2) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

  if (country === 'US') {
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
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

interface PhoneInputProps extends Omit<
  React.ComponentProps<'input'>,
  'onChange'
> {
  value?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  country?: 'US' | 'BR' | 'ES'
  onCountryChange?: (country: 'US' | 'BR' | 'ES') => void
}

export function PhoneInput({
  value,
  onChange,
  country = 'US',
  onCountryChange,
  className,
  ...props
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const maskedValue = localApplyPhoneMask(rawValue, country)
    // Create a synthetic event
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: maskedValue,
      },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(newEvent)
  }

  // Effect to re-mask when country changes
  React.useEffect(() => {
    if (value) {
      const maskedValue = localApplyPhoneMask(value, country)
      if (maskedValue !== value) {
        onChange({
          target: { value: maskedValue },
        } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }, [country])

  return (
    <div className="flex w-full">
      {onCountryChange && (
        <select
          className="h-10 rounded-l-md border border-r-0 border-input bg-slate-50 px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={country}
          onChange={(e) => onCountryChange(e.target.value as any)}
        >
          <option value="US">🇺🇸 +1</option>
          <option value="BR">🇧🇷 +55</option>
          <option value="ES">🇪🇸 +34</option>
        </select>
      )}
      <Input
        type="tel"
        value={value}
        onChange={handleChange}
        className={`h-10 ${onCountryChange ? 'rounded-l-none' : ''} ${className || ''}`}
        {...props}
      />
    </div>
  )
}
