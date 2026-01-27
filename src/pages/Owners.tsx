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
  })

  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(filter.toLowerCase()) ||
      o.email.toLowerCase().includes(filter.toLowerCase()),
  )

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleAddOwner = () => {
    if (!newOwner.name || !newOwner.email) {
      toast({
        title: t('tenants.error_title'),
        description: t('tenants.error_desc'),
        variant: 'destructive',
      })
      return
    }

    if (!validateEmail(newOwner.email)) {
      toast({
        title: t('tenants.error_title'),
        description: 'Email inválido',
        variant: 'destructive',
      })
      return
    }

    addOwner({
      id: `owner-${Date.now()}`,
      name: newOwner.name,
      email: newOwner.email,
      phone: newOwner.phone,
      status: 'active',
      role: 'property_owner',
    })

    toast({
      title: t('tenants.success_title'),
      description: t('owners.success_desc') || 'Owner registered.',
    })
    setOpen(false)
    setNewOwner({ name: '', email: '', phone: '' })
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
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('owners.title')}
          </h1>
          <p className="text-muted-foreground">{t('owners.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 w-full md:w-auto">
              <Plus className="h-4 w-4" /> {t('owners.new_owner')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('owners.register_title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('common.name')}</Label>
                <Input
                  value={newOwner.name}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, name: e.target.value })
                  }
                  placeholder="Ex: John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('common.email')}</Label>
                <Input
                  value={newOwner.email}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('common.phone')}</Label>
                <PhoneInput
                  value={newOwner.phone}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, phone: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddOwner} className="w-full">
                {t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>{t('owners.base_title')}</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('owners.search_placeholder')}
                className="pl-8 w-full"
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
                <TableHead>{t('owners.contact_details')}</TableHead>
                <TableHead>{t('owners.properties_count')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOwners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Nenhum proprietário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/owners/${owner.id}`}
                        className="hover:underline text-trust-blue"
                      >
                        {owner.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{owner.email}</span>
                        <span className="text-muted-foreground text-xs flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {owner.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="gap-1 cursor-pointer hover:bg-secondary/80"
                          >
                            <Building2 className="h-3 w-3" />
                            {getPropertyCount(owner.id)}{' '}
                            {t('owners.properties_count')}
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="start">
                          <div className="p-2 font-medium border-b text-xs text-muted-foreground">
                            Propriedades de {owner.name}
                          </div>
                          <div className="flex flex-col max-h-60 overflow-y-auto">
                            {properties
                              .filter((p) => p.ownerId === owner.id)
                              .map((p) => (
                                <Link
                                  key={p.id}
                                  to={`/properties/${p.id}`}
                                  className="px-3 py-2 text-sm hover:bg-muted transition-colors truncate block border-b last:border-0"
                                >
                                  {p.name}
                                </Link>
                              ))}
                            {properties.filter((p) => p.ownerId === owner.id)
                              .length === 0 && (
                              <div className="p-3 text-sm text-center text-muted-foreground">
                                Nenhuma propriedade vinculada.
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {t('common.actions')}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/messages?contactId=${owner.id}`)
                              }
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />{' '}
                              {t('tenants.send_message')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
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
