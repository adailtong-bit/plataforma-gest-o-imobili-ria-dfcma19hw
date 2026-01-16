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
} from 'lucide-react'
import usePartnerStore from '@/stores/usePartnerStore'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Partner } from '@/lib/types'

export default function Partners() {
  const { partners, addPartner } = usePartnerStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const [newPartner, setNewPartner] = useState<{
    name: string
    type: 'agent' | 'cleaning' | 'maintenance'
    companyName: string
    email: string
    phone: string
  }>({
    name: '',
    type: 'agent',
    companyName: '',
    email: '',
    phone: '',
  })

  const filteredPartners = partners.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.companyName?.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.email) {
      toast({
        title: 'Erro',
        description: 'Nome e Email são obrigatórios',
        variant: 'destructive',
      })
      return
    }

    addPartner({
      id: `partner-${Date.now()}`,
      name: newPartner.name,
      type: newPartner.type,
      companyName: newPartner.companyName,
      email: newPartner.email,
      phone: newPartner.phone,
      status: 'active',
      rating: 5.0,
    })

    toast({ title: 'Sucesso', description: 'Parceiro registrado.' })
    setOpen(false)
    setNewPartner({
      name: '',
      type: 'agent',
      companyName: '',
      email: '',
      phone: '',
    })
  }

  const PartnerList = ({ list }: { list: Partner[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.length === 0 ? (
        <div className="col-span-full text-center py-10 text-muted-foreground">
          Nenhum parceiro encontrado nesta categoria.
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
                  <span className="capitalize">{partner.type}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{partner.phone}</span>
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageSquare className="h-4 w-4" /> Enviar Mensagem
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
            Parceiros & Serviços
          </h1>
          <p className="text-muted-foreground">
            Diretório de agentes, limpeza e manutenção.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> Novo Parceiro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Novo Parceiro</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome do Contato</Label>
                <Input
                  value={newPartner.name}
                  onChange={(e) =>
                    setNewPartner({ ...newPartner, name: e.target.value })
                  }
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div className="grid gap-2">
                <Label>Nome da Empresa (Opcional)</Label>
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
              <div className="grid gap-2">
                <Label>Categoria</Label>
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
                    <SelectItem value="agent">Agente Imobiliário</SelectItem>
                    <SelectItem value="cleaning">Limpeza</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={newPartner.email}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, email: e.target.value })
                    }
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input
                    value={newPartner.phone}
                    onChange={(e) =>
                      setNewPartner({ ...newPartner, phone: e.target.value })
                    }
                    placeholder="+1 (555) 0000"
                  />
                </div>
              </div>
              <Button onClick={handleAddPartner} className="w-full">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar parceiros..."
          className="pl-8"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="agent">Agentes</TabsTrigger>
          <TabsTrigger value="cleaning">Limpeza</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
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
