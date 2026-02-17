import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  BarChart2,
  Calendar,
} from 'lucide-react'
import useManagementStore from '@/stores/useManagementStore'
import useShortTermStore from '@/stores/useShortTermStore'
import { useToast } from '@/hooks/use-toast'
import { GuestService, ServiceOrder } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceProfitabilityReport } from '@/components/financial/ServiceProfitabilityReport'
import { ServiceDialog } from '@/components/services/ServiceDialog'
import { ScheduleServiceDialog } from '@/components/services/ScheduleServiceDialog'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'

export default function GuestServices() {
  const {
    guestServices,
    addGuestService,
    updateGuestService,
    deleteGuestService,
    addServiceOrder,
  } = useManagementStore()
  const { bookings } = useShortTermStore()
  const { toast } = useToast()
  const { t, language } = useLanguageStore()

  // State
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<GuestService | null>(
    null,
  )
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

  const handleSaveService = (service: Partial<GuestService>) => {
    if (editingService) {
      updateGuestService({ ...editingService, ...service } as GuestService)
      toast({ title: t('guest_services.save_success') })
    } else {
      addGuestService({
        ...service,
        id: `svc-${Date.now()}`,
        active: true,
      } as GuestService)
      toast({ title: t('guest_services.save_success') })
    }
    setEditingService(null)
  }

  const handleDeleteService = (id: string) => {
    if (confirm(t('common.delete_title'))) {
      deleteGuestService(id)
      toast({ title: t('common.success') })
    }
  }

  const handleScheduleService = (order: ServiceOrder) => {
    addServiceOrder(order)
    toast({
      title: t('guest_services.service_assigned'),
      description: `${order.serviceName} - ${t('common.scheduled')}`,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('guest_services.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('guest_services.subtitle')}
          </p>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">
            {t('guest_services.manage_services')}
          </TabsTrigger>
          <TabsTrigger value="financials">
            <BarChart2 className="h-4 w-4 mr-2" />{' '}
            {t('guest_services.financial_insights')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setScheduleDialogOpen(true)}
            >
              <ShoppingCart className="h-4 w-4" />{' '}
              {t('guest_services.schedule')}
            </Button>

            <Button
              className="bg-trust-blue gap-2"
              onClick={() => {
                setEditingService(null)
                setServiceDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> {t('guest_services.new_service')}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('guest_services.service_name')}</TableHead>
                    <TableHead>{t('guest_services.category')}</TableHead>
                    <TableHead>{t('guest_services.price')}</TableHead>
                    <TableHead>{t('guest_services.validity_start')}</TableHead>
                    <TableHead>
                      {t('guest_services.seasonal_pricing')}
                    </TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div>
                          <DataMask>{service.name}</DataMask>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <DataMask>{service.description}</DataMask>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {service.category}
                      </TableCell>
                      <TableCell>
                        <DataMask>
                          {formatCurrency(service.price, language)}
                        </DataMask>
                      </TableCell>
                      <TableCell>{service.validityStart || '-'}</TableCell>
                      <TableCell>
                        {service.seasonalPrices &&
                        service.seasonalPrices.length > 0 ? (
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {service.seasonalPrices.length}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={service.active ? 'default' : 'secondary'}
                          className={service.active ? 'bg-green-600' : ''}
                        >
                          {service.active
                            ? t('common.active')
                            : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingService(service)
                              setServiceDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <ServiceProfitabilityReport />
        </TabsContent>
      </Tabs>

      <ServiceDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        onSave={handleSaveService}
        service={editingService}
      />

      <ScheduleServiceDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSave={handleScheduleService}
        services={guestServices}
        bookings={bookings}
      />
    </div>
  )
}
