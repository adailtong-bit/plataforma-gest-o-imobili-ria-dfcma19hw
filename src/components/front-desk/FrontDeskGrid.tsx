import { useState } from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookingModal } from './BookingModal'
import { cn } from '@/lib/utils'

export function FrontDeskGrid({
  properties,
  bookings,
  startDate,
  onRefresh,
}: any) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<any>(null)

  const days = Array.from({ length: 14 }).map((_, i) => addDays(startDate, i))

  const handleCellClick = (prop: any, date: Date, existingBooking: any) => {
    if (existingBooking) {
      setSelectedCell({ property: prop, date, booking: existingBooking })
    } else {
      setSelectedCell({ property: prop, date, booking: null })
    }
    setModalOpen(true)
  }

  return (
    <div className="border rounded-md bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3 font-semibold text-slate-700 sticky left-0 bg-slate-50 z-20 w-48 border-r shadow-[1px_0_0_0_#e2e8f0]">
                Quarto / Andar
              </th>
              {days.map((d) => (
                <th
                  key={d.toISOString()}
                  className="p-3 font-semibold text-slate-700 min-w-[100px] text-center border-r"
                >
                  <div className="capitalize">
                    {format(d, 'EEE', { locale: ptBR })}
                  </div>
                  <div className="text-xs text-slate-500 font-normal">
                    {format(d, 'dd/MM')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map((p: any) => (
              <tr
                key={p.id}
                className="border-b last:border-0 hover:bg-slate-50/50"
              >
                <td className="p-3 sticky left-0 bg-white z-10 border-r shadow-[1px_0_0_0_#e2e8f0] group">
                  <div className="font-bold text-slate-900">
                    {p.room_number || p.name || 'S/N'}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Andar {p.floor || '-'}
                  </div>
                </td>
                {days.map((d) => {
                  const currentDay = startOfDay(d)
                  const booking = bookings.find(
                    (b: any) =>
                      b.property_id === p.id &&
                      b.status !== 'cancelled' &&
                      startOfDay(new Date(b.check_in)) <= currentDay &&
                      startOfDay(new Date(b.check_out)) > currentDay,
                  )

                  return (
                    <td
                      key={d.toISOString()}
                      onClick={() => handleCellClick(p, d, booking)}
                      className={cn(
                        'p-1 border-r cursor-pointer transition-colors relative min-h-[60px]',
                        booking
                          ? 'bg-indigo-50/50 hover:bg-indigo-100/50'
                          : 'hover:bg-slate-100/50',
                      )}
                    >
                      {booking && (
                        <div className="absolute inset-1.5 bg-indigo-600 text-white rounded-md text-xs p-1.5 overflow-hidden shadow-sm flex flex-col justify-center">
                          <span className="font-semibold truncate">
                            {booking.guests?.name || 'Reservado'}
                          </span>
                          <span className="text-[10px] opacity-80 capitalize truncate">
                            {booking.origin}
                          </span>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td
                  colSpan={15}
                  className="p-8 text-center text-slate-500 font-medium"
                >
                  Nenhum quarto encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedCell && (
        <BookingModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          initialData={selectedCell}
          onSuccess={() => {
            setModalOpen(false)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}
