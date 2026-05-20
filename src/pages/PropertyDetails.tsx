import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Trash2, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import usePropertyStore from '@/stores/usePropertyStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import { AppContext } from '@/stores/AppContext'
import { Property, User } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
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

import { PropertyOverview } from '@/components/properties/PropertyOverview'
import { PropertyLocation } from '@/components/properties/PropertyLocation'
import { PropertyFeatures } from '@/components/properties/PropertyFeatures'
import { PropertyMedia } from '@/components/properties/PropertyMedia'
import { PropertyDocuments } from '@/components/properties/PropertyDocuments'
import { PropertyFinancials } from '@/components/properties/PropertyFinancials'
import { PropertyManagement } from '@/components/properties/PropertyManagement'
import { PropertyInventory } from '@/components/properties/PropertyInventory'
import { PropertyHistory } from '@/components/properties/PropertyHistory'

export default function PropertyDetails() {
  const { id, tab } = useParams()
  const navigate = useNavigate()
  const currentTab = tab || 'overview'
  const { properties, updateProperty, deleteProperty } = usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { currentUser, hasPermissionSync } = useAuthStore()
  const { owners, partners } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [property, setProperty] = useState<Property | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Property | null>(null)

  const canEdit = hasPermissionSync(currentUser as User, 'properties', 'edit')
  const canDelete = hasPermissionSync(
    currentUser as User,
    'properties',
    'delete',
  )

  const [ownerDetails, setOwnerDetails] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const found = properties.find((p) => p.id === id)
      if (found) {
        if (property?.id !== id) {
          setProperty(found)
          setFormData((prev) => {
            if (isEditing) return prev
            return found
          })
          setIsLoading(false)

          if (found.owner_id) {
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('name, email, phone')
              .eq('id', found.owner_id)
              .single()
            if (ownerData) setOwnerDetails(ownerData)
          }
        }
      } else if (properties.length > 0) {
        // Properties are loaded but this one is not found
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, properties, isEditing, property?.id])

  // Fallback timeout to stop loading if property list takes too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!property || !formData) {
    return (
      <div className="p-6 text-center max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Propriedade não encontrada
        </h2>
        <p className="text-slate-600 mb-6">
          A propriedade que você está procurando não existe ou foi removida.
        </p>
        <Button
          onClick={() => navigate('/properties')}
          className="bg-trust-blue text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Propriedades
        </Button>
      </div>
    )
  }

  const handleChange = (field: keyof Property, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = () => {
    updateProperty(formData)
    setProperty(formData)
    setIsEditing(false)
    toast({
      title: t('common.success') || 'Sucesso',
      description: 'Propriedade atualizada com sucesso.',
    })
  }

  const handleDelete = () => {
    if (id) {
      deleteProperty(id)
      toast({
        title: t('common.success') || 'Sucesso',
        description: 'Propriedade excluída com sucesso.',
      })
      navigate('/properties')
    }
  }

  const condo = condominiums.find((c) => c.id === formData.condominiumId)

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/properties')}
            className="border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {formData.name}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {formData.address}, {formData.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(property)
                  setIsEditing(false)
                }}
                className="border-slate-300 font-medium"
              >
                <X className="h-4 w-4 mr-2" />{' '}
                {t('common.cancel') || 'Cancelar'}
              </Button>
              <Button
                onClick={handleSave}
                className="bg-trust-blue text-white font-bold"
              >
                <Save className="h-4 w-4 mr-2" />{' '}
                {t('common.save') || 'Salvar Alterações'}
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-slate-300 font-medium"
                >
                  <Pencil className="h-4 w-4 mr-2" />{' '}
                  {t('common.edit') || 'Editar Propriedade'}
                </Button>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="font-medium">
                      <Trash2 className="h-4 w-4 mr-2" />{' '}
                      {t('common.delete') || 'Excluir'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('common.delete_title') || 'Tem certeza?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('common.delete_desc') ||
                          'Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro da propriedade.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t('common.cancel') || 'Cancelar'}
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        {t('common.delete') || 'Excluir'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
        </div>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(v) => navigate(`/properties/${id}/${v}`)}
        className="w-full"
      >
        <TabsList className="flex flex-wrap h-auto bg-slate-100 p-1 rounded-md gap-1 w-full lg:w-fit mb-6">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
          >
            {t('properties.tabs.overview') || 'Visão Geral'}
          </TabsTrigger>
          <TabsTrigger
            value="management"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
          >
            {t('properties.tabs.management') || 'Gestão'}
          </TabsTrigger>
          <TabsTrigger
            value="financials"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
          >
            {t('properties.tabs.financial') || 'Financeiro'}
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
          >
            {t('common.details') || 'Detalhes'}
          </TabsTrigger>
          <TabsTrigger
            value="inventory"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
          >
            {t('properties.tabs.inventory') || 'Inventário'}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
          >
            {t('common.history') || 'Histórico'}
          </TabsTrigger>
        </TabsList>
        <div className="mt-0">
          <TabsContent value="overview" className="space-y-6">
            <PropertyMedia
              data={formData}
              onChange={handleChange}
              canEdit={isEditing}
            />
            <PropertyOverview
              data={formData}
              onChange={handleChange}
              canEdit={isEditing}
              ownerDetails={ownerDetails}
            />
          </TabsContent>
          <TabsContent value="management">
            <PropertyManagement property={formData} />
          </TabsContent>
          <TabsContent value="financials">
            <PropertyFinancials
              data={formData}
              onChange={handleChange}
              canEdit={isEditing}
              owners={owners}
              partners={partners}
            />
          </TabsContent>
          <TabsContent value="details" className="space-y-6">
            <PropertyLocation
              data={formData}
              onChange={handleChange}
              canEdit={isEditing}
              condominiums={condominiums}
            />
            <PropertyFeatures
              data={formData}
              onChange={handleChange}
              canEdit={isEditing}
              condominium={condo}
            />
            <PropertyDocuments
              property={formData}
              onChange={handleChange}
              canEdit={isEditing}
            />
          </TabsContent>
          <TabsContent value="inventory">
            <PropertyInventory data={formData} />
          </TabsContent>
          <TabsContent value="history">
            <PropertyHistory data={formData} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
