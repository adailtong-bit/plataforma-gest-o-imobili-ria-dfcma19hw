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
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  MessageSquare,
  Home,
  MessageCircle,
  Eye,
  Calendar,
  Download,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { isValidEmail } from '@/lib/utils'
import { PhoneInput } from '@/components/ui/phone-input'
import { Label } from '@/components/ui/label'
import { AddressInput, AddressData } from '@/components/ui/address-input'

export default function Tenants() {
  const { tenants, addTenant } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    rentValue: '',
    propertyId: '',
    leaseStart: '',
    leaseEnd: '',
    idNumber: '',
    passport: '',
    socialSecurity: '',
  })

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.email.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAddressSelect = (addr: AddressData) => {
    setNewTenant((prev) => ({
      ...prev,
      address: `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`,
    }))
  }

  const handleAddTenant = () => {
    if (!newTenant.name || !newTenant.email) {
      toast({
        title: 'Validation Error',
        description: 'Name and email are required.',
        variant: 'destructive',
      })
      return
    }

    if (!isValidEmail(newTenant.email)) {
      toast({
        title: 'Validation Error',
        description: 'Invalid email format.',
        variant: 'destructive',
      })
      return
    }

    if (!newTenant.phone || newTenant.phone.length < 10) {
      toast({
        title: 'Validation Error',
        description: 'Phone number is invalid or too short.',
        variant: 'destructive',
      })
      return
    }

    addTenant({
      id: `t-${Date.now()}`,
      ...newTenant,
      rentValue: parseFloat(newTenant.rentValue) || 0,
      status: 'active',
      role: 'tenant',
      referralContacts: [],
    } as any)
    setOpen(false)
    toast({ title: 'Tenant added' })
    setNewTenant({
      name: '',
      email: '',
      phone: '',
      address: '',
      rentValue: '',
      propertyId: '',
      leaseStart: '',
      leaseEnd: '',
      idNumber: '',
      passport: '',
      socialSecurity: '',
    })
  }

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone) window.open(`https://wa.me/${cleanPhone}`, '_blank')
  }

  const handleExportCSV = () => {
    const headers = [
      'Tenant ID',
      'Tenant Name',
      'Email',
      'Phone',
      'Address',
      'Property ID',
      'Property Name',
      'Owner ID',
      'Lease Start',
      'Lease End',
      'Recurring Value',
    ]

    const rows = filteredTenants.map((tenant) => {
      const property = properties.find((p) => p.id === tenant.propertyId)
      const owner = owners.find((o) => o.id === property?.ownerId)

      return [
        tenant.id,
        tenant.name,
        tenant.email,
        tenant.phone,
        tenant.address || 'N/A',
        tenant.propertyId || 'N/A',
        property?.name || 'N/A',
        owner?.id || 'N/A',
        tenant.leaseStart
          ? format(new Date(tenant.leaseStart), 'yyyy-MM-dd')
          : 'N/A',
        tenant.leaseEnd
          ? format(new Date(tenant.leaseEnd), 'yyyy-MM-dd')
          : 'N/A',
        tenant.rentValue.toFixed(2),
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `contracts_export_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Exportação Concluída',
      description: 'Arquivo CSV gerado com sucesso.',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('tenants.title')}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2">
                <Plus className="h-4 w-4" /> {t('tenants.new_tenant')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{t('tenants.register_title')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Full Name"
                      value={newTenant.name}
                      onChange={(e) =>
                        setNewTenant({ ...newTenant, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>ID / RG</Label>
                    <Input
                      placeholder="ID Number"
                      value={newTenant.idNumber}
                      onChange={(e) =>
                        setNewTenant({ ...newTenant, idNumber: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      placeholder="Email"
                      value={newTenant.email}
                      onChange={(e) =>
                        setNewTenant({ ...newTenant, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Phone</Label>
                    <PhoneInput
                      value={newTenant.phone}
                      onChange={(e) =>
                        setNewTenant({ ...newTenant, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Current Address</Label>
                  <AddressInput onAddressSelect={handleAddressSelect} />
                  <Input
                    placeholder="Full Address"
                    value={newTenant.address}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Passport</Label>
                    <Input
                      placeholder="Passport Number"
                      value={newTenant.passport}
                      onChange={(e) =>
                        setNewTenant({ ...newTenant, passport: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>SSN (Optional)</Label>
                    <Input
                      placeholder="XXX-XX-XXXX"
                      value={newTenant.socialSecurity}
                      onChange={(e) =>
                        setNewTenant({
                          ...newTenant,
                          socialSecurity: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleAddTenant} className="w-full">
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
                <TableHead>{t('tenants.property')}</TableHead>
                <TableHead>Contrato (Início - Fim)</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => {
                const prop = properties.find((p) => p.id === tenant.propertyId)
                return (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{tenant.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {tenant.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {prop ? (
                        <Link
                          to={`/properties/${prop.id}`}
                          className="flex items-center gap-2 hover:text-blue-600 hover:underline"
                        >
                          <Home className="h-4 w-4" />
                          {prop.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {tenant.leaseStart
                          ? format(new Date(tenant.leaseStart), 'dd/MM/yyyy')
                          : 'N/A'}{' '}
                        -{' '}
                        {tenant.leaseEnd
                          ? format(new Date(tenant.leaseEnd), 'dd/MM/yyyy')
                          : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tenant.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleWhatsApp(tenant.phone)}
                          className="text-green-600"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            navigate(`/messages?contactId=${tenant.id}`)
                          }
                          className="text-blue-600"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/tenants/${tenant.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

