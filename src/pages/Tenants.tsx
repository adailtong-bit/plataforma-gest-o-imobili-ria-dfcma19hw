import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Plus, Search, MessageSquare, Home, Phone } from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export default function Tenants() {
  const { tenants, addTenant } = useTenantStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    rentValue: '',
    propertyId: '',
  })

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.email.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAddTenant = () => {
    if (!newTenant.name || !newTenant.email) {
      toast({
        title: 'Erro',
        description: 'Nome e Email são obrigatórios',
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
      status: 'active',
    })

    toast({ title: 'Sucesso', description: 'Inquilino registrado.' })
    setOpen(false)
    setNewTenant({
      name: '',
      email: '',
      phone: '',
      rentValue: '',
      propertyId: '',
    })
  }

  const getPropertyName = (id?: string) => {
    const prop = properties.find((p) => p.id === id)
    return prop ? prop.name : 'Não atribuído'
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Inquilinos
          </h1>
          <p className="text-muted-foreground">
            Gestão de locatários e contratos de aluguel.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> Novo Inquilino
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Novo Inquilino</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
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
                  <Label>Email</Label>
                  <Input
                    value={newTenant.email}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, email: e.target.value })
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input
                    value={newTenant.phone}
                    onChange={(e) =>
                      setNewTenant({ ...newTenant, phone: e.target.value })
                    }
                    placeholder="+1 (555) 0000"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Propriedade</Label>
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
                <Label>Valor do Aluguel ($)</Label>
                <Input
                  type="number"
                  value={newTenant.rentValue}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, rentValue: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <Button onClick={handleAddTenant} className="w-full">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Inquilinos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar inquilinos..."
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
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Propriedade</TableHead>
                <TableHead>Aluguel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhum inquilino encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
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
                    <TableCell>${tenant.rentValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50">
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/messages')}
                        title="Enviar Mensagem"
                      >
                        <MessageSquare className="h-4 w-4 text-trust-blue" />
                      </Button>
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
