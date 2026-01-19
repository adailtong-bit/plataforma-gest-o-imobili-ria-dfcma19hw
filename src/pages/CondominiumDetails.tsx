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
  FileText,
  Trash2,
  Edit,
  X,
  Plus,
  QrCode,
  Users,
} from 'lucide-react'
import useCondominiumStore from '@/stores/useCondominiumStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Condominium, CondoContact } from '@/lib/types'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function CondominiumDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { condominiums, updateCondominium } = useCondominiumStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const condo = condominiums.find((c) => c.id === id)
  const [formData, setFormData] = useState<Condominium | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Contacts State
  const [newContact, setNewContact] = useState<Partial<CondoContact>>({
    role: '',
    name: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    if (condo) {
      setFormData(JSON.parse(JSON.stringify(condo)))
    }
  }, [condo])

  if (!condo || !formData) return <div>Not Found</div>

  const handleSave = () => {
    if (!formData.name?.trim()) return
    updateCondominium(formData)
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
    handleChange(
      'address',
      `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`,
    )
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
    if (newContact.name && newContact.role) {
      const contact: CondoContact = {
        id: `cc-${Date.now()}`,
        name: newContact.name,
        role: newContact.role,
        phone: newContact.phone || '',
        email: newContact.email || '',
      }
      const contacts = [...(formData.contacts || []), contact]
      setFormData({ ...formData, contacts })
      setNewContact({ role: '', name: '', phone: '', email: '' })
    }
  }

  const removeContact = (id: string) => {
    const contacts = (formData.contacts || []).filter((c) => c.id !== id)
    setFormData({ ...formData, contacts })
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
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              {formData.name}
            </h1>
            <p className="text-muted-foreground">{formData.address}</p>
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
          <TabsTrigger value="access">
            {t('condominiums.access_credentials')}
          </TabsTrigger>
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="financial">
            {t('condominiums.financial_hoa')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{t('common.details')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('common.name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label>Buscar Endereço</Label>
                <AddressInput
                  onAddressSelect={handleAddressSelect}
                  defaultValue={formData.address}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>{t('common.description')}</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Credenciais de Acesso
              </CardTitle>
              <CardDescription>
                Gerencie senhas, gates e QR codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Main Gate (Carros)</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pedestrian Gate</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pool / Gym / Amenities</Label>
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
                  />
                </div>
                <div className="space-y-2">
                  <Label>QR Code URL (Link)</Label>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Contatos Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="flex gap-2 mb-6 items-end border p-4 rounded-md bg-muted/20">
                  <div className="grid gap-2 w-1/4">
                    <Label>Função</Label>
                    <Select
                      onValueChange={(v) =>
                        setNewContact({ ...newContact, role: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager/Síndico</SelectItem>
                        <SelectItem value="Service Desk">
                          Service Desk
                        </SelectItem>
                        <SelectItem value="Maintenance">Manutenção</SelectItem>
                        <SelectItem value="Security">Segurança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 w-1/4">
                    <Label>Nome</Label>
                    <Input
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2 w-1/4">
                    <Label>Telefone</Label>
                    <Input
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2 w-1/4">
                    <Label>Email</Label>
                    <Input
                      onChange={(e) =>
                        setNewContact({ ...newContact, email: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={addContact} className="bg-trust-blue">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Função</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    {isEditing && <TableHead>Ação</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.contacts?.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.role}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>{c.email}</TableCell>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Integração Financeira
              </CardTitle>
              <CardDescription>
                Valores configurados aqui serão espelhados nas propriedades.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('properties.hoa_fee')}</Label>
                <Input
                  type="number"
                  value={formData.hoaFee || ''}
                  onChange={(e) =>
                    handleChange('hoaFee', parseFloat(e.target.value))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('properties.hoa_freq')}</Label>
                <Select
                  value={formData.hoaFrequency || 'monthly'}
                  onValueChange={(val) => handleChange('hoaFrequency', val)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
