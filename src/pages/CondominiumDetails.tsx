import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Save,
  Lock,
  DollarSign,
  Trash2,
  Edit,
  X,
  Plus,
  QrCode,
  Users,
  MapPin,
} from 'lucide-react'
import useCondominiumStore from '@/stores/useCondominiumStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Condominium, CondoContact, HoaFeeHistory } from '@/lib/types'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  isValidEmail,
  isPhoneValid,
  applyZipCodeMask,
  isGenericOrPlaceholder,
} from '@/lib/utils'
import { DataMask } from '@/components/DataMask'
import { PhoneInput } from '@/components/ui/phone-input'
import { LocationMap } from '@/components/ui/location-map'

export default function CondominiumDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { condominiums, updateCondominium } = useCondominiumStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const condo = condominiums.find((c) => c.id === id)
  const [formData, setFormData] = useState<Condominium | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Explicit country state for validation logic
  const [selectedCountry, setSelectedCountry] = useState<'US' | 'BR' | 'ES'>(
    'US',
  )
  const [newContactCountry, setNewContactCountry] = useState<
    'US' | 'BR' | 'ES'
  >('US')

  // Contacts State
  const [newContact, setNewContact] = useState<Partial<CondoContact>>({
    role: '',
    name: '',
    phone: '',
    email: '',
  })

  // Fee History State
  const [newFee, setNewFee] = useState<Partial<HoaFeeHistory>>({
    amount: 0,
    validFrom: '',
  })

  useEffect(() => {
    if (condo) {
      // Sync manager to contacts if missing (User Story Requirement)
      const hasManagerContact = condo.contacts?.some(
        (c) => c.role === 'Manager' && c.name === condo.managerName,
      )
      let contacts = [...(condo.contacts || [])]

      if (!hasManagerContact && condo.managerName) {
        contacts.push({
          id: `contact-mgr-${Date.now()}`,
          name: condo.managerName,
          role: 'Manager',
          phone: condo.managerPhone || '',
          email: condo.managerEmail || '',
        })
      }

      setFormData({ ...condo, contacts })
      if (condo.country) {
        // Safe cast as we assume valid data or default fallback
        setSelectedCountry(condo.country as any)
      }
    }
  }, [condo])

  if (!condo || !formData) return <div>Not Found</div>

  const handleSave = () => {
    if (!formData.name?.trim()) return

    if (isGenericOrPlaceholder(formData.name)) {
      toast({
        title: t('common.error'),
        description: 'Invalid name.',
        variant: 'destructive',
      })
      return
    }

    // Validate manager phone if present
    if (
      formData.managerPhone &&
      !isPhoneValid(formData.managerPhone, selectedCountry)
    ) {
      toast({
        title: t('common.error'),
        description: `Invalid phone for ${selectedCountry}.`,
        variant: 'destructive',
      })
      return
    }

    if (formData.zipCode && isGenericOrPlaceholder(formData.zipCode)) {
      toast({
        title: t('common.error'),
        description: 'Invalid Zip Code.',
        variant: 'destructive',
      })
      return
    }

    updateCondominium({ ...formData, country: selectedCountry })
    setIsEditing(false)
    toast({
      title: t('common.save'),
      description: 'Dados do condomínio atualizados.',
    })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleAddressSelect = (addr: AddressData) => {
    const mappedCountry =
      addr.country === 'Brazil'
        ? 'BR'
        : addr.country === 'Spain'
          ? 'ES'
          : addr.country === 'USA'
            ? 'US'
            : selectedCountry

    setSelectedCountry(mappedCountry)

    setFormData((prev: any) => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: applyZipCodeMask(addr.zipCode, mappedCountry),
    }))
  }

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = applyZipCodeMask(e.target.value, selectedCountry)
    setFormData((prev: any) => ({ ...prev, zipCode: val }))
  }

  const handleNestedChange = (
    parent: 'accessCredentials',
    field: string,
    value: string,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }

  const addContact = () => {
    if (!newContact.name || !newContact.role) {
      toast({
        title: 'Erro',
        description: 'Nome e Função são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    if (newContact.email && !isValidEmail(newContact.email)) {
      toast({
        title: 'Erro',
        description: 'Email inválido',
        variant: 'destructive',
      })
      return
    }

    if (
      newContact.phone &&
      !isPhoneValid(newContact.phone, newContactCountry)
    ) {
      toast({
        title: 'Erro',
        description: `Invalid phone for ${newContactCountry}.`,
        variant: 'destructive',
      })
      return
    }

    const contact: CondoContact = {
      id: `cc-${Date.now()}`,
      name: newContact.name!,
      role: newContact.role!,
      phone: newContact.phone || '',
      email: newContact.email || '',
    }
    const contacts = [...(formData.contacts || []), contact]
    setFormData({ ...formData, contacts })
    setNewContact({ role: '', name: '', phone: '', email: '' })
    setNewContactCountry('US')
  }

  const removeContact = (id: string) => {
    const contacts = (formData.contacts || []).filter((c) => c.id !== id)
    setFormData({ ...formData, contacts })
  }

  const addFeeHistory = () => {
    if (!newFee.amount || !newFee.validFrom) return

    const historyItem: HoaFeeHistory = {
      id: `fh-${Date.now()}`,
      amount: Number(newFee.amount),
      validFrom: newFee.validFrom!,
      validTo: newFee.validTo,
    }

    setFormData({
      ...formData,
      feeHistory: [...(formData.feeHistory || []), historyItem],
    })
    setNewFee({ amount: 0, validFrom: '', validTo: '' })
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/condominiums">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {formData.name}
            </h1>
            <p className="text-slate-950 font-medium">{formData.address}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="gap-2"
            >
              <Edit className="h-4 w-4" /> {t('common.edit')}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="ghost"
                className="gap-2"
              >
                <X className="h-4 w-4" /> {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue gap-2">
                <Save className="h-4 w-4" /> {t('common.save')}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="h-4 w-4 mr-2" /> Location Map
          </TabsTrigger>
          <TabsTrigger value="access">
            {t('condominiums.access_credentials')}
          </TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="financial">
            {t('condominiums.financial_hoa')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-slate-950">
                {t('common.details')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country Field First */}
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">
                  {t('common.country')}
                </Label>
                <Select
                  value={selectedCountry}
                  onValueChange={(val: any) => setSelectedCountry(val)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-black font-medium">
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
                <Label className="text-slate-900 font-bold">
                  {t('common.name')}
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="text-black font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">
                  Buscar Endereço
                </Label>
                <AddressInput
                  onAddressSelect={handleAddressSelect}
                  defaultValue={formData.address}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">Endereço</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!isEditing}
                  className="text-black font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">Cidade</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!isEditing}
                  className="text-black font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">Estado</Label>
                <Input
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  disabled={!isEditing}
                  className="text-black font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">CEP / ZIP</Label>
                <Input
                  value={formData.zipCode || ''}
                  onChange={handleZipCodeChange}
                  disabled={!isEditing}
                  className="text-black font-medium"
                  placeholder={selectedCountry === 'BR' ? '00000-000' : '00000'}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">
                  {t('condominiums.manager')}
                </Label>
                <Input
                  value={formData.managerName || ''}
                  onChange={(e) => handleChange('managerName', e.target.value)}
                  disabled={!isEditing}
                  className="text-black font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">
                  {t('common.phone')}
                </Label>
                {/* Data masking for manager phone in overview */}
                {isEditing ? (
                  <PhoneInput
                    value={formData.managerPhone || ''}
                    onChange={(e) =>
                      handleChange('managerPhone', e.target.value)
                    }
                    country={selectedCountry}
                    onCountryChange={setSelectedCountry}
                  />
                ) : (
                  <div className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <span className="text-black font-medium">
                      <DataMask>{formData.managerPhone}</DataMask>
                    </span>
                  </div>
                )}
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label className="text-slate-900 font-bold">
                  {t('common.description')}
                </Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={!isEditing}
                  className="text-black font-medium"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <LocationMap
            address={formData.address}
            city={formData.city}
            state={formData.state}
            zipCode={formData.zipCode}
            country={selectedCountry}
          />
        </TabsContent>

        <TabsContent value="access">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <Lock className="h-5 w-5" /> Credenciais de Acesso
              </CardTitle>
              <CardDescription className="text-slate-600">
                Gerencie senhas, gates e QR codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-bold">
                    Main Gate (Carros)
                  </Label>
                  <Input
                    value={formData.accessCredentials?.mainGateCar || ''}
                    onChange={(e) =>
                      handleNestedChange(
                        'accessCredentials',
                        'mainGateCar',
                        e.target.value,
                      )
                    }
                    placeholder="****"
                    disabled={!isEditing}
                    className="text-black font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-900 font-bold">
                    Pedestrian Gate
                  </Label>
                  <Input
                    value={formData.accessCredentials?.pedestrianGate || ''}
                    onChange={(e) =>
                      handleNestedChange(
                        'accessCredentials',
                        'pedestrianGate',
                        e.target.value,
                      )
                    }
                    placeholder="****"
                    disabled={!isEditing}
                    className="text-black font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-900 font-bold">
                    Amenities / Game Room / Water Park
                  </Label>
                  <Input
                    value={formData.accessCredentials?.poolCode || ''}
                    onChange={(e) =>
                      handleNestedChange(
                        'accessCredentials',
                        'poolCode',
                        e.target.value,
                      )
                    }
                    placeholder="****"
                    disabled={!isEditing}
                    className="text-black font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-900 font-bold">
                    QR Code URL (Link)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.accessCredentials?.qrCodeUrl || ''}
                      onChange={(e) =>
                        handleNestedChange(
                          'accessCredentials',
                          'qrCodeUrl',
                          e.target.value,
                        )
                      }
                      placeholder="https://..."
                      disabled={!isEditing}
                      className="text-black font-medium"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      title="Gerar QR"
                      disabled={!isEditing}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <Users className="h-5 w-5" /> Contatos Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="flex flex-col gap-2 mb-6 border p-4 rounded-md bg-white">
                  <h4 className="font-bold text-sm text-slate-950">
                    Novo Contato
                  </h4>
                  <div className="flex gap-2 items-end flex-wrap">
                    <div className="grid gap-2 w-full md:w-1/5">
                      <Label className="font-bold">Função</Label>
                      <Select
                        value={newContact.role}
                        onValueChange={(v) =>
                          setNewContact({ ...newContact, role: v })
                        }
                      >
                        <SelectTrigger className="text-black">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manager">
                            Manager/Síndico
                          </SelectItem>
                          <SelectItem value="Service Desk">
                            Service Desk
                          </SelectItem>
                          <SelectItem value="Maintenance">
                            Manutenção
                          </SelectItem>
                          <SelectItem value="Security">Segurança</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2 w-full md:w-1/5">
                      <Label className="font-bold">Nome</Label>
                      <Input
                        value={newContact.name}
                        onChange={(e) =>
                          setNewContact({ ...newContact, name: e.target.value })
                        }
                        className="text-black"
                      />
                    </div>
                    <div className="grid gap-2 w-full md:w-1/4">
                      <Label className="font-bold">Telefone</Label>
                      <PhoneInput
                        value={newContact.phone || ''}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            phone: e.target.value,
                          })
                        }
                        country={newContactCountry}
                        onCountryChange={setNewContactCountry}
                      />
                    </div>
                    <div className="grid gap-2 w-full md:w-1/4">
                      <Label className="font-bold">Email</Label>
                      <Input
                        value={newContact.email}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            email: e.target.value,
                          })
                        }
                        className="text-black"
                      />
                    </div>
                    <Button onClick={addContact} className="bg-trust-blue">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-black">
                      Função
                    </TableHead>
                    <TableHead className="font-bold text-black">Nome</TableHead>
                    <TableHead className="font-bold text-black">
                      Telefone
                    </TableHead>
                    <TableHead className="font-bold text-black">
                      Email
                    </TableHead>
                    {isEditing && (
                      <TableHead className="font-bold text-black">
                        Ação
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.contacts?.map((c) => (
                    <TableRow key={c.id} className="bg-white hover:bg-slate-50">
                      <TableCell className="font-bold text-slate-950">
                        {c.role}
                      </TableCell>
                      <TableCell className="text-slate-950 font-medium">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-slate-950 font-medium">
                        {c.phone}
                      </TableCell>
                      <TableCell className="text-slate-950 font-medium">
                        {c.email}
                      </TableCell>
                      {isEditing && (
                        <TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <DollarSign className="h-5 w-5" /> Integração Financeira
              </CardTitle>
              <CardDescription className="text-slate-600">
                Valores configurados aqui serão espelhados nas propriedades.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">
                  {t('properties.hoa_fee')} (Atual)
                </Label>
                <Input
                  type="number"
                  value={formData.hoaFee || ''}
                  onChange={(e) =>
                    handleChange('hoaFee', parseFloat(e.target.value))
                  }
                  disabled={!isEditing}
                  className="text-black font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-900 font-bold">
                  {t('properties.hoa_freq')}
                </Label>
                <Select
                  value={formData.hoaFrequency || 'monthly'}
                  onValueChange={(val) => handleChange('hoaFrequency', val)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="text-black font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      {t('properties.monthly')}
                    </SelectItem>
                    <SelectItem value="quarterly">
                      {t('properties.quarterly')}
                    </SelectItem>
                    <SelectItem value="annually">
                      {t('properties.annually')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 pt-6">
                <h3 className="font-bold mb-2 text-slate-950">
                  Histórico de Ajustes
                </h3>
                {isEditing && (
                  <div className="flex gap-2 items-end mb-4 border p-2 rounded bg-white">
                    <div className="grid gap-2">
                      <Label className="font-bold">Valor ($)</Label>
                      <Input
                        type="number"
                        value={newFee.amount}
                        onChange={(e) =>
                          setNewFee({
                            ...newFee,
                            amount: Number(e.target.value),
                          })
                        }
                        className="text-black"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-bold">Válido De</Label>
                      <Input
                        type="date"
                        value={newFee.validFrom}
                        onChange={(e) =>
                          setNewFee({ ...newFee, validFrom: e.target.value })
                        }
                        className="text-black"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-bold">Válido Até</Label>
                      <Input
                        type="date"
                        value={newFee.validTo || ''}
                        onChange={(e) =>
                          setNewFee({ ...newFee, validTo: e.target.value })
                        }
                        className="text-black"
                      />
                    </div>
                    <Button onClick={addFeeHistory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold text-black">
                        Valor
                      </TableHead>
                      <TableHead className="font-bold text-black">De</TableHead>
                      <TableHead className="font-bold text-black">
                        Até
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.feeHistory?.map((fh) => (
                      <TableRow
                        key={fh.id}
                        className="bg-white hover:bg-slate-50"
                      >
                        <TableCell className="text-slate-950 font-bold">
                          ${fh.amount}
                        </TableCell>
                        <TableCell className="text-slate-950 font-medium">
                          {fh.validFrom}
                        </TableCell>
                        <TableCell className="text-slate-950 font-medium">
                          {fh.validTo || 'Atual'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!formData.feeHistory ||
                      formData.feeHistory.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-slate-500"
                        >
                          Sem histórico.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
