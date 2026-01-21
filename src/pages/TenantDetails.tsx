import { useState } from 'react'
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
  Phone,
  Save,
  FileText,
  User,
  Edit,
  X,
  Home,
  Building,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { Tenant } from '@/lib/types'

export default function TenantDetails() {
  const { id } = useParams()
  const { tenants } = useTenantStore()
  const { properties } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const tenant = tenants.find((t) => t.id === id)
  const property = properties.find((p) => p.id === tenant?.propertyId)
  const owner = owners.find((o) => o.id === property?.ownerId)

  const [formData, setFormData] = useState<Tenant | null>(
    tenant ? { ...tenant } : null,
  )
  const [isEditing, setIsEditing] = useState(false)

  if (!formData) return <div>Not Found</div>

  const handleSave = () => {
    // In real app, call updateTenant(formData)
    setIsEditing(false)
    toast({ title: 'Perfil atualizado com sucesso' })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleDocsUpdate = (docs: any) => {
    handleChange('documents', docs)
  }

  const handleGenerateContract = () => {
    toast({
      title: 'Contrato Gerado',
      description: `Contrato para o período ${formData.leaseStart} a ${formData.leaseEnd} com valor ${formData.rentValue}.`,
    })
  }

  const handleSendMessage = () => {
    navigate(`/messages?contactId=${formData.id}`)
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header with Traceability */}
      <div className="flex flex-col gap-4">
        {/* Relations Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border w-fit">
          <span className="font-medium">Vinculado a:</span>
          {property ? (
            <Link
              to={`/properties/${property.id}`}
              className="flex items-center gap-1 hover:text-blue-600 underline"
            >
              <Home className="h-3 w-3" /> {property.name}
            </Link>
          ) : (
            <span className="text-gray-400">Sem Propriedade</span>
          )}
          {owner && (
            <>
              <span>/</span>
              <Link
                to={`/owners/${owner.id}`}
                className="flex items-center gap-1 hover:text-blue-600 underline"
              >
                <User className="h-3 w-3" /> {owner.name} (Proprietário)
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tenants">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-navy">
                {formData.name}
              </h1>
              <p className="text-muted-foreground">{formData.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} variant="ghost">
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-trust-blue">
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSendMessage} variant="ghost">
                  <Mail className="mr-2 h-4 w-4" /> Mensagem
                </Button>
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
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
              <Label>ID Number / Passport</Label>
              <Input
                value={formData.idNumber || ''}
                onChange={(e) => handleChange('idNumber', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label>Driver License</Label>
              <Input
                value={formData.driverLicense || ''}
                onChange={(e) => handleChange('driverLicense', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label>SSN / Social</Label>
              <Input
                value={formData.socialSecurity || ''}
                onChange={(e) => handleChange('socialSecurity', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Referências</Label>
              <Textarea
                value={formData.references || ''}
                onChange={(e) => handleChange('references', e.target.value)}
                disabled={!isEditing}
                placeholder="Contatos de referência..."
              />
            </div>

            <div className="md:col-span-2 pt-4 border-t">
              <h3 className="font-semibold mb-3">Contato de Emergência</h3>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Nome"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) =>
                    handleChange('emergencyContact', {
                      ...formData.emergencyContact,
                      name: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Telefone"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) =>
                    handleChange('emergencyContact', {
                      ...formData.emergencyContact,
                      phone: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
                <Input
                  placeholder="Relação (Ex: Pai)"
                  value={formData.emergencyContact?.relation || ''}
                  onChange={(e) =>
                    handleChange('emergencyContact', {
                      ...formData.emergencyContact,
                      relation: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {property && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                  <Home className="h-5 w-5" /> Propriedade Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p
                    className="font-medium text-lg hover:underline cursor-pointer"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    {property.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {property.address}
                  </p>
                  <div className="pt-2 border-t border-blue-200 mt-2">
                    <div className="flex justify-between text-sm">
                      <span>Aluguel:</span>
                      <span className="font-bold">${formData.rentValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fim Contrato:</span>
                      <span className="font-bold text-red-600">
                        {formData.leaseEnd}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4 bg-white text-blue-700 border-blue-200 hover:bg-blue-100"
                    variant="outline"
                    onClick={handleGenerateContract}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Gerar Contrato
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <DocumentVault
            documents={formData.documents || []}
            onUpdate={handleDocsUpdate}
            canEdit={true}
            title="Documentos"
            description="Contratos, IDs e comprovantes."
          />
        </div>
      </div>
    </div>
  )
}
