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
  Home,
  Phone,
  FileText,
  Mail,
  MessageCircle,
  Eye,
  AlertCircle,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { PhoneInput } from '@/components/ui/phone-input'
import { format, differenceInDays } from 'date-fns'

export default function Tenants() {
  const { tenants, addTenant } = useTenantStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    rentValue: '',
    propertyId: '',
    leaseStart: '',
    leaseEnd: '',
  })

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.email.toLowerCase().includes(filter.toLowerCase()),
  )

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleAddTenant = () => {
    if (!newTenant.name || !newTenant.email) {
      toast({
        title: t('tenants.error_title'),
        description: t('tenants.error_desc'),
        variant: 'destructive',
      })
      return
    }

    if (!validateEmail(newTenant.email)) {
      toast({
        title: t('tenants.error_title'),
        description: 'Email inválido',
        variant: 'destructive',
      })
      return
    }

    addTenant({
      id: `tenant-${Date.now()}`,
      name: newTenant.name,
      email: newTenant.email,
      phone: newTenant.phone,
      rentValue: parseFloat(newTenant.rentValue) || 0,
      propertyId: newTenant.propertyId,
      leaseStart: newTenant.leaseStart,
      leaseEnd: newTenant.leaseEnd,
      status: 'active',
      role: 'tenant',
    })

    toast({
      title: t('tenants.success_title'),
      description: t('tenants.success_desc'),
    })
    setOpen(false)
    setNewTenant({
      name: '',
      email: '',
      phone: '',
      rentValue: '',
      propertyId: '',
      leaseStart: '',
      leaseEnd: '',
    })
  }

  const getPropertyName = (id?: string) => {
    const prop = properties.find((p) => p.id === id)
    return prop ? prop.name : t('properties.not_assigned')
  }

  const generateLease = (tenantId: string) => {
    toast({
      title: 'Contrato Gerado',
      description: `O contrato de locação para o inquilino foi gerado e baixado.`,
    })
  }

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    } else {
      toast({
        title: t('common.error'),
        description: 'Telefone inválido',
        variant: 'destructive',
      })
    }
  }

  const handleEmail = (email: string) => {
    if (email) {
      window.location.href = `mailto:${email}`
    } else {
      toast({
        title: t('common.error'),
        description: 'Email inválido',
        variant: 'destructive',
      })
    }
  }

  const getContractStatus = (leaseEnd?: string) => {
    if (!leaseEnd) return null
    const days = differenceInDays(new Date(leaseEnd), new Date())
    if (days < 0) return <Badge variant="destructive">Expirado</Badge>
    if (days < 90)
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-700 hover:bg-red-200"
        >
          Renovação ({days}d)
        </Badge>
      )
    return (
      <span className="text-xs text-muted-foreground">
        Vence em {days} dias
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('tenants.title')}
          </h1>
          <p className="text-muted-foreground">{t('tenants.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('tenants.new_tenant')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('tenants.register_title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('common.name')}</Label>
                <Input
                  value={newTenant.name}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, name: e.target.value })
                  }
                  placeholder="Ex: Michael Scott"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('common.email')}</Label>
                  <Input
                    value={newTenant.email}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, email: e.target.value })
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.phone')}</Label>
                  <PhoneInput
                    value={newTenant.phone}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>{t('tenants.property')}</Label>
                <Select
                  value={newTenant.propertyId}
                  onValueChange={(val) =>
                    setNewTenant({ ...newTenant, propertyId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('tenants.rent_value')} ($)</Label>
                <Input
                  type="number"
                  value={newTenant.rentValue}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, rentValue: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Início do Contrato</Label>
                  <Input
                    type="date"
                    value={newTenant.leaseStart}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, leaseStart: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Fim do Contrato</Label>
                  <Input
                    type="date"
                    value={newTenant.leaseEnd}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, leaseEnd: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleAddTenant}
                className="w-full bg-trust-blue"
              >
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>{t('tenants.list_title')}</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('tenants.search_placeholder')}
                className="pl-8"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('tenants.contact')}</TableHead>
                <TableHead>{t('tenants.property')}</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t('tenants.no_tenants')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell
                      className="font-medium cursor-pointer hover:underline text-trust-blue"
                      onClick={() => navigate(`/tenants/${tenant.id}`)}
                    >
                      {tenant.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{tenant.email}</span>
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {tenant.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        {getPropertyName(tenant.propertyId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">
                          {tenant.leaseEnd
                            ? format(new Date(tenant.leaseEnd), 'dd/MM/yyyy')
                            : '-'}
                        </span>
                        {getContractStatus(tenant.leaseEnd)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">
                        {t(`common.${tenant.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleWhatsApp(tenant.phone)}
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/messages?contactId=${tenant.id}`)
                          }
                          title={t('tenants.send_message')}
                        >
                          <MessageSquare className="h-4 w-4 text-trust-blue" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/tenants/${tenant.id}`)}
                          title="Detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
