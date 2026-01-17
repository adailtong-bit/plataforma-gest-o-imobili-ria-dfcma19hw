import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Trash2, CalendarDays } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import useOwnerStore from '@/stores/useOwnerStore'
import usePartnerStore from '@/stores/usePartnerStore'
import { Property, User } from '@/lib/types'
import { hasPermission } from '@/lib/permissions'
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { PropertyOverview } from '@/components/properties/PropertyOverview'
import { PropertyLocation } from '@/components/properties/PropertyLocation'
import { PropertyFeatures } from '@/components/properties/PropertyFeatures'
import { PropertyFinancials } from '@/components/properties/PropertyFinancials'
import { PropertyContent } from '@/components/properties/PropertyContent'
import { PropertyLedger } from '@/components/financial/PropertyLedger'

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { properties, updateProperty, deleteProperty } = usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { owners } = useOwnerStore()
  const { partners } = usePartnerStore()
  const { currentUser } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const property = properties.find((p) => p.id === id)

  const [formData, setFormData] = useState<Property | null>(() =>
    property ? JSON.parse(JSON.stringify(property)) : null,
  )

  useEffect(() => {
    if (property) {
      // Local state persists until save
    }
  }, [property])

  const handleSave = () => {
    if (formData) {
      updateProperty(formData)
      toast({
        title: t('common.save'),
        description: 'Propriedade atualizada com sucesso.',
      })
    }
  }

  const handleDelete = () => {
    if (property) {
      try {
        deleteProperty(property.id)
        toast({ title: 'Propriedade excluída.' })
        navigate('/properties')
      } catch (e: any) {
        toast({
          title: t('common.error'),
          description:
            e.message === 'error_active_tenant'
              ? t('common.delete_active_tenant_error')
              : 'Erro ao excluir.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleChange = (field: keyof Property, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleNestedChange = (
    parent: keyof Property,
    key: string,
    value: string,
  ) => {
    setFormData((prev: any) => {
      if (!prev) return null
      const parentObj = prev[parent] || {}
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [key]: value,
        },
      }
    })
  }

  if (!property || !formData) return <div>Not Found</div>

  // Permission Check
  if (
    currentUser.allowedProfileTypes &&
    !currentUser.allowedProfileTypes.includes(property.profileType)
  ) {
    return (
      <div className="p-8 text-center">
        Acesso negado para este tipo de perfil de propriedade.
      </div>
    )
  }

  const canEdit = hasPermission(currentUser as User, 'properties', 'edit')
  const canDelete = hasPermission(currentUser as User, 'properties', 'delete')
  const canViewFinancials = hasPermission(
    currentUser as User,
    'financial',
    'view',
  )

  // Generate Mock iCal URL if missing
  const iCalUrl =
    formData.iCalUrl ||
    `https://api.plataforma.com/ical/${formData.id}/calendar.ics`

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
            <p className="text-sm text-muted-foreground">
              {formData.address} {formData.city ? `, ${formData.city}` : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
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
          )}
          {canEdit && (
            <Button onClick={handleSave} className="bg-trust-blue gap-2">
              <Save className="h-4 w-4" /> {t('common.save')}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
          <TabsTrigger value="location">Localização</TabsTrigger>
          <TabsTrigger value="features">Características</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          {formData.profileType === 'short_term' && (
            <TabsTrigger value="ical">
              <CalendarDays className="h-4 w-4 mr-2" /> iCal Sync
            </TabsTrigger>
          )}
        </TabsList>
        <div className="mt-4">
          <TabsContent value="overview">
            <PropertyOverview
              data={formData}
              onChange={handleChange}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="location">
            <PropertyLocation
              data={formData}
              onChange={handleChange}
              canEdit={canEdit}
              condominiums={condominiums}
            />
          </TabsContent>
          <TabsContent value="features">
            <PropertyFeatures
              data={formData}
              onChange={handleChange}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="content">
            <PropertyContent
              data={formData}
              onNestedChange={handleNestedChange}
              canEdit={canEdit}
            />
          </TabsContent>
          <TabsContent value="financial">
            <div className="space-y-6">
              <PropertyFinancials
                data={formData}
                onChange={handleChange}
                canEdit={canEdit}
                owners={owners}
                partners={partners}
              />
              {canViewFinancials && (
                <PropertyLedger
                  propertyId={formData.id}
                  canEdit={hasPermission(
                    currentUser as User,
                    'financial',
                    'edit',
                  )}
                />
              )}
            </div>
          </TabsContent>
          {formData.profileType === 'short_term' && (
            <TabsContent value="ical">
              <Card>
                <CardHeader>
                  <CardTitle>Sincronização de Calendário</CardTitle>
                  <CardDescription>
                    Use este link iCal para sincronizar a disponibilidade desta
                    propriedade com Airbnb, Booking.com ou Google Calendar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="grid w-full gap-2">
                      <Label>iCal URL (Export)</Label>
                      <Input value={iCalUrl} readOnly />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(iCalUrl)
                          toast({
                            title: 'Copiado!',
                            description:
                              'URL copiada para a área de transferência.',
                          })
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
