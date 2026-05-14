import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import useLanguageStore from '@/stores/useLanguageStore'
import { ptBR, es, enUS } from 'date-fns/locale'

interface Props {
  propertyId?: string
}

export function ShortTermCalendar({ propertyId }: Props = {}) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { language } = useLanguageStore()

  const localeMap = {
    pt: ptBR,
    es: es,
    en: enUS,
  }

  // Generate some stable fake booked dates based on propertyId if provided
  const bookedDates = propertyId
    ? [
        new Date(new Date().setDate(new Date().getDate() + 2)),
        new Date(new Date().setDate(new Date().getDate() + 3)),
        new Date(new Date().setDate(new Date().getDate() + 4)),
      ]
    : []

  return (
    <div className="flex justify-center border rounded-md p-4 bg-white shadow-sm">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border w-full"
        locale={localeMap[language]}
        modifiers={{
          booked: bookedDates,
        }}
        modifiersStyles={{
          booked: {
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            fontWeight: 'bold',
          },
        }}
      />
    </div>
  )
}
