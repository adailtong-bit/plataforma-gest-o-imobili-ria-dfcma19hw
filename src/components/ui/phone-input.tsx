import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn, applyPhoneMask } from '@/lib/utils'

interface PhoneInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  defaultCountry?: 'US' | 'BR' | 'ES'
  country?: 'US' | 'BR' | 'ES'
  onCountryChange?: (country: 'US' | 'BR' | 'ES') => void
}

const COUNTRIES = {
  US: { code: '+1', flag: '🇺🇸', mask: '(999) 999-9999', maxLength: 14 },
  BR: { code: '+55', flag: '🇧🇷', mask: '(99) 99999-9999', maxLength: 15 },
  ES: { code: '+34', flag: '🇪🇸', mask: '999 99 99 99', maxLength: 13 },
}

export function PhoneInput({
  className,
  value,
  onChange,
  defaultCountry = 'US',
  country: controlledCountry,
  onCountryChange,
  ...props
}: PhoneInputProps) {
  // Use controlled country if provided, otherwise internal state
  const [internalCountry, setInternalCountry] =
    React.useState<keyof typeof COUNTRIES>(defaultCountry)

  const currentCountry = controlledCountry || internalCountry

  const handleCountryChange = (val: string) => {
    const newCountry = val as keyof typeof COUNTRIES
    if (onCountryChange) {
      onCountryChange(newCountry)
    } else {
      setInternalCountry(newCountry)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    // Apply mask based on country
    const maskedValue = applyPhoneMask(rawValue, currentCountry)

    // Strict length check: prevent typing more than valid length
    if (maskedValue.length > COUNTRIES[currentCountry].maxLength) {
      return
    }

    // Create a synthetic event to pass back
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: maskedValue,
      },
    }

    onChange(syntheticEvent)
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Select value={currentCountry} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[100px] bg-white text-black">
          <SelectValue>
            <span className="mr-2">{COUNTRIES[currentCountry].flag}</span>
            {COUNTRIES[currentCountry].code}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white">
          {Object.entries(COUNTRIES).map(([key, data]) => (
            <SelectItem
              key={key}
              value={key}
              className="text-black hover:bg-slate-100"
            >
              <span className="mr-2">{data.flag}</span>
              {data.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        {...props}
        value={value}
        onChange={handlePhoneChange}
        placeholder={COUNTRIES[currentCountry].mask}
        maxLength={COUNTRIES[currentCountry].maxLength}
        className={cn('flex-1 bg-white text-black', className)}
      />
    </div>
  )
}
