import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Mail,
  Save,
  FileText,
  User,
  Edit,
  X,
  Home,
  FileIcon,
  CalendarDays,
  History,
  AlertTriangle,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { Tenant } from '@/lib/types'
import { Separator } from '@/components/ui/separator'

export default function TenantDetails() {
  const { id } = useParams()
  const { tenants, updateTenant } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const tenant = tenants.find((t) => t.id === id)
  const property = properties.find((p) => p.id === tenant?.propertyId)
  const owner = owners.find((o) => o.id === property?.ownerId)

  // Initialize form data with tenant data
  const [formData, setFormData] = useState<Tenant | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Sync formData when tenant changes (e.g. after updateTenant is called)
  useEffect(() => {
    if (tenant) {
      setFormData({ ...tenant })
    }
  }, [tenant])

  if (!formData || !tenant)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Tenant Not Found
      </div>
    )

  const handleSave = () => {
    updateTenant(formData)
    setIsEditing(false)
    toast({ title: 'Perfil atualizado com sucesso' })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleDocsUpdate = (docs: any) => {
    // Immediate persistence for documents
    const updatedTenant = { ...formData, documents: docs }
    setFormData(updatedTenant)
    updateTenant(updatedTenant)
  }

  const handleSendMessage = () => {
    navigate(`/messages?contactId=${formData.id}`)
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb / Relations */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border w-fit">
          <Link to="/tenants" className="hover:text-foreground">
            Inquilinos
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{formData.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/tenants">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-navy">
                {formData.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" /> {formData.email}
                <span className="text-muted-foreground/30">•</span>
                <Badge
                  variant={
                    formData.status === 'active' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {formData.status === 'active'
                    ? 'Ativo'
                    : formData.status === 'past'
                      ? 'Antigo'
                      : 'Prospecto'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-trust-blue"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSendMessage} variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" /> Mensagem
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="default"
                  size="sm"
                >
                  <Edit className="mr-2 h-4 w-4" /> Editar Dados
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Personal Info */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-trust-blue" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Dados cadastrais e contato do inquilino.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Nacionalidade / País</Label>
                    <Input
                      value={formData.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Ex: Estados Unidos"
                    />
                  </div>

                  <Separator className="md:col-span-2 my-2" />

                  <div className="grid gap-2">
                    <Label>ID / Passaporte</Label>
                    <Input
                      value={formData.idNumber || ''}
                      onChange={(e) => handleChange('idNumber', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Número do documento"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>SSN / Social Security</Label>
                    <Input
                      value={formData.socialSecurity || ''}
                      onChange={(e) =>
                        handleChange('socialSecurity', e.target.value)
                      }
                      disabled={!isEditing}
                      type="password"
                      placeholder="***-**-****"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />{' '}
                    Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Nome</Label>
                    <Input
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) =>
                        handleChange('emergencyContact', {
                          ...formData.emergencyContact,
                          name: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.emergencyContact?.phone || ''}
                      onChange={(e) =>
                        handleChange('emergencyContact', {
                          ...formData.emergencyContact,
                          phone: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Relação</Label>
                    <Input
                      value={formData.emergencyContact?.relation || ''}
                      onChange={(e) =>
                        handleChange('emergencyContact', {
                          ...formData.emergencyContact,
                          relation: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Ex: Pai, Irmão"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Property & Lease */}
            <div className="space-y-6">
              {property ? (
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-5 w-5 text-slate-500" /> Propriedade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Link
                        to={`/properties/${property.id}`}
                        className="font-semibold text-lg hover:underline text-primary"
                      >
                        {property.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {property.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {property.city}, {property.state}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Aluguel:</span>
                        <span className="font-medium">
                          ${formData.rentValue}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Início Contrato:
                        </span>
                        <span>
                          {formData.leaseStart
                            ? new Date(formData.leaseStart).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Fim Contrato:
                        </span>
                        <span className="font-semibold text-orange-600">
                          {formData.leaseEnd
                            ? new Date(formData.leaseEnd).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-muted/40 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Home className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-muted-foreground">
                      Nenhuma propriedade vinculada.
                    </p>
                  </CardContent>
                </Card>
              )}

              {owner && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Proprietário</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                      {owner.avatar ? (
                        <img src={owner.avatar} alt={owner.name} />
                      ) : (
                        <User className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/owners/${owner.id}`}
                        className="font-medium hover:underline block"
                      >
                        {owner.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {owner.email}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <DocumentVault
                documents={formData.documents || []}
                onUpdate={handleDocsUpdate}
                canEdit={true}
                title="Documentos do Inquilino"
                description="Gerencie contratos, identificações e comprovantes deste inquilino. Os arquivos são salvos automaticamente."
              />
            </div>
            <div className="md:col-span-1 space-y-4">
              <Card className="bg-blue-50 border-blue-100">
                <CardHeader>
                  <CardTitle className="text-sm text-blue-800">
                    Dica Rápida
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-blue-700">
                  Mantenha sempre uma cópia digital do contrato assinado e ID
                  atualizado. Isso facilita renovações e auditorias.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Total Arquivos:</span>
                    <span className="font-medium">
                      {formData.documents?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Contratos:</span>
                    <span className="font-medium">
                      {formData.documents?.filter(
                        (d) => d.category === 'Contract',
                      ).length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Histórico de Atividades
              </CardTitle>
              <CardDescription>
                Registro de negociações, renovações e alterações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mock Timeline */}
                <div className="relative border-l border-muted ml-3 space-y-6 pb-2">
                  {formData.negotiationLogs?.map((log, index) => (
                    <div key={index} className="ml-6 relative">
                      <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-background" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="font-semibold">{log.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.note}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        Por: {log.user}
                      </p>
                    </div>
                  ))}

                  {/* Static Entry for Lease Start */}
                  {formData.leaseStart && (
                    <div className="ml-6 relative">
                      <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-green-500 ring-4 ring-background" />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="font-semibold">Início do Contrato</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(formData.leaseStart).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Contrato iniciado com valor de ${formData.rentValue}.
                      </p>
                    </div>
                  )}

                  <div className="ml-6 relative">
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-slate-300 ring-4 ring-background" />
                    <p className="font-semibold text-slate-500">
                      Cadastro Criado
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
