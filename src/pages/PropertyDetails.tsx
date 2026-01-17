import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  MapPin,
  Wifi,
  Key,
  FileText,
  Share2,
  Camera,
  ExternalLink,
  MessageSquare,
  Building,
  AlertCircle,
  Calendar,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  Globe,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useAuthStore from '@/stores/useAuthStore'
import useMessageStore from '@/stores/useMessageStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useTenantStore from '@/stores/useTenantStore'
import useTaskStore from '@/stores/useTaskStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { Switch } from '@/components/ui/switch'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  Bar,
  ResponsiveContainer,
} from 'recharts'

export default function PropertyDetails() {
  const { id } = useParams()
  const { properties, updateProperty } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { partners } = usePartnerStore()
  const { tenants } = useTenantStore()
  const { tasks } = useTaskStore()
  const { financials } = useFinancialStore()
  const { currentUser } = useAuthStore()
  const { startChat } = useMessageStore()
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [descLang, setDescLang] = useState<'pt' | 'en' | 'es'>('pt')
  const [hoaLang, setHoaLang] = useState<'pt' | 'en' | 'es'>('pt')
  const [editMode, setEditMode] = useState(false)
  const [localProperty, setLocalProperty] = useState<any>(null)

  const property = properties.find((p) => p.id === id)

  if (!property)
    return (
      <div className="p-8">
        Propriedade não encontrada.{' '}
        <Link to="/properties" className="text-blue-500">
          Voltar
        </Link>
      </div>
    )

  // Initialize local state if not set
  if (!localProperty && property) {
    setLocalProperty(JSON.parse(JSON.stringify(property)))
  }

  const activeTenant = tenants.find(
    (tn) => tn.propertyId === property.id && tn.status === 'active',
  )
  const owner = owners.find((o) => o.id === property.ownerId)
  const agent = property.agentId
    ? partners.find((p) => p.id === property.agentId)
    : null
  const propertyManagerId = 'plat_manager'
  const propertyTasks = tasks.filter((task) => task.propertyId === property.id)
  const propertyPayments = financials.payments.filter(
    (p) => p.propertyId === property.id,
  )

  // Calculate mock revenue for this property (simple distribution for demo)
  const propRevenue = financials.revenue.map((r) => ({
    ...r,
    value: r.value * 0.15, // assume this prop contributes 15%
  }))

  const handleContactManager = () => {
    startChat(propertyManagerId)
    navigate('/messages')
  }

  const handleSave = () => {
    updateProperty(localProperty)
    setEditMode(false)
    toast({
      title: t('common.save'),
      description: 'Alterações salvas com sucesso.',
    })
  }

  const handleToggleListing = (enabled: boolean) => {
    const updated = {
      ...property,
      marketingStatus: enabled ? 'listed' : 'unlisted',
    } as any
    updateProperty(updated)
    setLocalProperty(updated)
    toast({
      title: enabled ? t('properties.listed') : t('properties.unlisted'),
      description: enabled
        ? 'Propriedade visível publicamente.'
        : 'Propriedade removida da listagem pública.',
    })
  }

  const handleUploadImage = () => {
    const newImage = `https://img.usecurling.com/p/400/300?q=interior${Math.random()}`
    const updatedGallery = [...(localProperty.gallery || []), newImage]
    setLocalProperty({ ...localProperty, gallery: updatedGallery })
    updateProperty({ ...property, gallery: updatedGallery })
    toast({
      title: 'Imagem Adicionada',
      description: 'A imagem foi adicionada à galeria.',
    })
  }

  const handleUploadDoc = () => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: `Documento ${localProperty.documents?.length || 0 + 1}.pdf`,
      url: '#',
      date: new Date().toISOString(),
    }
    const updatedDocs = [...(localProperty.documents || []), newDoc]
    setLocalProperty({ ...localProperty, documents: updatedDocs })
    updateProperty({ ...property, documents: updatedDocs })
    toast({
      title: 'Documento Adicionado',
      description: 'O documento foi salvo.',
    })
  }

  const handleConfigureAlerts = (days: number, date?: string) => {
    const updated = {
      ...localProperty,
      contractConfig: { expirationAlertDays: days, renewalAlertDate: date },
    }
    setLocalProperty(updated)
    updateProperty(updated)
    toast({ title: 'Alertas Configurados' })
  }

  const currentDesc =
    localProperty?.description?.[descLang] || property.description?.[descLang]
  const currentHoa =
    localProperty?.hoaRules?.[hoaLang] || property.hoaRules?.[hoaLang]

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col gap-4">
        <Link to="/properties">
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 gap-1 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> {t('common.back')}
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy break-words">
              {property.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{property.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Link to="/calendar">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" /> {t('common.view')}{' '}
                {t('common.calendar')}
              </Button>
            </Link>
            {currentUser.role === 'property_owner' ? (
              <Button
                className="bg-trust-blue gap-2"
                onClick={handleContactManager}
              >
                <MessageSquare className="h-4 w-4" />{' '}
                {t('properties.contact_manager')}
              </Button>
            ) : (
              <Button
                className="bg-trust-blue"
                onClick={() =>
                  editMode ? handleSave() : setEditMode(!editMode)
                }
              >
                {editMode ? t('common.save') : t('properties.edit_property')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview">
                {t('properties.overview')}
              </TabsTrigger>
              <TabsTrigger value="access">
                {t('properties.access_wifi')}
              </TabsTrigger>
              <TabsTrigger value="performance">
                {t('properties.performance')}
              </TabsTrigger>
              <TabsTrigger value="gallery">
                {t('properties.gallery')}
              </TabsTrigger>
              <TabsTrigger value="docs">{t('properties.docs')}</TabsTrigger>
              <TabsTrigger value="hoa">{t('properties.hoa')}</TabsTrigger>
              <TabsTrigger value="history">
                {t('properties.history')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle>{t('properties.details_card')}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg border">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        {t('properties.public_listing')}
                      </span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={property.marketingStatus === 'listed'}
                          onCheckedChange={handleToggleListing}
                        />
                        <span className="text-xs text-muted-foreground">
                          {property.marketingStatus === 'listed'
                            ? t('properties.listed')
                            : t('properties.unlisted')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        {t('common.type')}
                      </p>
                      <p className="font-semibold">{property.type}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        {t('properties.beds')}
                      </p>
                      <p className="font-semibold">{property.bedrooms}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        {t('properties.baths')}
                      </p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        {t('properties.guests')}
                      </p>
                      <p className="font-semibold">{property.guests}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">
                        {t('common.description')}
                      </h3>
                      <div className="flex gap-1">
                        {(['pt', 'en', 'es'] as const).map((lang) => (
                          <Button
                            key={lang}
                            variant={descLang === lang ? 'default' : 'outline'}
                            size="sm"
                            className="h-6 px-2 text-xs uppercase"
                            onClick={() => setDescLang(lang)}
                          >
                            {lang}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {editMode ? (
                      <Textarea
                        value={localProperty?.description?.[descLang] || ''}
                        onChange={(e) =>
                          setLocalProperty({
                            ...localProperty,
                            description: {
                              ...localProperty.description,
                              [descLang]: e.target.value,
                            },
                          })
                        }
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                        {currentDesc || 'Sem descrição.'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t('properties.occupancy')}
                    </CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {activeTenant ? '100%' : '0%'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('properties.occupancy_desc')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      $
                      {propRevenue
                        .reduce((acc, curr) => acc + curr.value, 0)
                        .toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Year to date
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.revenue_overview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: 'Receita',
                        color: 'hsl(var(--primary))',
                      },
                    }}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={propRevenue}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="value"
                          fill="var(--color-revenue)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('properties.access_codes')}</CardTitle>
                  <CardDescription>
                    {t('properties.access_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Building Code */}
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <Building className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground truncate">
                          {t('properties.building_code')}
                        </p>
                        {editMode ? (
                          <Input
                            value={localProperty?.accessCodeBuilding || ''}
                            onChange={(e) =>
                              setLocalProperty({
                                ...localProperty,
                                accessCodeBuilding: e.target.value,
                              })
                            }
                            className="h-8 mt-1"
                          />
                        ) : (
                          <p className="text-xl font-bold tracking-widest break-all">
                            {property.accessCodeBuilding || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Unit Code */}
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <Key className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground truncate">
                          {t('properties.door_code')}
                        </p>
                        {editMode ? (
                          <Input
                            value={localProperty?.accessCodeUnit || ''}
                            onChange={(e) =>
                              setLocalProperty({
                                ...localProperty,
                                accessCodeUnit: e.target.value,
                              })
                            }
                            className="h-8 mt-1"
                          />
                        ) : (
                          <p className="text-xl font-bold tracking-widest break-all">
                            {property.accessCodeUnit || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Wifi SSID */}
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <Wifi className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground truncate">
                          {t('properties.wifi_ssid')}
                        </p>
                        {editMode ? (
                          <Input
                            value={localProperty?.wifiSsid || ''}
                            onChange={(e) =>
                              setLocalProperty({
                                ...localProperty,
                                wifiSsid: e.target.value,
                              })
                            }
                            className="h-8 mt-1"
                          />
                        ) : (
                          <p className="text-lg font-bold break-all">
                            {property.wifiSsid || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Wifi Password */}
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
                      <div className="bg-white p-2 rounded-full shadow-sm">
                        <Key className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground truncate">
                          {t('properties.wifi_password')}
                        </p>
                        {editMode ? (
                          <Input
                            value={localProperty?.wifiPassword || ''}
                            onChange={(e) =>
                              setLocalProperty({
                                ...localProperty,
                                wifiPassword: e.target.value,
                              })
                            }
                            className="h-8 mt-1"
                          />
                        ) : (
                          <p className="text-lg font-mono break-all">
                            {property.wifiPassword || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t('properties.gallery')}</CardTitle>
                  <Button size="sm" onClick={handleUploadImage}>
                    <Camera className="mr-2 h-4 w-4" />{' '}
                    {t('properties.add_photos')}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Main Image */}
                    <div className="col-span-2 row-span-2 rounded-xl overflow-hidden shadow-sm h-[400px]">
                      <img
                        src={property.image}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        alt="Main"
                      />
                    </div>
                    {/* Gallery Images */}
                    {(localProperty?.gallery || property.gallery || []).map(
                      (img: string, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl overflow-hidden shadow-sm h-[190px]"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            alt={`Gallery ${idx}`}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="docs" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t('properties.legal_docs')}</CardTitle>
                  <Button size="sm" variant="outline" onClick={handleUploadDoc}>
                    <Upload className="mr-2 h-4 w-4" /> {t('common.upload')}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(localProperty?.documents || property.documents || [])
                      .length === 0 ? (
                      <p className="text-muted-foreground text-sm italic">
                        Nenhum documento.
                      </p>
                    ) : (
                      (
                        localProperty?.documents ||
                        property.documents ||
                        []
                      ).map((doc: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate font-medium">
                                {doc.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(doc.date), 'dd/MM/yyyy')}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hoa" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('properties.hoa_info')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">
                      {t('properties.hoa_rules')}
                    </h4>
                    <div className="flex gap-1">
                      {(['pt', 'en', 'es'] as const).map((lang) => (
                        <Button
                          key={lang}
                          variant={hoaLang === lang ? 'default' : 'outline'}
                          size="sm"
                          className="h-6 px-2 text-xs uppercase"
                          onClick={() => setHoaLang(lang)}
                        >
                          {lang}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {editMode ? (
                    <Textarea
                      value={localProperty?.hoaRules?.[hoaLang] || ''}
                      onChange={(e) =>
                        setLocalProperty({
                          ...localProperty,
                          hoaRules: {
                            ...localProperty.hoaRules,
                            [hoaLang]: e.target.value,
                          },
                        })
                      }
                      className="min-h-[150px]"
                    />
                  ) : (
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-muted/20">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {currentHoa || 'Sem regras cadastradas.'}
                      </p>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>{t('properties.history')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {propertyTasks.length === 0 ? (
                      <p className="text-center text-muted-foreground">
                        Sem histórico operacional.
                      </p>
                    ) : (
                      propertyTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-full">
                              {task.type === 'cleaning' ? (
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(task.date), 'dd/MM/yyyy')} •{' '}
                                {task.assignee}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {task.price && (
                              <p className="font-bold text-sm">
                                ${task.price.toFixed(2)}
                              </p>
                            )}
                            <Badge variant="outline" className="text-[10px]">
                              {t(`common.${task.status}`)}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t('properties.current_status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t('common.status')}
                </span>
                <Badge
                  variant={
                    property.status === 'occupied' ? 'default' : 'secondary'
                  }
                >
                  {t(`common.${property.status}`)}
                </Badge>
              </div>

              <Separator />

              {activeTenant ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {activeTenant.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {activeTenant.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activeTenant.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-xs text-muted-foreground block">
                        Check-in
                      </span>
                      <span className="font-medium">
                        {activeTenant.leaseStart
                          ? format(
                              new Date(activeTenant.leaseStart),
                              'dd/MM/yy',
                            )
                          : '-'}
                      </span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-xs text-muted-foreground block">
                        Check-out
                      </span>
                      <span className="font-medium">
                        {activeTenant.leaseEnd
                          ? format(new Date(activeTenant.leaseEnd), 'dd/MM/yy')
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/20 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {t('common.vacant')}
                  </p>
                </div>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full text-xs h-8">
                    <Clock className="mr-2 h-3 w-3" />{' '}
                    {t('properties.contract_alerts')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('properties.set_alerts')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label>{t('properties.expiration_alert')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          defaultValue={
                            localProperty?.contractConfig
                              ?.expirationAlertDays || 30
                          }
                          id="alertDays"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {t('properties.days_before')}
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('properties.renewal_date')}</Label>
                      <Input
                        type="date"
                        defaultValue={
                          localProperty?.contractConfig?.renewalAlertDate || ''
                        }
                        id="renewalDate"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        const days = parseInt(
                          (
                            document.getElementById(
                              'alertDays',
                            ) as HTMLInputElement
                          ).value,
                        )
                        const date = (
                          document.getElementById(
                            'renewalDate',
                          ) as HTMLInputElement
                        ).value
                        handleConfigureAlerts(days, date)
                      }}
                    >
                      {t('common.save')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('properties.owner')}</CardTitle>
            </CardHeader>
            <CardContent>
              {owner ? (
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border group hover:bg-muted/40 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {owner.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{owner.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {owner.email}
                    </p>
                  </div>
                  <Link to={`/owners/${owner.id}`}>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-3 text-sm text-muted-foreground border rounded-lg">
                  {t('properties.not_assigned')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('properties.agent')}</CardTitle>
            </CardHeader>
            <CardContent>
              {agent ? (
                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {agent.companyName}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 text-sm text-muted-foreground border rounded-lg">
                  {t('properties.not_assigned')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
