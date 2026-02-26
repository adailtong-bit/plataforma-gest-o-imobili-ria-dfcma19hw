import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
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
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import { Booking } from '@/lib/types'

export default function ShortTerm() {
  const {
    bookings,
    formatAppCurrency,
    addBooking,
    updateBooking,
    deleteBooking,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [form, setForm] = useState({
    guestName: '',
    checkIn: '',
    checkOut: '',
    totalAmount: '',
  })

  const handleAdd = () => {
    addBooking({
      id: `booking-${Date.now()}`,
      propertyId: 'prop1',
      propertyName: 'Nova Propriedade',
      guestName: form.guestName || 'Novo Hóspede',
      guestEmail: 'guest@example.com',
      checkIn: form.checkIn || new Date().toISOString(),
      checkOut: form.checkOut || new Date().toISOString(),
      totalAmount: Number(form.totalAmount) || 0,
      status: 'confirmed',
      paid: false,
      platform: 'direct',
    })
    setIsAddOpen(false)
    setForm({ guestName: '', checkIn: '', checkOut: '', totalAmount: '' })
    toast({ title: 'Reserva incluída com sucesso' })
  }

  const handleEdit = () => {
    if (editingRecord) {
      updateBooking({
        ...editingRecord,
        guestName: form.guestName,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        totalAmount: Number(form.totalAmount),
      })
    }
    setEditingRecord(null)
    toast({ title: 'Reserva alterada com sucesso' })
  }

  const handleDelete = (id: string) => {
    deleteBooking(id)
    toast({ title: 'Reserva excluída com sucesso' })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('common.short_term')}
          </h1>
          <p className="text-muted-foreground">Manage your vacation rentals.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 text-white">
              <Plus className="h-4 w-4" /> Incluir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Incluir Reserva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nome do Hóspede"
                value={form.guestName}
                onChange={(e) =>
                  setForm({ ...form, guestName: e.target.value })
                }
              />
              <Input
                type="date"
                placeholder="Check-In"
                value={form.checkIn}
                onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
              />
              <Input
                type="date"
                placeholder="Check-Out"
                value={form.checkOut}
                onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Valor Total"
                value={form.totalAmount}
                onChange={(e) =>
                  setForm({ ...form, totalAmount: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>{t('common.property')}</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{b.guestName}</DataMask>
                  </TableCell>
                  <TableCell>{b.propertyName}</TableCell>
                  <TableCell>
                    {format(new Date(b.checkIn), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(b.checkOut), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatAppCurrency(b.totalAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingRecord?.id === b.id}
                        onOpenChange={(open) => !open && setEditingRecord(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRecord(b)
                              setForm({
                                guestName: b.guestName,
                                checkIn: b.checkIn.split('T')[0],
                                checkOut: b.checkOut.split('T')[0],
                                totalAmount: b.totalAmount.toString(),
                              })
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" /> Alterar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Alterar Reserva</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input
                              placeholder="Nome do Hóspede"
                              value={form.guestName}
                              onChange={(e) =>
                                setForm({ ...form, guestName: e.target.value })
                              }
                            />
                            <Input
                              type="date"
                              placeholder="Check-In"
                              value={form.checkIn}
                              onChange={(e) =>
                                setForm({ ...form, checkIn: e.target.value })
                              }
                            />
                            <Input
                              type="date"
                              placeholder="Check-Out"
                              value={form.checkOut}
                              onChange={(e) =>
                                setForm({ ...form, checkOut: e.target.value })
                              }
                            />
                            <Input
                              type="number"
                              placeholder="Valor Total"
                              value={form.totalAmount}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  totalAmount: e.target.value,
                                })
                              }
                            />
                          </div>
                          <DialogFooter>
                            <Button onClick={handleEdit}>Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Reserva</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(b.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
