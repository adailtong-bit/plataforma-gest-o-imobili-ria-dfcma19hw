import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  MessageSquare,
  Star,
  Phone,
  Briefcase,
  Eye,
} from 'lucide-react'
import usePartnerStore from '@/stores/usePartnerStore'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Partner } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'
import { PhoneInput } from '@/components/ui/phone-input'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import { isValidEmail } from '@/lib/utils'

export default function Partners() {
  const { partners, addPartner } = usePartnerStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const [newPartner, setNewPartner] = useState<Partial<Partner>>({
    name: '',
    type: 'agent',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    zipCode: '',
    city: '',
    state: '',
    country: '',
    paymentInfo: { bankName: '', routingNumber: '', accountNumber: '' },
  })

  // Filter inactive partners by default in the main list, or show them visually distinct
  // For now, showing all but allowing filter
  const filteredPartners = partners.filter(
    (p) =>
      (p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.companyName?.toLowerCase().includes(filter.toLowerCase())) &&
      p.status === 'active',
  )

  const handleAddressSelect = (addr: AddressData) => {
    setNewPartner((prev) => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      country: addr.country,
    }))
  }

  const handleAddPartner = () => {
    if (!newPartner.name?.trim() || !newPartner.email?.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome e Email são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    if (!isValidEmail(newPartner.email)) {
      toast({
        title: 'Erro',
        description: 'Email inválido',
        variant: 'destructive',
      })
      return
    }

    addPartner({
      id: `partner-${Date.now()}`,
      name: newPartner.name || '',
      type: newPartner.type as 'agent' | 'cleaning' | 'maintenance',
      companyName: newPartner.companyName,
      email: newPartner.email,
      phone: newPartner.phone || '',
      address: newPartner.address,
      zipCode: newPartner.zipCode,
      city: newPartner.city,
      state: newPartner.state,
      country: newPartner.country,
      paymentInfo: newPartner.paymentInfo,
      status: 'active',
      rating: 5.0,
      role: 'partner',
      serviceRates: [],
    })

    toast({
      title: 'Sucesso',
      description: 'Parceiro registrado.',
    })
    setOpen(false)
    setNewPartner({
      name: '',
      type: 'agent',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      paymentInfo: { bankName: '', routingNumber: '', accountNumber: '' },
    })
  }

  const PartnerList = ({ list }: { list: Partner[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.length === 0 ? (
        <div className="col-span-full text-center py-10 text-muted-foreground">
          {t('partners.no_partners')}
        </div>
      ) : (
        list.map((partner) => (
          <Card key={partner.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                  <CardDescription>{partner.companyName}</CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {partner.rating}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="capitalize">
                    {t(`partners.${partner.type}`)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{partner.phone}</span>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageSquare className="h-4 w-4" />{' '}
                    {t('tenants.send_message')}
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-trust-blue"
                    onClick={() => navigate(`/partners/${partner.id}`)}
                  >
                    <Eye className="h-4 w-4" /> {t('common.details')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('partners.title')}
          </h1>
          <p className="text-muted-foreground">{t('partners.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('partners.new_partner')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{t('partners.register_title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    {t('partners.contact_name')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={newPartner.name}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, name: e.target.value })
                    }
                    placeholder="Ex: Maria Silva"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('partners.company_name')}</Label>
                  <Input
                    value={newPartner.companyName}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="Ex: Silva Services LLC"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{t('partners.category')}</Label>
                <Select
                  value={newPartner.type}
                  onValueChange={(val: any) =>
                    setNewPartner({ ...newPartner, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">{t('partners.agent')}</SelectItem>
                    <SelectItem value="cleaning">
                      {t('partners.cleaning')}
                    </SelectItem>
                    <SelectItem value="maintenance">
                      {t('partners.maintenance')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    {t('common.email')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={newPartner.email}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, email: e.target.value })
                    }
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.phone')}</Label>
                  <PhoneInput
                    value={newPartner.phone || ''}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Buscar Endereço</Label>
                <AddressInput onAddressSelect={handleAddressSelect} />
              </div>

              <div className="grid gap-2">
                <Label>{t('common.address')}</Label>
                <Input
                  value={newPartner.address}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, address: e.target.value })
                  }
                  placeholder="Address Line 1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label>Cidade</Label>
                  <Input
                    value={newPartner.city}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, city: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Input
                    value={newPartner.state}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, state: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>CEP / ZIP</Label>
                  <Input
                    value={newPartner.zipCode}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, zipCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="border rounded-md p-3 space-y-3 bg-muted/20">
                <Label className="font-semibold">
                  {t('partners.bank_info')}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder={t('partners.bank_name')}
                    value={newPartner.paymentInfo?.bankName}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        paymentInfo: {
                          ...newPartner.paymentInfo!,
                          bankName: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder={t('partners.routing')}
                    value={newPartner.paymentInfo?.routingNumber}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        paymentInfo: {
                          ...newPartner.paymentInfo!,
                          routingNumber: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder={t('partners.account')}
                    value={newPartner.paymentInfo?.accountNumber}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        paymentInfo: {
                          ...newPartner.paymentInfo!,
                          accountNumber: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    placeholder="Zelle (Email/Phone)"
                    value={newPartner.paymentInfo?.zelle}
                    onChange={(e) =>
                      setNewPartner({
                        ...newPartner,
                        paymentInfo: {
                          ...newPartner.paymentInfo!,
                          zelle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleAddPartner}
                className="w-full bg-trust-blue"
              >
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('partners.search_placeholder')}
          className="pl-8"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
          <TabsTrigger value="agent">{t('partners.agent')}</TabsTrigger>
          <TabsTrigger value="cleaning">{t('partners.cleaning')}</TabsTrigger>
          <TabsTrigger value="maintenance">
            {t('partners.maintenance')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PartnerList list={filteredPartners} />
        </TabsContent>
        <TabsContent value="agent">
          <PartnerList
            list={filteredPartners.filter((p) => p.type === 'agent')}
          />
        </TabsContent>
        <TabsContent value="cleaning">
          <PartnerList
            list={filteredPartners.filter((p) => p.type === 'cleaning')}
          />
        </TabsContent>
        <TabsContent value="maintenance">
          <PartnerList
            list={filteredPartners.filter((p) => p.type === 'maintenance')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}


