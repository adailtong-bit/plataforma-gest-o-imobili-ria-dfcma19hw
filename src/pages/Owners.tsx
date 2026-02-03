import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  MessageSquare,
  Building2,
  Phone,
  Eye,
  MoreHorizontal,
  FileText,
} from 'lucide-react'
import useOwnerStore from '@/stores/useOwnerStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import useLanguageStore from '@/stores/useLanguageStore'
import { PhoneInput } from '@/components/ui/phone-input'
import { DataMask } from '@/components/DataMask'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import { isPhoneValid, isValidEmail, applyZipCodeMask } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Owners() {
  const { owners, addOwner } = useOwnerStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const [newOwner, setNewOwner] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'US',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })

  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(filter.toLowerCase()) ||
      o.email.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAddressSelect = (addr: AddressData) => {
    // Detect country based on address
    const mappedCountry =
      addr.country === 'Brazil'
        ? 'BR'
        : addr.country === 'Spain'
          ? 'ES'
          : addr.country === 'USA'
            ? 'US'
            : newOwner.country

    setNewOwner((prev) => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: applyZipCodeMask(addr.zipCode, mappedCountry),
      country: mappedCountry,
    }))
  }

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = applyZipCodeMask(e.target.value, newOwner.country)
    setNewOwner((prev) => ({ ...prev, zipCode: val }))
  }

  const handleAddOwner = () => {
    if (!newOwner.name || !newOwner.email) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }

    if (!isValidEmail(newOwner.email)) {
      toast({
        title: t('common.error'),
        description: 'Email inválido',
        variant: 'destructive',
      })
      return
    }

    if (
      newOwner.phone &&
      !isPhoneValid(newOwner.phone, newOwner.country as any)
    ) {
      toast({
        title: t('common.error'),
        description: `Número de telefone inválido para o país selecionado (${newOwner.country}). Certifique-se de que está completo.`,
        variant: 'destructive',
      })
      return
    }

    addOwner({
      id: `owner-${Date.now()}`,
      name: newOwner.name,
      email: newOwner.email,
      phone: newOwner.phone,
      country: newOwner.country,
      address: newOwner.address,
      city: newOwner.city,
      state: newOwner.state,
      zipCode: newOwner.zipCode,
      status: 'active',
      role: 'property_owner',
    })

    toast({
      title: t('common.success'),
      description: t('owners.success_desc'),
    })
    setOpen(false)
    setNewOwner({
      name: '',
      email: '',
      phone: '',
      country: 'US',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    })
  }

  const getPropertyCount = (ownerId: string) => {
    return properties.filter((p) => p.ownerId === ownerId).length
  }

  const handleAction = (ownerName: string, action: string) => {
    toast({
      title: t('owners.workflow_started'),
      description: t('owners.workflow_desc', {
        action: action,
        name: ownerName,
      }),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {t('owners.title')}
          </h1>
          <p className="text-black font-medium">{t('owners.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 w-full md:w-auto">
              <Plus className="h-4 w-4" /> {t('owners.new_owner')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{t('owners.register_title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="text-black font-bold">
                  {t('common.country')}
                </Label>
                <Select
                  value={newOwner.country}
                  onValueChange={(val) =>
                    setNewOwner({ ...newOwner, country: val, zipCode: '' })
                  }
                >
                  <SelectTrigger className="text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States (USA)</SelectItem>
                    <SelectItem value="BR">Brazil (Brasil)</SelectItem>
                    <SelectItem value="ES">Spain (España)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label className="text-black font-bold">
                  {t('common.name')}
                </Label>
                <Input
                  value={newOwner.name}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, name: e.target.value })
                  }
                  placeholder="Ex: John Doe"
                  className="text-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-black font-bold">
                    {t('common.email')}
                  </Label>
                  <Input
                    value={newOwner.email}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, email: e.target.value })
                    }
                    placeholder="email@exemplo.com"
                    className="text-black"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-black font-bold">
                    {t('common.phone')}
                  </Label>
                  <PhoneInput
                    value={newOwner.phone}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, phone: e.target.value })
                    }
                    country={newOwner.country as any}
                    onCountryChange={(c) =>
                      setNewOwner({ ...newOwner, country: c })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-black font-bold">Address Search</Label>
                <AddressInput onAddressSelect={handleAddressSelect} />
              </div>
              <div className="grid gap-2">
                <Label className="text-black font-bold">Full Address</Label>
                <Input
                  value={newOwner.address}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, address: e.target.value })
                  }
                  className="text-black"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label className="text-black font-bold">City</Label>
                  <Input
                    value={newOwner.city}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, city: e.target.value })
                    }
                    className="text-black"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-black font-bold">State</Label>
                  <Input
                    value={newOwner.state}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, state: e.target.value })
                    }
                    className="text-black"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-black font-bold">Zip</Label>
                  <Input
                    value={newOwner.zipCode}
                    onChange={handleZipCodeChange}
                    placeholder={
                      newOwner.country === 'BR' ? '00000-000' : '00000'
                    }
                    className="text-black"
                  />
                </div>
              </div>
              <Button onClick={handleAddOwner} className="w-full bg-trust-blue">
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-black">
              {t('owners.base_title')}
            </CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-black" />
              <Input
                placeholder={t('owners.search_placeholder')}
                className="pl-8 w-full text-black bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white border-b border-slate-200">
                <TableHead className="font-bold text-black">
                  {t('common.name')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('owners.contact_details')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('owners.properties_count')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('common.status')}
                </TableHead>
                <TableHead className="text-right font-bold text-black">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-black font-medium"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOwners.map((owner) => (
                  <TableRow
                    key={owner.id}
                    className="bg-white hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <Link
                        to={`/owners/${owner.id}`}
                        className="hover:underline text-trust-blue font-bold text-black"
                      >
                        <DataMask>{owner.name}</DataMask>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-black font-medium">
                          <DataMask>{owner.email}</DataMask>
                        </span>
                        <span className="text-black text-xs flex items-center gap-1 font-medium">
                          <Phone className="h-3 w-3 text-black" />{' '}
                          <DataMask>{owner.phone}</DataMask>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="gap-1 cursor-pointer hover:bg-slate-200 text-black border-slate-300 font-bold"
                          >
                            <Building2 className="h-3 w-3 text-black" />
                            <DataMask>
                              {getPropertyCount(owner.id)}
                            </DataMask>{' '}
                            {t('owners.properties_count')}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 p-0 bg-white"
                          align="start"
                        >
                          <div className="p-2 font-bold border-b text-xs text-black">
                            Propriedades de <DataMask>{owner.name}</DataMask>
                          </div>
                          <div className="flex flex-col max-h-60 overflow-y-auto">
                            {properties
                              .filter((p) => p.ownerId === owner.id)
                              .map((p) => (
                                <Link
                                  key={p.id}
                                  to={`/properties/${p.id}`}
                                  className="px-3 py-2 text-sm text-black hover:bg-slate-100 transition-colors truncate block border-b last:border-0 font-medium"
                                >
                                  <DataMask>{p.name}</DataMask>
                                </Link>
                              ))}
                            {properties.filter((p) => p.ownerId === owner.id)
                              .length === 0 && (
                              <div className="p-3 text-sm text-center text-black">
                                {t('common.empty')}
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          owner.status === 'active' ? 'default' : 'secondary'
                        }
                        className="text-black border-slate-300 font-bold"
                      >
                        {t(`common.${owner.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/owners/${owner.id}`)}
                          title={t('common.details')}
                          className="text-black hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-black hover:bg-slate-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuLabel className="text-black font-bold">
                              {t('common.actions')}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              className="text-black font-medium hover:bg-slate-100"
                              onClick={() =>
                                navigate(`/messages?contactId=${owner.id}`)
                              }
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />{' '}
                              {t('common.messages')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-black font-medium hover:bg-slate-100"
                              onClick={() =>
                                handleAction(
                                  owner.name,
                                  t('owners.renew_contract'),
                                )
                              }
                            >
                              <FileText className="mr-2 h-4 w-4" />{' '}
                              {t('owners.renew_contract')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-black font-medium hover:bg-slate-100"
                              onClick={() => navigate(`/owners/${owner.id}`)}
                            >
                              {t('common.view')} {t('common.profile')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
