import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  MapPin,
  Wifi,
  Key,
  FileText,
  Share2,
  Camera,
  User,
  Briefcase,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useAuthStore from '@/stores/useAuthStore'
import useMessageStore from '@/stores/useMessageStore'
import { canChat } from '@/lib/permissions'

export default function PropertyDetails() {
  const { id } = useParams()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { partners } = usePartnerStore()
  const { currentUser } = useAuthStore()
  const { startChat } = useMessageStore()
  const navigate = useNavigate()

  const property = properties.find((p) => p.id === id)

  if (!property)
    return (
      <div className="p-8">
        Propriedade não encontrada.{' '}
        <Link to="/properties" className="text-blue-500">
          Voltar
        </Link>
      </div>
    )

  const owner = owners.find((o) => o.id === property.ownerId)
  const agent = property.agentId
    ? partners.find((p) => p.id === property.agentId)
    : null

  // Simplified logic: If I'm a Property Owner, I want to contact the Manager
  // In a real app, we'd find the specific manager assigned to this property.
  // Here we'll default to the 'plat_manager'.
  const propertyManagerId = 'plat_manager'

  const handleContactManager = () => {
    startChat(propertyManagerId)
    navigate('/messages')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link to="/properties">
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 gap-1 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para lista
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              {property.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{property.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            {/* If Current User is Property Owner, show Contact Manager instead of Edit */}
            {currentUser.role === 'property_owner' ? (
              <Button
                className="bg-trust-blue gap-2"
                onClick={handleContactManager}
              >
                <MessageSquare className="h-4 w-4" /> Falar com Gestor
              </Button>
            ) : (
              <Button className="bg-trust-blue">Editar Propriedade</Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="access">Acesso & Wifi</TabsTrigger>
          <TabsTrigger value="gallery">Galeria</TabsTrigger>
          <TabsTrigger value="docs">Documentos</TabsTrigger>
          <TabsTrigger value="hoa">HOA & Regras</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Detalhes da Propriedade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-semibold">{property.type}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Quartos</p>
                    <p className="font-semibold">{property.bedrooms}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Banheiros</p>
                    <p className="font-semibold">{property.bathrooms}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="font-semibold">{property.guests} Pessoas</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Descrição</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Esta é uma propriedade premium localizada na comunidade de{' '}
                    {property.community}. Perfeita para famílias e grupos
                    grandes, oferecendo conforto e segurança. Completamente
                    mobiliada e equipada para estadias de curto e longo prazo.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" /> Proprietário
                    </h3>
                    {owner ? (
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border group hover:bg-muted/40 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {owner.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{owner.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {owner.email}
                          </p>
                        </div>
                        <Link to={`/owners/${owner.id}`}>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground border rounded-lg">
                        Não atribuído
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Realtor / Agente
                    </h3>
                    {agent ? (
                      <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.companyName}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground border rounded-lg">
                        Venda direta / Não informado
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Estado
                    </span>
                    <Badge
                      variant={
                        property.status === 'occupied' ? 'default' : 'secondary'
                      }
                    >
                      {property.status === 'occupied'
                        ? 'Ocupado'
                        : property.status === 'maintenance'
                          ? 'Manutenção'
                          : 'Vago'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Próximo Check-in
                    </span>
                    <span className="font-medium">12/06/2026</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Última Limpeza
                    </span>
                    <span className="font-medium">Há 2 dias</span>
                  </div>
                  <Separator />
                  <Button className="w-full" variant="outline">
                    Ver Calendário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Acesso e Wifi</CardTitle>
              <CardDescription>
                Informações sensíveis para hóspedes e staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Código da Porta (Smart Lock)
                  </p>
                  <p className="text-2xl font-bold tracking-widest">
                    {property.accessCode}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Copiar
                </Button>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <Wifi className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Rede Wifi / Senha
                  </p>
                  <p className="text-lg font-bold">{property.wifi}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 row-span-2 rounded-xl overflow-hidden shadow-sm h-[400px]">
                  <img
                    src={property.image}
                    className="w-full h-full object-cover"
                    alt="Main"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm h-[190px]">
                  <img
                    src="https://img.usecurling.com/p/400/300?q=bedroom"
                    className="w-full h-full object-cover"
                    alt="Room"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm h-[190px]">
                  <img
                    src="https://img.usecurling.com/p/400/300?q=kitchen"
                    className="w-full h-full object-cover"
                    alt="Kitchen"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm h-[190px]">
                  <img
                    src="https://img.usecurling.com/p/400/300?q=bathroom"
                    className="w-full h-full object-cover"
                    alt="Bath"
                  />
                </div>
                <div className="rounded-xl overflow-hidden shadow-sm h-[190px] bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                  <div className="text-center">
                    <Camera className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Adicionar Fotos
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Legais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  'Contrato de Gestão 2024.pdf',
                  'Apólice de Seguro.pdf',
                  'Escritura.pdf',
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span>{doc}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hoa">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Condomínio (HOA)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <h4 className="font-semibold mb-2">
                  Regras da Comunidade {property.community}
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Proibido estacionar na rua entre 2h e 6h.</li>
                  <li>Lixo deve ser colocado na lixeira fechada.</li>
                  <li>Silêncio após as 22h.</li>
                  <li>Acesso à piscina requer pulseira.</li>
                  <li>Multa por barulho excessivo: $150.</li>
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
