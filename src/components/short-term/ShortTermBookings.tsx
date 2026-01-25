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
  Copy,
  Info,
  CheckCircle,
  LogOut,
  CheckSquare,
  FileText,
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
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { InventoryInspectionModal } from '@/components/inventory/InventoryInspectionModal'
import { InventoryReportViewer } from '@/components/inventory/InventoryReportViewer'

export function ShortTermBookings() {
  const { bookings, messageTemplates, updateBooking } = useShortTermStore()
  const { properties } = usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { toast } = useToast()

  const [filter, setFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [previewMessage, setPreviewMessage] = useState('')
  const [selectedTemplateName, setSelectedTemplateName] = useState('')

  // Inspection State
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false)
  const [inspectionAction, setInspectionAction] = useState<
    'check_in' | 'check_out' | null
  >(null)

  // Report Viewer State
  const [reportViewerOpen, setReportViewerOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] =
    useState<InventoryInspection | null>(null)

  const filteredBookings = bookings.filter(
    (b) =>
      (b.guestName.toLowerCase().includes(filter.toLowerCase()) ||
        properties
          .find((p) => p.id === b.propertyId)
          ?.name.toLowerCase()
          .includes(filter.toLowerCase())) &&
      (sourceFilter === 'all' || b.platform === sourceFilter),
  )

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
    // Existing single braces
    text = text.replace(/{GuestName}/g, booking.guestName)
    text = text.replace(
      /{CheckInDate}/g,
      format(parseISO(booking.checkIn), 'dd/MM/yyyy'),
    )
    text = text.replace(
      /{CheckOutDate}/g,
      format(parseISO(booking.checkOut), 'dd/MM/yyyy'),
    )

    // New double braces support
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
    setPreviewMessage(content)
    setSelectedTemplateName(template.name)
  }

  const handleGenerateAccessInfo = () => {
    if (!selectedBooking) return
    const prop = properties.find((p) => p.id === selectedBooking.propertyId)
    const condo = condominiums.find((c) => c.id === prop?.condominiumId)

    const accessTemplate = `Hello {GuestName},

Here is everything you need for your check-in at {{property_address}}:

🏢 **Building/Gate Code:** {{condo_code}}
🚪 **Door Code:** {{door_code}}
🏊 **Pool Access:** {{pool_code}}

Enjoy your stay!`

    const content = replacePlaceholders(
      accessTemplate,
      selectedBooking,
      prop,
      condo,
    )
    setPreviewMessage(content)
    setSelectedTemplateName('Access Info (Auto-Generated)')
  }

  const handleSendMessage = () => {
    toast({
      title: 'Message Sent',
      description: `"${selectedTemplateName}" sent to ${selectedBooking?.guestName}`,
    })
    setMessageDialogOpen(false)
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
    // Only allowed for short term check-out per requirements
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
            placeholder="Search guest or property..."
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
              <SelectItem value="all">All Sources</SelectItem>
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
              <TableHead>Property</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No bookings found.
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
                    <TableCell className="font-medium">{prop?.name}</TableCell>
                    <TableCell>{booking.guestName}</TableCell>
                    <TableCell className="text-xs">
                      {format(parseISO(booking.checkIn), 'MMM dd')} -{' '}
                      {format(parseISO(booking.checkOut), 'MMM dd')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.platform}</Badge>
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
                            onClick={() => {
                              setSelectedBooking(booking)
                              setPreviewMessage('')
                              setSelectedTemplateName('')
                              setMessageDialogOpen(true)
                            }}
                          >
                            <Send className="mr-2 h-4 w-4" /> Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking)
                              handleGenerateAccessInfo()
                              setMessageDialogOpen(true)
                            }}
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

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Send Message to {selectedBooking?.guestName}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {!previewMessage ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Select a template to generate the message:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="justify-start bg-blue-50 hover:bg-blue-100 border-blue-200"
                    onClick={handleGenerateAccessInfo}
                  >
                    <Key className="mr-2 h-4 w-4 text-blue-600" />
                    Access Info (Auto)
                  </Button>
                  {messageTemplates.map((tmpl) => (
                    <Button
                      key={tmpl.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => handleSelectTemplate(tmpl)}
                    >
                      {tmpl.name}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md border text-sm whitespace-pre-wrap font-mono">
                  {previewMessage}
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3" /> Note: Placeholders have been
                    replaced with actual property data.
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPreviewMessage('')
                      setSelectedTemplateName('')
                    }}
                  >
                    Back to Templates
                  </Button>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setMessageDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage} className="bg-trust-blue">
                    <Send className="mr-2 h-4 w-4" /> Send Message
                  </Button>
                </div>
              </div>
            )}
          </div>
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
          // Short-term check-out can be skipped (optional)
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
