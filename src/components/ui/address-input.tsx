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
import { MapPin, Check, Loader2 } from 'lucide-react'

export interface AddressData {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  community?: string
  neighborhood?: string
}

interface AddressInputProps {
  onAddressSelect: (address: AddressData) => void
  defaultValue?: string
  className?: string
  disabled?: boolean
}

// Mock addresses with expanded data
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
      neighborhood: 'Downtown',
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
      neighborhood: 'Brickell',
    },
  },
  {
    label: '800 Ocean Drive, Miami Beach, FL',
    data: {
      street: '800 Ocean Drive',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
      country: 'USA',
      community: 'Art Deco District',
      neighborhood: 'South Beach',
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
      neighborhood: 'Bela Vista',
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
  const [loading, setLoading] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState(MOCK_ADDRESSES)

  const handleSelect = (addr: (typeof MOCK_ADDRESSES)[0]) => {
    setValue(addr.label)
    onAddressSelect(addr.data)
    setOpen(false)
  }

  // Simulate remote search
  const handleSearch = (term: string) => {
    setLoading(true)
    setTimeout(() => {
      const filtered = MOCK_ADDRESSES.filter((addr) =>
        addr.label.toLowerCase().includes(term.toLowerCase()),
      )
      setSuggestions(filtered)
      setLoading(false)
    }, 500)
  }

  // Effect to sync external default value
  React.useEffect(() => {
    if (defaultValue) setValue(defaultValue)
  }, [defaultValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full group">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleSearch(e.target.value)
              setOpen(true)
            }}
            disabled={disabled}
            className={cn('pr-8 transition-shadow focus:ring-2', className)}
            placeholder="Search address (e.g. 123 Main St)"
            role="combobox"
            aria-expanded={open}
          />
          <MapPin className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-50 group-focus-within:opacity-100 transition-opacity" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Type address..."
            className="h-9"
            onValueChange={handleSearch}
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
              </div>
            ) : (
              <>
                <CommandEmpty>No address found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {suggestions.map((addr) => (
                    <CommandItem
                      key={addr.label}
                      value={addr.label}
                      onSelect={() => handleSelect(addr)}
                      className="cursor-pointer"
                    >
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{addr.label}</span>
                        {addr.data.community && (
                          <span className="text-[10px] text-muted-foreground">
                            {addr.data.community}
                          </span>
                        )}
                      </div>
                      {value === addr.label && (
                        <Check className="ml-auto h-4 w-4 opacity-100" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
