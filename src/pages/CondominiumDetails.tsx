import { useState, useRef, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Save,
  Lock,
  DollarSign,
  FileText,
  Upload,
  Download,
  Trash2,
  Edit,
  X,
} from 'lucide-react'
import useCondominiumStore from '@/stores/useCondominiumStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Condominium } from '@/lib/types'

export default function CondominiumDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { condominiums, updateCondominium, deleteCondominium } =
    useCondominiumStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const condo = condominiums.find((c) => c.id === id)
  const [formData, setFormData] = useState<Condominium | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (condo) {
      setFormData(JSON.parse(JSON.stringify(condo)))
    }
  }, [condo])

  if (!condo || !formData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Condomínio não encontrado</h2>
        <Button onClick={() => navigate('/condominiums')} className="mt-4">
          {t('common.back')}
        </Button>
      </div>
    )
  }

  const handleSave = () => {
    updateCondominium(formData)
    setIsEditing(false)
    toast({
      title: t('common.save'),
      description: 'Dados do condomínio atualizados.',
    })
  }

  const handleCancel = () => {
    setFormData(JSON.parse(JSON.stringify(condo)))
    setIsEditing(false)
  }

  const handleDelete = () => {
    try {
      deleteCondominium(condo.id)
      toast({ title: 'Condomínio excluído' })
      navigate('/condominiums')
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description:
          error.message === 'error_linked_condo'
            ? t('common.delete_linked_error')
            : 'Erro ao excluir.',
        variant: 'destructive',
      })
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (
    parent: 'accessCredentials',
    field: string,
    value: string,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setTimeout(() => {
      setFormData((prev: any) => ({
        ...prev,
        hoaContract: {
          name: file.name,
          url: URL.createObjectURL(file),
          date: new Date().toISOString(),
        },
      }))
      setIsUploading(false)
      toast({
        title: t('condominiums.upload_contract'),
        description: 'Contrato enviado com sucesso. (Não salvo até confirmar)',
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/condominiums">
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
                onClick={handleCancel}
                variant="outline"
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
          <TabsTrigger value="access">
            {t('condominiums.access_credentials')}
          </TabsTrigger>
          <TabsTrigger value="financial">
            {t('condominiums.financial_hoa')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.address')}</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.description')}</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) =>
                      handleChange('description', e.target.value)
                    }
                    placeholder="Informações gerais sobre o condomínio..."
                    className="min-h-[100px]"
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('condominiums.manager')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>{t('common.name')}</Label>
                  <Input
                    value={formData.managerName || ''}
                    onChange={(e) =>
                      handleChange('managerName', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('common.phone')}</Label>
                    <Input
                      value={formData.managerPhone || ''}
                      onChange={(e) =>
                        handleChange('managerPhone', e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('common.email')}</Label>
                    <Input
                      value={formData.managerEmail || ''}
                      onChange={(e) =>
                        handleChange('managerEmail', e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />{' '}
                {t('condominiums.access_credentials')}
              </CardTitle>
              <CardDescription>
                Senhas gerais de acesso ao condomínio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>{t('properties.guest_code')}</Label>
                  <Input
                    value={formData.accessCredentials?.guest || ''}
                    onChange={(e) =>
                      handleNestedChange(
                        'accessCredentials',
                        'guest',
                        e.target.value,
                      )
                    }
                    placeholder="****"
                    className="font-mono text-lg"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('properties.service_code')}</Label>
                  <Input
                    value={formData.accessCredentials?.service || ''}
                    onChange={(e) =>
                      handleNestedChange(
                        'accessCredentials',
                        'service',
                        e.target.value,
                      )
                    }
                    placeholder="****"
                    className="font-mono text-lg"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('properties.cleaning_code')}</Label>
                  <Input
                    value={formData.accessCredentials?.cleaning || ''}
                    onChange={(e) =>
                      handleNestedChange(
                        'accessCredentials',
                        'cleaning',
                        e.target.value,
                      )
                    }
                    placeholder="****"
                    className="font-mono text-lg"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />{' '}
                  {t('condominiums.financial_hoa')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('properties.hoa_fee')}</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={formData.hoaFee || ''}
                        onChange={(e) =>
                          handleChange('hoaFee', parseFloat(e.target.value))
                        }
                        className="pl-8"
                        placeholder="0.00"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('properties.hoa_freq')}</Label>
                    <Select
                      value={formData.hoaFrequency || 'monthly'}
                      onValueChange={(val) => handleChange('hoaFrequency', val)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          {t('properties.monthly')}
                        </SelectItem>
                        <SelectItem value="quarterly">
                          {t('properties.quarterly')}
                        </SelectItem>
                        <SelectItem value="semi-annually">
                          {t('properties.semiannually')}
                        </SelectItem>
                        <SelectItem value="annually">
                          {t('properties.annually')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />{' '}
                  {t('condominiums.hoa_contract')}
                </CardTitle>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isUploading
                        ? t('properties.uploading')
                        : t('common.upload')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {formData.hoaContract ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-8 w-8 text-blue-500 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">
                          {formData.hoaContract.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            formData.hoaContract.date,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={formData.hoaContract.url}
                        download={formData.hoaContract.name}
                      >
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleChange('hoaContract', undefined)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-md">
                    <p>{t('condominiums.upload_contract')}</p>
                    <p className="text-xs mt-1">PDF, DOC, DOCX</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
