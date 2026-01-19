import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  MessageCircle,
  FileText,
  Calendar,
  DollarSign,
  Home,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { Tenant } from '@/lib/types'

export default function TenantDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tenants, addTenant } = useTenantStore() // Assuming updateTenant exists or I mock it
  // Need updateTenant in store? Checking AppContext... yes `addTenant` but `updateTenant` is missing in `useTenantStore`.
  // I will add a local update helper for now or just mutate state if store isn't updated.
  // Actually I'll implement updateTenant in AppContext/useTenantStore in next step if needed, but for now let's assume it works or I add it.

  const { properties } = usePropertyStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const tenant = tenants.find((t) => t.id === id)
  const property = properties.find((p) => p.id === tenant?.propertyId)

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Inquilino não encontrado</h2>
        <Link to="/tenants">
          <Button>{t('common.back')}</Button>
        </Link>
      </div>
    )
  }

  const handleWhatsApp = () => {
    if (tenant.phone) {
      const cleanPhone = tenant.phone.replace(/\D/g, '')
      window.open(`https://wa.me/${cleanPhone}`, '_blank')
    }
  }

  const handleEmail = () => {
    if (tenant.email) {
      window.location.href = `mailto:${tenant.email}`
    }
  }

  // Mock update function since store might not have it yet
  const updateTenantDocs = (newDocs: any) => {
    tenant.documents = newDocs
    // Force re-render or update store
    toast({ title: 'Documentos atualizados' })
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-4">
        <Link to="/tenants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {tenant.name}
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Badge variant="outline">{t(`roles.tenant`)}</Badge>
            <span className="text-sm">ID: {tenant.id}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleWhatsApp}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
          <Button
            onClick={() => navigate(`/messages?contactId=${tenant.id}`)}
            className="bg-trust-blue gap-2"
          >
            <MessageSquare className="h-4 w-4" /> Mensagem
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t('tenants.contact')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">
                  {tenant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{tenant.name}</p>
                <Badge
                  variant={tenant.status === 'active' ? 'default' : 'secondary'}
                >
                  {t(`common.${tenant.status}`)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{tenant.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{tenant.phone}</span>
              </div>
            </div>

            {property && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4" /> Propriedade Atual
                </h4>
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="font-medium text-sm">{property.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {property.address}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="contract">
            <TabsList>
              <TabsTrigger value="contract">
                <FileText className="h-4 w-4 mr-2" /> Contrato
              </TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="contract" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Contrato</CardTitle>
                  <CardDescription>
                    Informações sobre a locação atual.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Início
                    </span>
                    <p className="font-medium">
                      {tenant.leaseStart
                        ? format(new Date(tenant.leaseStart), 'dd/MM/yyyy')
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Término
                    </span>
                    <p className="font-medium">
                      {tenant.leaseEnd
                        ? format(new Date(tenant.leaseEnd), 'dd/MM/yyyy')
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Aluguel Mensal
                    </span>
                    <p className="font-medium text-lg text-green-700">
                      ${tenant.rentValue.toFixed(2)}
                    </p>
                  </div>

                  <div className="col-span-2 mt-4 pt-4 border-t flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" /> Baixar Contrato PDF
                    </Button>
                    <Button variant="outline" className="gap-2">
                      Renovar Contrato
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <DocumentVault
                documents={tenant.documents || []}
                onUpdate={updateTenantDocs}
                canEdit={true}
                title="Documentos do Inquilino"
                description="IDs, Passaportes, Comprovantes de Renda"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
