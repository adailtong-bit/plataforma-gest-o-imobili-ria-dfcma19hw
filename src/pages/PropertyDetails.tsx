import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Save,
  Edit,
  X,
  Trash2,
  User,
  History,
  RefreshCw,
  Package,
  Download,
  FileText,
  Hammer,
} from 'lucide-react'
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
import useTenantStore from '@/stores/useTenantStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Property } from '@/lib/types'
import { exportToCSV } from '@/lib/utils'

// Sub-components
import { PropertyOverview } from '@/components/properties/PropertyOverview'
import { PropertyLocation } from '@/components/properties/PropertyLocation'
import { PropertyFinancials } from '@/components/properties/PropertyFinancials'
import { PropertyMarketing } from '@/components/properties/PropertyMarketing'
import { PropertyContent } from '@/components/properties/PropertyContent'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { PropertyTasks } from '@/components/properties/PropertyTasks'
import { PropertyFeatures } from '@/components/properties/PropertyFeatures'
import { PropertyActivityLog } from '@/components/properties/PropertyActivityLog'
import { PropertySync } from '@/components/properties/PropertySync'
import { PropertyInventory } from '@/components/properties/PropertyInventory'
import { PropertyContracts } from '@/components/properties/PropertyContracts'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { properties, updateProperty, deleteProperty } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { partners } = usePartnerStore()
  const { tenants } = useTenantStore()
  const { condominiums } = useCondominiumStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const property = properties.find((p) => p.id === id)

  const [formData, setFormData] = useState<Property | null>(() =>
    property ? JSON.parse(JSON.stringify(property)) : null,
  )
  const [isEditing, setIsEditing] = useState(false)

  const owner = owners.find((o) => o.id === property?.ownerId)
  const activeTenant = tenants.find(
    (t) => t.propertyId === property?.id && t.status === 'active',
  )
  const linkedCondo = condominiums.find((c) => c.id === formData?.condominiumId)

  useEffect(() => {
    if (property) {
      setFormData((prev) => {
        if (!prev || prev.id !== property.id) {
          return JSON.parse(JSON.stringify(property))
        }
        return prev
      })
    }
  }, [property])

  if (!property || !formData) return <div>Not Found</div>

  const handleSave = () => {
    if (!formData.name?.trim() || !formData.address?.trim()) {
      toast({
        title: t('common.error'),
        description: t('properties.name_required'),
        variant: 'destructive',
      })
      return
    }

    if (!formData.zipCode?.trim()) {
      toast({
        title: t('properties.validation_error'),
        description: t('properties.zip_required'),
        variant: 'destructive',
      })
      return
    }

    updateProperty(formData)
    setIsEditing(false)
    toast({
      title: t('common.save'),
      description: t('properties.property_added').replace(
        'Adicionada',
        'Atualizada',
      ), // Reuse or generic success
    })
  }

  const handleDelete = () => {
    try {
      deleteProperty(property.id)
      toast({ title: t('properties.delete_success') })
      navigate('/properties')
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description:
          error.message === 'error_active_tenant'
            ? t('common.delete_active_tenant_error')
            : t('properties.error_delete'),
        variant: 'destructive',
      })
    }
  }

  const handleExport = () => {
    if (!formData) return

    const headers = [
      'Property ID',
      'Name',
      'Address',
      'City',
      'State',
      'Zip Code',
      'Country',
      'Type',
      'Profile',
      'Status',
      'Bedrooms',
      'Bathrooms',
      'Guests',
      'Owner ID',
      'Current Tenant',
      'Listing Price',
    ]

    const row = [
      formData.id,
      formData.name,
      formData.address,
      formData.city || '',
      formData.state || '',
      formData.zipCode || '',
      formData.country || '',
      formData.type,
      formData.profileType,
      formData.status,
      formData.bedrooms,
      formData.bathrooms,
      formData.guests,
      formData.ownerId,
      activeTenant ? activeTenant.name : 'None',
      formData.listingPrice || 0,
    ]

    exportToCSV(`property_${formData.name}_export`, headers, [row])
    toast({
      title: t('common.success'),
      description: t('common.export_success'),
    })
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
      {/* Header with Traceability */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb / Relations */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md border w-fit">
          <span className="font-medium">{t('common.relationships')}</span>
          {owner ? (
            <Link
              to={`/owners/${owner.id}`}
              className="flex items-center gap-1 hover:text-blue-600 underline"
            >
              <User className="h-3 w-3" /> {owner.name} (
              {t('common.relationships.owner')})
            </Link>
          ) : (
            <span className="text-gray-400">{t('common.no_owner')}</span>
          )}
          <span>/</span>
          {activeTenant ? (
            <Link
              to={`/tenants/${activeTenant.id}`}
              className="flex items-center gap-1 hover:text-blue-600 underline"
            >
              <User className="h-3 w-3" /> {activeTenant.name} (
              {t('common.relationships.tenant')})
            </Link>
          ) : (
            <span className="text-gray-400">
              {t('common.no_active_tenant')}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/properties">
              <Button variant="ghost" size="icon" title={t('common.back')}>
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
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" /> {t('common.export')}
                </Button>
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
                      <AlertDialogCancel>
                        {t('common.cancel')}
                      </AlertDialogCancel>
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
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">
            {t('properties.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Hammer className="h-4 w-4 mr-2" />{' '}
            {t('properties.tabs.maintenance')}
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />{' '}
            {t('properties.tabs.contracts')}
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />{' '}
            {t('properties.tabs.inventory')}
          </TabsTrigger>
          <TabsTrigger value="features">
            <div className="flex items-center gap-2">
              <span>{t('properties.tabs.features')}</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="location">
            {t('properties.tabs.location')}
          </TabsTrigger>
          <TabsTrigger value="sync">
            <RefreshCw className="h-4 w-4 mr-2" /> {t('properties.tabs.sync')}
          </TabsTrigger>
          <TabsTrigger value="financial">
            {t('properties.tabs.financial')}
          </TabsTrigger>
          <TabsTrigger value="marketing">
            {t('properties.tabs.marketing')}
          </TabsTrigger>
          <TabsTrigger value="content">
            {t('properties.tabs.content')}
          </TabsTrigger>
          <TabsTrigger value="documents">
            {t('properties.tabs.documents')}
          </TabsTrigger>
          <TabsTrigger value="logs">
            <History className="h-4 w-4 mr-2" /> {t('properties.tabs.logs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PropertyOverview
            data={formData}
            onChange={handleChange}
            canEdit={isEditing}
          />
        </TabsContent>

        <TabsContent value="maintenance">
          <PropertyTasks propertyId={formData.id} canEdit={true} />
        </TabsContent>

        <TabsContent value="contracts">
          <PropertyContracts propertyId={formData.id} canEdit={isEditing} />
        </TabsContent>

        <TabsContent value="inventory">
          <PropertyInventory
            data={formData}
            onChange={handleChange}
            canEdit={isEditing}
          />
        </TabsContent>

        <TabsContent value="features">
          <PropertyFeatures
            data={formData}
            onChange={handleChange}
            canEdit={isEditing}
            condominium={linkedCondo}
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

        <TabsContent value="sync">
          <PropertySync
            data={formData}
            onChange={handleChange}
            canEdit={isEditing}
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
            onChange={handleChange}
            onNestedChange={handleNestedChange}
            canEdit={isEditing}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentVault
            documents={formData.documents || []}
            onUpdate={(docs) => handleChange('documents', docs)}
            canEdit={isEditing}
            title={t('properties.tabs.documents')}
            description={t('common.documents')}
          />
        </TabsContent>

        <TabsContent value="logs">
          <PropertyActivityLog propertyId={formData.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
