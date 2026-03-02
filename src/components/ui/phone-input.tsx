import * as React from 'react'
import { Input } from '@/components/ui/input'
import { applyPhoneMask } from '@/lib/utils'

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
    const maskedValue = applyPhoneMask(rawValue, country)
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
      const maskedValue = applyPhoneMask(value, country)
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
