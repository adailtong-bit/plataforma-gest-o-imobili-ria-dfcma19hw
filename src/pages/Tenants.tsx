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
  MessageCircle,
  Eye,
  Calendar,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
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
import { Label } from '@/components/ui/label'

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

  const handleAddTenant = () => {
    // Basic Add logic (simplified for list view focus)
    if (!newTenant.name) return
    addTenant({
      id: `t-${Date.now()}`,
      ...newTenant,
      rentValue: parseFloat(newTenant.rentValue),
      status: 'active',
      role: 'tenant',
    } as any)
    setOpen(false)
    toast({ title: 'Tenant added' })
  }

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone) window.open(`https://wa.me/${cleanPhone}`, '_blank')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('tenants.title')}
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('tenants.new_tenant')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('tenants.register_title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Name"
                value={newTenant.name}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, name: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                value={newTenant.email}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, email: e.target.value })
                }
              />
              <Button onClick={handleAddTenant}>Save</Button>
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
