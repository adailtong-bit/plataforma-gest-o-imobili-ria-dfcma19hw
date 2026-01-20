import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Edit, X, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Property } from '@/lib/types'

// Sub-components
import { PropertyOverview } from '@/components/properties/PropertyOverview'
import { PropertyLocation } from '@/components/properties/PropertyLocation'
import { PropertyFinancials } from '@/components/properties/PropertyFinancials'
import { PropertyMarketing } from '@/components/properties/PropertyMarketing'
import { PropertyContent } from '@/components/properties/PropertyContent'
import { DocumentVault } from '@/components/documents/DocumentVault'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { properties, updateProperty, deleteProperty } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { partners } = usePartnerStore()
  const { condominiums } = useCondominiumStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const property = properties.find((p) => p.id === id)
  const [formData, setFormData] = useState<Property | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (property) {
      setFormData(JSON.parse(JSON.stringify(property)))
    }
  }, [property])

  if (!property || !formData) return <div>Not Found</div>

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.address?.trim()) {
      toast({
        title: t('common.error'),
        description: 'Nome e Endereço são obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    // Check mandatory ZIP per user story
    if (!formData.zipCode?.trim()) {
      toast({
        title: 'Erro de Validação',
        description: 'O campo CEP/Zip Code é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    updateProperty(formData)
    setIsEditing(false)
    toast({
      title: t('common.save'),
      description: 'Propriedade atualizada com sucesso.',
    })
  }

  const handleDelete = () => {
    try {
      deleteProperty(property.id)
      toast({ title: 'Propriedade excluída' })
      navigate('/properties')
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description:
          error.message === 'error_active_tenant'
            ? t('common.delete_active_tenant_error')
            : 'Erro ao excluir.',
        variant: 'destructive',
      })
    }
  }

  const handleChange = (field: keyof Property, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (
    parent: keyof Property,
    key: string,
    value: any,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value },
    }))
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              {formData.name}
            </h1>
            <p className="text-muted-foreground">{formData.address}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-red-500">
                    <Trash2 className="h-4 w-4 mr-2" /> {t('common.delete')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('common.delete_title')}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('common.delete_desc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="gap-2"
              >
                <Edit className="h-4 w-4" /> {t('common.edit')}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setFormData(JSON.parse(JSON.stringify(property))) // Reset
                }}
                variant="ghost"
                className="gap-2"
              >
                <X className="h-4 w-4" /> {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue gap-2">
                <Save className="h-4 w-4" /> {t('common.save')}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
          <TabsTrigger value="location">Localização</TabsTrigger>
          <TabsTrigger value="financial">{t('common.financial')}</TabsTrigger>
          <TabsTrigger value="marketing">
            {t('properties.marketing')}
          </TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="documents">{t('common.documents')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PropertyOverview
            data={formData}
            onChange={handleChange}
            canEdit={isEditing}
          />
        </TabsContent>

        <TabsContent value="location">
          <PropertyLocation
            data={formData}
            onChange={handleChange}
            canEdit={isEditing}
            condominiums={condominiums}
          />
        </TabsContent>

        <TabsContent value="financial">
          <PropertyFinancials
            data={formData}
            onChange={handleChange}
            canEdit={isEditing}
            owners={owners}
            partners={partners}
          />
        </TabsContent>

        <TabsContent value="marketing">
          <PropertyMarketing
            data={formData}
            onChange={handleChange}
            canEdit={isEditing}
          />
        </TabsContent>

        <TabsContent value="content">
          <PropertyContent
            data={formData}
            onNestedChange={handleNestedChange}
            canEdit={isEditing}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentVault
            documents={formData.documents || []}
            onUpdate={(docs) => handleChange('documents', docs)}
            canEdit={isEditing}
            title="Documentos da Propriedade"
            description="Escrituras, contratos, inspeções."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
