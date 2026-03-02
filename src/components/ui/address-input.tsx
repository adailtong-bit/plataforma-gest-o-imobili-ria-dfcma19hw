import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export interface AddressData {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface AddressInputProps {
  onAddressSelect: (address: AddressData) => void
  placeholder?: string
}

export function AddressInput({
  onAddressSelect,
  placeholder = 'Search address...',
}: AddressInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddress = async (text: string) => {
    setQuery(text)
    if (text.length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`,
      )
      const data = await res.json()
      setResults(data)
      setIsOpen(true)
    } catch (error) {
      console.error('Address search error', error)
    }
  }

  const handleSelect = (item: any) => {
    const addr = item.address
    const data: AddressData = {
      street: addr.road || addr.pedestrian || addr.suburb || '',
      city: addr.city || addr.town || addr.village || '',
      state: addr.state || '',
      zipCode: addr.postcode || '',
      country: addr.country || '',
    }

    // Auto map common country names to ISO
    if (data.country === 'United States' || data.country === 'Estados Unidos')
      data.country = 'USA'
    if (data.country === 'Brasil') data.country = 'Brazil'
    if (data.country === 'España') data.country = 'Spain'

    setQuery(item.display_name)
    setIsOpen(false)
    onAddressSelect(data)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => searchAddress(e.target.value)}
          placeholder={placeholder}
          className="pl-9 bg-white text-black"
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((item, i) => (
            <div
              key={i}
              className="p-2 text-sm hover:bg-slate-100 cursor-pointer border-b last:border-0 text-black"
              onClick={() => handleSelect(item)}
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
