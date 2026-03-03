import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil, Trash2, Save, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import usePropertyStore from '@/stores/usePropertyStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { AppContext } from '@/stores/AppContext'
import { Property } from '@/lib/types'
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
import { PropertyFinancials } from '@/components/properties/PropertyFinancials'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { properties, updateProperty, deleteProperty } = usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { owners, partners } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [property, setProperty] = useState<Property | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Property | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const found = properties.find((p) => p.id === id)
      if (found) {
        setProperty(found)
        setFormData(found)
      }
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [id, properties])

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
          Property Not Found
        </h2>
        <p className="text-slate-600 mb-6">
          The property you are looking for does not exist or has been removed.
        </p>
        <Button
          onClick={() => navigate('/properties')}
          className="bg-trust-blue text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
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
      title: t('common.success') || 'Success',
      description: 'Property updated successfully.',
    })
  }

  const handleDelete = () => {
    if (id) {
      deleteProperty(id)
      toast({
        title: t('common.success') || 'Success',
        description: 'Property deleted successfully.',
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
                <X className="h-4 w-4 mr-2" /> {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                onClick={handleSave}
                className="bg-trust-blue text-white font-bold"
              >
                <Save className="h-4 w-4 mr-2" />{' '}
                {t('common.save') || 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-slate-300 font-medium"
              >
                <Pencil className="h-4 w-4 mr-2" />{' '}
                {t('common.edit') || 'Edit Property'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="font-medium">
                    <Trash2 className="h-4 w-4 mr-2" />{' '}
                    {t('common.delete') || 'Delete'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('common.delete_title') || 'Are you absolutely sure?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('common.delete_desc') ||
                        'This action cannot be undone. This will permanently delete the property record.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t('common.cancel') || 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      {t('common.delete') || 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="overview">
            <PropertyOverview
              data={formData}
              onChange={handleChange}
              canEdit={isEditing}
            />
          </TabsContent>
          <TabsContent value="management">
            <div className="bg-white p-8 text-center rounded-lg border shadow-sm flex flex-col items-center justify-center min-h-[300px]">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Management Workspace
              </h3>
              <p className="text-slate-500 max-w-md">
                Access property maintenance workflows, calendars, and active
                tasks here. Modules are synchronized with the central
                operational dashboard.
              </p>
            </div>
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
            <PropertyMedia
              data={formData}
              onChange={handleChange}
              canEdit={isEditing}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
