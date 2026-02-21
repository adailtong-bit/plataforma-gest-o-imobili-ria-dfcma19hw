import { useState } from 'react'
import { Property, PropertyContact } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Users } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import { isValidEmail, isPhoneValid } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { DataMask } from '@/components/DataMask'

interface PropertyContactsProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyContacts({
  data,
  onChange,
  canEdit,
}: PropertyContactsProps) {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [newContactCountry, setNewContactCountry] = useState<
    'US' | 'BR' | 'ES'
  >('US')
  const [newContact, setNewContact] = useState<Partial<PropertyContact>>({
    role: '',
    name: '',
    phone: '',
    email: '',
  })

  const addContact = () => {
    if (!newContact.name || !newContact.role) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }

    if (newContact.email && !isValidEmail(newContact.email)) {
      toast({
        title: t('common.error'),
        description: t('common.email_invalid'),
        variant: 'destructive',
      })
      return
    }

    if (
      newContact.phone &&
      !isPhoneValid(newContact.phone, newContactCountry)
    ) {
      toast({
        title: t('common.error'),
        description: `Invalid phone format`,
        variant: 'destructive',
      })
      return
    }

    const contact: PropertyContact = {
      id: `pc-${Date.now()}`,
      name: newContact.name!,
      role: newContact.role!,
      phone: newContact.phone || '',
      email: newContact.email || '',
    }

    const contacts = [...(data.contacts || []), contact]
    onChange('contacts', contacts)
    setNewContact({ role: '', name: '', phone: '', email: '' })
  }

  const removeContact = (id: string) => {
    const contacts = (data.contacts || []).filter((c) => c.id !== id)
    onChange('contacts', contacts)
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-950">
          <Users className="h-5 w-5" /> {t('common.contact')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {canEdit && (
          <div className="flex flex-col gap-2 mb-6 border p-4 rounded-md bg-white">
            <h4 className="font-bold text-sm text-slate-950">Novo Contato</h4>
            <div className="flex gap-2 items-end flex-wrap">
              <div className="grid gap-2 w-full md:w-1/5">
                <Label className="font-bold">{t('common.role_label')}</Label>
                <Select
                  value={newContact.role}
                  onValueChange={(v) =>
                    setNewContact({ ...newContact, role: v })
                  }
                >
                  <SelectTrigger className="text-black border-slate-300">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concierge">Concierge</SelectItem>
                    <SelectItem value="Maintenance">Manutenção</SelectItem>
                    <SelectItem value="Emergency">Emergência</SelectItem>
                    <SelectItem value="Local Agent">Agente Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 w-full md:w-1/5">
                <Label className="font-bold">{t('common.name')}</Label>
                <Input
                  value={newContact.name}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  className="text-black border-slate-300"
                />
              </div>
              <div className="grid gap-2 w-full md:w-1/4">
                <Label className="font-bold">{t('common.phone')}</Label>
                <PhoneInput
                  value={newContact.phone || ''}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  country={newContactCountry}
                  onCountryChange={setNewContactCountry}
                />
              </div>
              <div className="grid gap-2 w-full md:w-1/4">
                <Label className="font-bold">{t('common.email')}</Label>
                <Input
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  className="text-black border-slate-300"
                />
              </div>
              <Button onClick={addContact} className="bg-trust-blue text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-black">
                {t('common.role_label')}
              </TableHead>
              <TableHead className="font-bold text-black">
                {t('common.name')}
              </TableHead>
              <TableHead className="font-bold text-black">
                {t('common.phone')}
              </TableHead>
              <TableHead className="font-bold text-black">
                {t('common.email')}
              </TableHead>
              {canEdit && (
                <TableHead className="font-bold text-black text-right">
                  {t('common.actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data.contacts || data.contacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 5 : 4}
                  className="text-center py-6 text-muted-foreground"
                >
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              data.contacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold text-slate-950">
                    {c.role}
                  </TableCell>
                  <TableCell className="text-slate-950 font-medium">
                    <DataMask blur={!canEdit}>{c.name}</DataMask>
                  </TableCell>
                  <TableCell className="text-slate-950 font-medium">
                    <DataMask blur={!canEdit}>{c.phone}</DataMask>
                  </TableCell>
                  <TableCell className="text-slate-950 font-medium">
                    <DataMask blur={!canEdit}>{c.email}</DataMask>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeContact(c.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
