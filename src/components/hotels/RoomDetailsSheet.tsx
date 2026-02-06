import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Property } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BedDouble, Armchair, Move, Check, History } from 'lucide-react'
import { format } from 'date-fns'

interface RoomDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Property | null
}

export function RoomDetailsSheet({
  open,
  onOpenChange,
  room,
}: RoomDetailsSheetProps) {
  if (!room) return null

  const characteristics = room.roomCharacteristics

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl flex items-center gap-2">
            Room {room.roomNumber}
            <Badge variant="outline" className="ml-2">
              {room.status}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            {room.name} - Detailed Information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Characteristics */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 mb-3">
              Unit Characteristics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-slate-500" />
                <span className="text-muted-foreground">Bed Type:</span>
                <span className="font-medium">
                  {characteristics?.bedType || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Armchair className="h-4 w-4 text-slate-500" />
                <span className="text-muted-foreground">View:</span>
                <span className="font-medium">
                  {characteristics?.view || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4 text-slate-500" />
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">
                  {characteristics?.sizeSqFt
                    ? `${characteristics.sizeSqFt} sq ft`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-500" />
                <span className="text-muted-foreground">Balcony:</span>
                <span className="font-medium">
                  {characteristics?.hasBalcony ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Pricing */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Current Nightly Rate
              </span>
              <span className="text-xl font-bold text-green-700">
                ${room.listingPrice}
              </span>
            </div>
          </div>

          {/* Price History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Price History
              </h3>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8">Date</TableHead>
                    <TableHead className="h-8">Price</TableHead>
                    <TableHead className="h-8">By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!room.priceHistory || room.priceHistory.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-xs text-muted-foreground py-4"
                      >
                        No history recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    room.priceHistory.map((hist, i) => (
                      <TableRow key={i}>
                        <TableCell className="py-2 text-xs">
                          {format(new Date(hist.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="py-2 text-xs font-medium">
                          ${hist.price}
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {hist.changedBy || 'System'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
