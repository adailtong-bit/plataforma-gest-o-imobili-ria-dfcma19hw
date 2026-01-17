import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
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

export default function PropertyDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { properties, updateProperty, deleteProperty } = usePropertyStore()
  const { currentUser } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const property = properties.find((p) => p.id === id)

  const [formData, setFormData] = useState<Property | null>(() =>
    property ? JSON.parse(JSON.stringify(property)) : null,
  )

  useEffect(() => {
    if (property) {
      setFormData(JSON.parse(JSON.stringify(property)))
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
        <TabsList>
          <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
          {/* Other tabs */}
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{t('common.details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Perfil</Label>
                <Select
                  value={formData.profileType}
                  onValueChange={(v) => handleChange('profileType', v)}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_term">Short Term (STR)</SelectItem>
                    <SelectItem value="long_term">Long Term (LTR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Other inputs */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
