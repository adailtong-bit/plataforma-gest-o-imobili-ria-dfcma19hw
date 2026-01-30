import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  MoreHorizontal,
  Send,
  Filter,
  Key,
  Info,
  CheckCircle,
  LogOut,
  FileText,
  Mail,
} from 'lucide-react'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import {
  Booking,
  MessageTemplate,
  Property,
  Condominium,
  InventoryInspection,
} from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { InventoryInspectionModal } from '@/components/inventory/InventoryInspectionModal'
import { InventoryReportViewer } from '@/components/inventory/InventoryReportViewer'
import { DataMask } from '@/components/DataMask'
import useLanguageStore from '@/stores/useLanguageStore'

export function ShortTermBookings() {
  const { bookings, messageTemplates, updateBooking } = useShortTermStore()
  const { properties } = usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [filter, setFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailContent, setEmailContent] = useState('')
  const [appendDetails, setAppendDetails] = useState(false)
  const [selectedTemplateName, setSelectedTemplateName] = useState('')

  const [inspectionModalOpen, setInspectionModalOpen] = useState(false)
  const [inspectionAction, setInspectionAction] = useState<
    'check_in' | 'check_out' | null
  >(null)

  const [reportViewerOpen, setReportViewerOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] =
    useState<InventoryInspection | null>(null)

  const filteredBookings = bookings.filter((b) => {
    const prop = properties.find((p) => p.id === b.propertyId)
    if (prop?.profileType !== 'short_term') return false

    return (
      (b.guestName.toLowerCase().includes(filter.toLowerCase()) ||
        (prop?.name || '').toLowerCase().includes(filter.toLowerCase())) &&
      (sourceFilter === 'all' || b.platform === sourceFilter)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'checked_in':
        return 'bg-green-100 text-green-800'
      case 'checked_out':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100'
    }
  }

  const replacePlaceholders = (
    content: string,
    booking: Booking,
    property: Property | undefined,
    condo: Condominium | undefined,
  ) => {
    let text = content
    text = text.replace(/{GuestName}/g, booking.guestName)
    text = text.replace(
      /{CheckInDate}/g,
      format(parseISO(booking.checkIn), 'dd/MM/yyyy'),
    )
    text = text.replace(
      /{CheckOutDate}/g,
      format(parseISO(booking.checkOut), 'dd/MM/yyyy'),
    )

    text = text.replace(
      /{{property_address}}/g,
      property?.address || 'Address Not Available',
    )
    text = text.replace(
      /{{door_code}}/g,
      property?.accessCodeUnit || 'Code Not Available',
    )
    text = text.replace(
      /{{condo_code}}/g,
      property?.accessCodeBuilding || 'Code Not Available',
    )

    const poolCode =
      property?.accessCodePool || condo?.accessCredentials?.poolCode

    if (poolCode) {
      text = text.replace(/{{pool_code}}/g, poolCode)
    } else {
      const lineRegex = /^.*{{pool_code}}.*$/gm
      text = text.replace(lineRegex, '')
      text = text.replace(/{{pool_code}}/g, '')
    }

    if (!property?.accessCodeBuilding) {
      const lineRegex = /^.*{{condo_code}}.*$/gm
      text = text.replace(lineRegex, '')
      text = text.replace(/{{condo_code}}/g, '')
    }

    return text.replace(/\n{3,}/g, '\n\n').trim()
  }

  const handleSelectTemplate = (template: MessageTemplate) => {
    if (!selectedBooking) return
    const prop = properties.find((p) => p.id === selectedBooking.propertyId)
    const condo = condominiums.find((c) => c.id === prop?.condominiumId)

    const content = replacePlaceholders(
      template.content,
      selectedBooking,
      prop,
      condo,
    )
    setEmailContent(content)
    setSelectedTemplateName(template.name)
  }

  const openEmailModal = (booking: Booking, template?: string) => {
    setSelectedBooking(booking)
    setAppendDetails(false)
    setSelectedTemplateName('')

    if (template === 'access_info') {
      const prop = properties.find((p) => p.id === booking.propertyId)
      const condo = condominiums.find((c) => c.id === prop?.condominiumId)
      const accessTemplate = `Hello {GuestName},\n\nHere is everything you need for your check-in at {{property_address}}:\n\nEnjoy your stay!`
      setEmailContent(replacePlaceholders(accessTemplate, booking, prop, condo))
      setAppendDetails(true)
    } else {
      setEmailContent(`Hello ${booking.guestName},\n\n`)
    }

    setEmailModalOpen(true)
  }

  const handleSendEmail = () => {
    if (!selectedBooking) return

    let finalBody = emailContent

    if (appendDetails) {
      const prop = properties.find((p) => p.id === selectedBooking.propertyId)
      const details = `\n\n----------------------------------\nReservation Details:\nCheck-in: ${format(parseISO(selectedBooking.checkIn), 'MMM dd, yyyy')}\nCheck-out: ${format(parseISO(selectedBooking.checkOut), 'MMM dd, yyyy')}\nAccess Code: ${prop?.accessCodeUnit || 'N/A'}\nAddress: ${prop?.address || 'N/A'}`
      finalBody += details
    }

    toast({
      title: 'Email Sent Successfully',
      description: `Message sent to ${selectedBooking.guestEmail}`,
    })

    setEmailModalOpen(false)
  }

  const initiateCheckIn = (booking: Booking) => {
    setSelectedBooking(booking)
    setInspectionAction('check_in')
    setInspectionModalOpen(true)
  }

  const initiateCheckOut = (booking: Booking) => {
    setSelectedBooking(booking)
    setInspectionAction('check_out')
    setInspectionModalOpen(true)
  }

  const handleInspectionSave = (inspection: InventoryInspection) => {
    if (!selectedBooking) return

    const updatedInspections = [
      ...(selectedBooking.inspections || []),
      inspection,
    ]
    const updatedStatus =
      inspectionAction === 'check_in' ? 'checked_in' : 'checked_out'

    updateBooking({
      ...selectedBooking,
      status: updatedStatus,
      inspections: updatedInspections,
    })

    toast({
      title:
        inspectionAction === 'check_in'
          ? 'Check-in Completed'
          : 'Check-out Completed',
      description: 'Inventory inspection recorded successfully.',
    })
    setInspectionModalOpen(false)
  }

  const handleInspectionSkip = () => {
    if (!selectedBooking) return
    const updatedStatus =
      inspectionAction === 'check_in' ? 'checked_in' : 'checked_out'

    updateBooking({
      ...selectedBooking,
      status: updatedStatus,
    })

    toast({
      title: 'Status Updated',
      description: `Guest marked as ${updatedStatus.replace('_', ' ')} (Inspection Skipped).`,
    })
    setInspectionModalOpen(false)
  }

  const viewInspectionReport = (
    booking: Booking,
    type: 'check_in' | 'check_out',
  ) => {
    const inspection = booking.inspections?.find((i) => i.type === type)
    if (inspection) {
      setSelectedInspection(inspection)
      setReportViewerOpen(true)
    } else {
      toast({
        title: 'No Report',
        description: 'Inspection record not found.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-[200px]">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Source" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="airbnb">Airbnb</SelectItem>
              <SelectItem value="vrbo">Vrbo</SelectItem>
              <SelectItem value="booking.com">Booking.com</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('properties.title')}</TableHead>
              <TableHead>{t('short_term.guest')}</TableHead>
              <TableHead>{t('common.date')}</TableHead>
              <TableHead>{t('short_term.platform')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead>{t('short_term.total')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => {
                const prop = properties.find((p) => p.id === booking.propertyId)
                const hasCheckInReport = booking.inspections?.some(
                  (i) => i.type === 'check_in',
                )
                const hasCheckOutReport = booking.inspections?.some(
                  (i) => i.type === 'check_out',
                )

                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      <DataMask>{prop?.name}</DataMask>
                    </TableCell>
                    <TableCell>
                      <DataMask>{booking.guestName}</DataMask>
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(parseISO(booking.checkIn), 'MMM dd')} -{' '}
                      {format(parseISO(booking.checkOut), 'MMM dd')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <DataMask>{booking.platform}</DataMask>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(booking.status)}
                        variant="outline"
                      >
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {booking.status === 'confirmed' && (
                            <DropdownMenuItem
                              onClick={() => initiateCheckIn(booking)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />{' '}
                              Check-in Guest
                            </DropdownMenuItem>
                          )}
                          {booking.status === 'checked_in' && (
                            <DropdownMenuItem
                              onClick={() => initiateCheckOut(booking)}
                            >
                              <LogOut className="mr-2 h-4 w-4 text-orange-600" />{' '}
                              Check-out Guest
                            </DropdownMenuItem>
                          )}

                          {(hasCheckInReport || hasCheckOutReport) && (
                            <DropdownMenuSeparator />
                          )}

                          {hasCheckInReport && (
                            <DropdownMenuItem
                              onClick={() =>
                                viewInspectionReport(booking, 'check_in')
                              }
                            >
                              <FileText className="mr-2 h-4 w-4" /> View
                              Check-in Report
                            </DropdownMenuItem>
                          )}
                          {hasCheckOutReport && (
                            <DropdownMenuItem
                              onClick={() =>
                                viewInspectionReport(booking, 'check_out')
                              }
                            >
                              <FileText className="mr-2 h-4 w-4" /> View
                              Check-out Report
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openEmailModal(booking)}
                          >
                            <Mail className="mr-2 h-4 w-4" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              openEmailModal(booking, 'access_info')
                            }
                          >
                            <Key className="mr-2 h-4 w-4" /> Send Access Info
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Send Email to {selectedBooking?.guestName}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label className="mb-2 block">Use Template (Optional)</Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {messageTemplates.map((tmpl) => (
                  <Button
                    key={tmpl.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectTemplate(tmpl)}
                  >
                    {tmpl.name}
                  </Button>
                ))}
              </div>
              <Label>Email Content</Label>
              <Textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="h-48 font-mono mt-1.5"
                placeholder="Write your message here..."
              />
            </div>

            <div className="flex items-center space-x-2 bg-muted p-4 rounded-md">
              <Switch
                id="append-details"
                checked={appendDetails}
                onCheckedChange={setAppendDetails}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="append-details">
                  Append Reservation Details automatically
                </Label>
                <p className="text-xs text-muted-foreground">
                  Includes Check-in/out dates and Access Codes at the bottom of
                  the email.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" /> Sending to:{' '}
                {selectedBooking?.guestEmail}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} className="bg-trust-blue gap-2">
              <Send className="h-4 w-4" /> Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedBooking && inspectionAction && (
        <InventoryInspectionModal
          isOpen={inspectionModalOpen}
          onClose={() => setInspectionModalOpen(false)}
          onSave={handleInspectionSave}
          onSkip={handleInspectionSkip}
          propertyId={selectedBooking.propertyId}
          type={inspectionAction}
          title={
            inspectionAction === 'check_in'
              ? 'Guest Check-in Inventory'
              : 'Guest Check-out Inventory'
          }
          performedBy="Manager"
          isOptional={inspectionAction === 'check_out'}
        />
      )}

      <InventoryReportViewer
        isOpen={reportViewerOpen}
        onClose={() => setReportViewerOpen(false)}
        inspection={selectedInspection}
        title={
          selectedInspection
            ? `${selectedInspection.type === 'check_in' ? 'Check-in' : 'Check-out'} Report`
            : undefined
        }
      />
    </div>
  )
}
