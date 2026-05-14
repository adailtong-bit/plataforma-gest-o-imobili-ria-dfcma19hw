import { useState, useEffect } from 'react'
import { Property, Condominium } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import usePropertyStore from '@/stores/usePropertyStore'

interface Props {
  data: Property
  onChange: (f: keyof Property, v: any) => void
  canEdit: boolean
  condominiums: Condominium[]
}

export function PropertyLocation({
  data,
  onChange,
  canEdit,
  condominiums,
}: Props) {
  const { properties } = usePropertyStore()
  const [zipError, setZipError] = useState('')
  const [addressWarning, setAddressWarning] = useState('')

  const validateZipCode = (zip: string) => {
    if (!zip) {
      setZipError('')
      return true
    }
    const cleanZip = zip.replace(/\D/g, '')
    // Dummy sequences check
    if (
      cleanZip === '00000000' ||
      cleanZip === '00000' ||
      /^(\d)\1+$/.test(cleanZip)
    ) {
      setZipError('Invalid ZIP code format')
      return false
    }
    setZipError('')
    return true
  }

  const checkAddressUniqueness = (address: string, zipCode: string) => {
    if (!address || !zipCode) {
      setAddressWarning('')
      return
    }

    // Extract first number from address
    const numberMatch = address.match(/\d+/)
    const number = numberMatch ? numberMatch[0] : ''

    if (number) {
      const isDuplicate = properties.some(
        (p) =>
          p.id !== data.id &&
          p.zipCode === zipCode &&
          p.address.includes(number),
      )
      if (isDuplicate) {
        setAddressWarning(
          'Warning: A property with this Zip Code and Number might already exist.',
        )
      } else {
        setAddressWarning('')
      }
    } else {
      setAddressWarning('')
    }
  }

  useEffect(() => {
    validateZipCode(data.zipCode || '')
    checkAddressUniqueness(data.address || '', data.zipCode || '')
  }, [data.address, data.zipCode, properties, data.id])

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>Detalhes de Localização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={data.address}
              onChange={(e) => onChange('address', e.target.value)}
              disabled={!canEdit}
            />
            {addressWarning && (
              <p className="text-xs text-amber-600">{addressWarning}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input
              value={data.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Input
              value={data.state || ''}
              onChange={(e) => onChange('state', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>CEP</Label>
            <Input
              value={data.zipCode || ''}
              onChange={(e) => {
                const val = e.target.value
                onChange('zipCode', val)
              }}
              onBlur={(e) => validateZipCode(e.target.value)}
              disabled={!canEdit}
              className={
                zipError ? 'border-red-500 focus-visible:ring-red-500' : ''
              }
            />
            {zipError && <p className="text-xs text-red-500">{zipError}</p>}
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Condomínio Vinculado</Label>
            <Select
              value={data.condominiumId || 'none'}
              onValueChange={(v) =>
                onChange('condominiumId', v === 'none' ? undefined : v)
              }
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {condominiums.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
