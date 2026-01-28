import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Save,
  Edit,
  X,
  Download,
  Building,
  ClipboardList,
  MessageCircle,
} from 'lucide-react'
import useOwnerStore from '@/stores/useOwnerStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'
import { Owner, GenericDocument } from '@/lib/types'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { OwnerStatement } from '@/components/financial/OwnerStatement'
import { OwnerProperties } from '@/components/owners/OwnerProperties'
import { OwnerTasks } from '@/components/owners/OwnerTasks'

export default function OwnerDetails() {
  const { id } = useParams()
  const { owners, updateOwner } = useOwnerStore()
  const { properties } = usePropertyStore()
  const { ledgerEntries } = useFinancialStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Use useMemo to stabilize owner object selection
  const owner = useMemo(() => owners.find((o) => o.id === id), [owners, id])

  const [formData, setFormData] = useState<Owner | null>(
    owner ? { ...owner } : null,
  )
  const [isEditing, setIsEditing] = useState(false)

  // Sync formData when owner changes in store (e.g. from document update)
  useEffect(() => {
    if (owner) {
      setFormData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(owner)) {
          return prev
        }
        return { ...owner }
      })
    }
  }, [owner])

  if (!formData)
    return (
      <div className="p-10 text-center text-muted-foreground">
        Proprietário não encontrado.
      </div>
    )

  const handleSave = () => {
    if (!formData) return
    updateOwner(formData)
    setIsEditing(false)
    toast({
      title: 'Proprietário atualizado',
      description: 'As informações foram salvas com sucesso.',
    })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleDocsUpdate = (docs: GenericDocument[]) => {
    const updatedOwner = { ...formData!, documents: docs }
    setFormData(updatedOwner)
    updateOwner(updatedOwner)
  }

  const handleMessageRedirect = () => {
    navigate(`/messages?contactId=${formData.id}`)
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/owners">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              {formData.name}
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={handleMessageRedirect}
              title="Message Owner"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
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
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="properties">
            <Building className="h-4 w-4 mr-2" /> Propriedades
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ClipboardList className="h-4 w-4 mr-2" /> Tarefas
          </TabsTrigger>
          <TabsTrigger value="financial">Extratos</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Proprietário</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
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
                <Label>Endereço Completo</Label>
                <Input
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Street, City, State, ZIP"
                />
              </div>
              <div className="grid gap-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label>Estado</Label>
                <Input
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label>CEP / Zip</Label>
                <Input
                  value={formData.zipCode || ''}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label>País</Label>
                <Input
                  value={formData.country || ''}
                  onChange={(e) => handleChange('country', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Link Contrato de Gestão (PM Agreement)</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.pmAgreementUrl || ''}
                    onChange={(e) =>
                      handleChange('pmAgreementUrl', e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="https://..."
                  />
                  {formData.pmAgreementUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a
                        href={formData.pmAgreementUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t">
                <h3 className="font-semibold mb-3">Segundo Contato</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Nome"
                    value={formData.secondContact?.name || ''}
                    onChange={(e) =>
                      handleChange('secondContact', {
                        ...formData.secondContact,
                        name: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Input
                    placeholder="Telefone"
                    value={formData.secondContact?.phone || ''}
                    onChange={(e) =>
                      handleChange('secondContact', {
                        ...formData.secondContact,
                        phone: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                  <Input
                    placeholder="Email"
                    value={formData.secondContact?.email || ''}
                    onChange={(e) =>
                      handleChange('secondContact', {
                        ...formData.secondContact,
                        email: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties">
          <OwnerProperties ownerId={formData.id} properties={properties} />
        </TabsContent>

        <TabsContent value="tasks">
          <OwnerTasks ownerId={formData.id} properties={properties} />
        </TabsContent>

        <TabsContent value="financial">
          <OwnerStatement
            ownerId={formData.id}
            properties={properties}
            ledgerEntries={ledgerEntries}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentVault
            documents={formData.documents || []}
            onUpdate={handleDocsUpdate}
            canEdit={true}
            title="Documentos Pessoais"
            description="IDs, Passaportes, Procurações e outros documentos do proprietário."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
