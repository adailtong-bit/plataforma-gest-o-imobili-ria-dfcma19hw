import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'
import { addDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Mock events for the selected date
  const events = [
    {
      id: 1,
      title: 'Check-in: Silva Family',
      property: 'Villa Sunshine',
      type: 'check-in',
      time: '16:00',
    },
    {
      id: 2,
      title: 'Limpeza: Cozy Cabin',
      property: 'Cozy Cabin',
      type: 'cleaning',
      time: '11:00',
    },
    {
      id: 3,
      title: 'Check-out: John Smith',
      property: 'Downtown Condo',
      type: 'check-out',
      time: '10:00',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Calendário Unificado
        </h1>
        <p className="text-muted-foreground">
          Visualize ocupação, manutenções e rotinas de limpeza.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Visão Mensal</CardTitle>
              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Check-in
                </Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Ocupado
                </Badge>
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  Manutenção
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6 flex justify-center">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm w-full max-w-full"
              classNames={{
                months:
                  'flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4 w-full',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                row: 'flex w-full mt-2',
                cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 md:h-16 md:w-full',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 md:h-16 md:w-full flex items-start justify-end pr-2 pt-2',
              }}
              modifiers={{
                booked: [
                  addDays(new Date(), 2),
                  addDays(new Date(), 3),
                  addDays(new Date(), 4),
                ],
                maintenance: [addDays(new Date(), 6)],
              }}
              modifiersClassNames={{
                booked: 'bg-green-100 text-green-900 font-bold',
                maintenance: 'bg-orange-100 text-orange-900 font-bold',
              }}
            />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Agenda do Dia</CardTitle>
            <CardDescription>
              {date?.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center w-14 bg-muted rounded-md p-1">
                    <span className="text-sm font-bold">{event.time}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.property}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[10px] h-5">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  Atenção: Back-to-back na Villa Sunshine amanhã!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
