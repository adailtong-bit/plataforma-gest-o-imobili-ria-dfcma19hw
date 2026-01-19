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
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { Tenant } from '@/lib/types'

export default function TenantDetails() {
  const { id } = useParams()
  const { tenants } = useTenantStore()
  const { properties } = usePropertyStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const tenant = tenants.find((t) => t.id === id)
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

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/tenants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {formData.name}
          </h1>
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
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="contract">Contrato & Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
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
                  onChange={(e) =>
                    handleChange('driverLicense', e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label>SSN / Social</Label>
                <Input
                  value={formData.socialSecurity || ''}
                  onChange={(e) =>
                    handleChange('socialSecurity', e.target.value)
                  }
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
        </TabsContent>

        <TabsContent value="contract">
          <DocumentVault
            documents={formData.documents || []}
            onUpdate={handleDocsUpdate}
            canEdit={true}
            title="Documentos & Contratos"
            description="Contratos assinados, IDs e comprovantes."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
