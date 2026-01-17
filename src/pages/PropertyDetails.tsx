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
import {
  ArrowLeft,
  Save,
  Wifi,
  Key,
  FileText,
  Upload,
  Trash2,
  Plus,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import usePropertyStore from '@/stores/usePropertyStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import useOwnerStore from '@/stores/useOwnerStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { Property } from '@/lib/types'
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
  const { condominiums } = useCondominiumStore()
  const { owners } = useOwnerStore()
  const { partners } = usePartnerStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const property = properties.find((p) => p.id === id)

  // Initialize local state immediately if property exists
  const [formData, setFormData] = useState<Property | null>(() =>
    property ? JSON.parse(JSON.stringify(property)) : null,
  )

  // Sync with store updates - This hook MUST be unconditional (top-level)
  useEffect(() => {
    if (property) {
      setFormData(JSON.parse(JSON.stringify(property)))
    }
  }, [property])

  const agents = partners.filter((p) => p.type === 'agent')

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
    parent: 'description' | 'hoaRules',
    lang: 'pt' | 'en' | 'es',
    value: string,
  ) => {
    setFormData((prev) => {
      if (!prev) return null
      const parentObj = prev[parent] || { pt: '', en: '', es: '' }
      return {
        ...prev,
        [parent]: { ...parentObj, [lang]: value },
      }
    })
  }

  // If we don't have a property or form data (loading/not found), show this state
  // But we do this AFTER all hooks are called
  if (!property || !formData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          Propriedade não encontrada
        </h2>
        <Button onClick={() => navigate('/properties')}>
          {t('common.back')}
        </Button>
      </div>
    )
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('common.delete_title')}</AlertDialogTitle>
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
          <Button onClick={handleSave} className="bg-trust-blue gap-2">
            <Save className="h-4 w-4" /> {t('common.save')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
          <TabsTrigger value="access">
            {t('properties.access_wifi')}
          </TabsTrigger>
          <TabsTrigger value="description">
            {t('common.description')}
          </TabsTrigger>
          <TabsTrigger value="media">{t('properties.gallery')}</TabsTrigger>
          <TabsTrigger value="documents">{t('properties.docs')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('common.details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>{t('common.name')}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.address')}</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('common.type')}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) => handleChange('type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="House">
                          {t('properties.house')}
                        </SelectItem>
                        <SelectItem value="Condo">
                          {t('properties.condo')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('properties.condominium')}</Label>
                    <Select
                      value={formData.condominiumId || ''}
                      onValueChange={(v) => handleChange('condominiumId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {condominiums.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status & Config</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('common.status')}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => handleChange('status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="occupied">
                          {t('common.occupied')}
                        </SelectItem>
                        <SelectItem value="vacant">
                          {t('common.vacant')}
                        </SelectItem>
                        <SelectItem value="maintenance">
                          {t('common.maintenance')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Marketing</Label>
                    <Select
                      value={formData.marketingStatus || 'unlisted'}
                      onValueChange={(v) => handleChange('marketingStatus', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listed">
                          {t('properties.listed')}
                        </SelectItem>
                        <SelectItem value="unlisted">
                          {t('properties.unlisted')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-2">
                    <Label>{t('properties.beds')}</Label>
                    <Input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        handleChange('bedrooms', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('properties.baths')}</Label>
                    <Input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        handleChange('bathrooms', parseInt(e.target.value))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('properties.guests')}</Label>
                    <Input
                      type="number"
                      value={formData.guests}
                      onChange={(e) =>
                        handleChange('guests', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('properties.owner')}</Label>
                    <Select
                      value={formData.ownerId}
                      onValueChange={(v) => handleChange('ownerId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {owners.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('properties.agent')}</Label>
                    <Select
                      value={formData.agentId || ''}
                      onValueChange={(v) => handleChange('agentId', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" /> Wifi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>{t('properties.wifi_ssid')}</Label>
                  <Input
                    value={formData.wifiSsid || ''}
                    onChange={(e) => handleChange('wifiSsid', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('properties.wifi_password')}</Label>
                  <Input
                    value={formData.wifiPassword || ''}
                    onChange={(e) =>
                      handleChange('wifiPassword', e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" /> {t('properties.access_codes')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('properties.door_code')}</Label>
                    <Input
                      value={formData.accessCodeUnit || ''}
                      onChange={(e) =>
                        handleChange('accessCodeUnit', e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('properties.building_code')}</Label>
                    <Input
                      value={formData.accessCodeBuilding || ''}
                      onChange={(e) =>
                        handleChange('accessCodeBuilding', e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('properties.guest_code')}</Label>
                    <Input
                      value={formData.accessCodeGuest || ''}
                      onChange={(e) =>
                        handleChange('accessCodeGuest', e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('properties.cleaning_code')}</Label>
                    <Input
                      value={formData.accessCodeCleaning || ''}
                      onChange={(e) =>
                        handleChange('accessCodeCleaning', e.target.value)
                      }
                      className="font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="description">
          <Card>
            <CardHeader>
              <CardTitle>{t('common.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pt">
                <TabsList className="mb-4">
                  <TabsTrigger value="pt">Português</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="es">Español</TabsTrigger>
                </TabsList>
                {['pt', 'en', 'es'].map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Descrição ({lang.toUpperCase()})</Label>
                      <Textarea
                        value={formData.description?.[lang as 'pt'] || ''}
                        onChange={(e) =>
                          handleNestedChange(
                            'description',
                            lang as any,
                            e.target.value,
                          )
                        }
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Regras da Casa ({lang.toUpperCase()})</Label>
                      <Textarea
                        value={formData.hoaRules?.[lang as 'pt'] || ''}
                        onChange={(e) =>
                          handleNestedChange(
                            'hoaRules',
                            lang as any,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Galeria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  className="relative aspect-video bg-muted rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border-2 border-dashed"
                  onClick={() => {
                    const newUrl = `https://img.usecurling.com/p/400/300?q=interior&r=${Math.random()}`
                    setFormData((prev) =>
                      prev
                        ? {
                            ...prev,
                            gallery: [...(prev.gallery || []), newUrl],
                          }
                        : null,
                    )
                  }}
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Plus className="w-8 h-8" />
                    <span>Adicionar</span>
                  </div>
                </div>
                {formData.gallery?.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-lg overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt={`Gallery ${i}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6"
                      onClick={() => {
                        const newGallery = [...(formData.gallery || [])]
                        newGallery.splice(i, 1)
                        setFormData({ ...formData, gallery: newGallery })
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newDoc = {
                      id: `doc-${Date.now()}`,
                      name: 'Novo Doc.pdf',
                      url: '#',
                      date: new Date().toISOString().split('T')[0],
                    }
                    setFormData((prev) =>
                      prev
                        ? {
                            ...prev,
                            documents: [...(prev.documents || []), newDoc],
                          }
                        : null,
                    )
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
                <div className="grid gap-2">
                  {formData.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.date}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  documents: prev.documents?.filter(
                                    (d) => d.id !== doc.id,
                                  ),
                                }
                              : null,
                          )
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {(!formData.documents || formData.documents.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum documento.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
