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

export default function Owners() {
  const { owners, addOwner } = useOwnerStore()
  const { properties } = usePropertyStore()
  const navigate = useNavigate()
  const { toast } = useToast()
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

  const handleAddOwner = () => {
    if (!newOwner.name || !newOwner.email) {
      toast({
        title: 'Erro',
        description: 'Nome e Email são obrigatórios',
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
    })

    toast({ title: 'Sucesso', description: 'Proprietário registrado.' })
    setOpen(false)
    setNewOwner({ name: '', email: '', phone: '' })
  }

  const getPropertyCount = (ownerId: string) => {
    return properties.filter((p) => p.ownerId === ownerId).length
  }

  const handleAction = (ownerName: string, action: string) => {
    toast({
      title: 'Ação Iniciada',
      description: `Workflow: ${action} para ${ownerName}`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Proprietários
          </h1>
          <p className="text-muted-foreground">
            Gestão dos donos das propriedades (Landlords).
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> Novo Proprietário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Proprietário</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input
                  value={newOwner.name}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, name: e.target.value })
                  }
                  placeholder="Ex: John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  value={newOwner.email}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input
                  value={newOwner.phone}
                  onChange={(e) =>
                    setNewOwner({ ...newOwner, phone: e.target.value })
                  }
                  placeholder="+1 (555) 0000"
                />
              </div>
              <Button onClick={handleAddOwner} className="w-full">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Base de Proprietários</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proprietários..."
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
                <TableHead>Propriedades</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
                      <Badge variant="secondary" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {getPropertyCount(owner.id)} Imóveis
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          owner.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {owner.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/owners/${owner.id}`)}
                          title="Ver Detalhes"
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
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigate('/messages')}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />{' '}
                              Mensagem
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleAction(owner.name, 'Renovação')
                              }
                            >
                              <FileText className="mr-2 h-4 w-4" /> Renovar
                              Contrato
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => navigate(`/owners/${owner.id}`)}
                            >
                              Ver Perfil Completo
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
