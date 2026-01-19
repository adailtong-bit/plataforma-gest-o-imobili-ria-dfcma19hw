import * as React from 'react'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { MapPin, Check } from 'lucide-react'

export interface AddressData {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  community?: string
}

interface AddressInputProps {
  onAddressSelect: (address: AddressData) => void
  defaultValue?: string
  className?: string
  disabled?: boolean
}

// Mock addresses for simulation
const MOCK_ADDRESSES = [
  {
    label: '123 Palm Street, Orlando, FL',
    data: {
      street: '123 Palm Street',
      city: 'Orlando',
      state: 'FL',
      zipCode: '32801',
      country: 'USA',
      community: 'Sunny Isles',
    },
  },
  {
    label: '450 Brickell Ave, Miami, FL',
    data: {
      street: '450 Brickell Ave',
      city: 'Miami',
      state: 'FL',
      zipCode: '33131',
      country: 'USA',
      community: 'Brickell Heights',
    },
  },
  {
    label: 'Av. Paulista 1000, São Paulo, SP',
    data: {
      street: 'Av. Paulista 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brazil',
      community: 'Bela Vista',
    },
  },
]

export function AddressInput({
  onAddressSelect,
  defaultValue = '',
  className,
  disabled,
}: AddressInputProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)

  const handleSelect = (addr: (typeof MOCK_ADDRESSES)[0]) => {
    setValue(addr.label)
    onAddressSelect(addr.data)
    setOpen(false)
  }

  // Effect to sync external default value
  React.useEffect(() => {
    if (defaultValue) setValue(defaultValue)
  }, [defaultValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setOpen(true)
            }}
            disabled={disabled}
            className={cn('pr-8', className)}
            placeholder="Search address..."
            role="combobox"
            aria-expanded={open}
          />
          <MapPin className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search address..." className="h-9" />
          <CommandList>
            <CommandEmpty>No address found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {MOCK_ADDRESSES.map((addr) => (
                <CommandItem
                  key={addr.label}
                  value={addr.label}
                  onSelect={() => handleSelect(addr)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  {addr.label}
                  {value === addr.label && (
                    <Check className="ml-auto h-4 w-4 opacity-100" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
