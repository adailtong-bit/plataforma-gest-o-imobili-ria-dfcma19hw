import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import useLanguageStore from '@/stores/useLanguageStore'
import { ptBR, es, enUS } from 'date-fns/locale'

export function ShortTermCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { language } = useLanguageStore()

  const localeMap = {
    pt: ptBR,
    es: es,
    en: enUS,
  }

  return (
    <div className="flex justify-center border rounded-md p-4 bg-white">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
        locale={localeMap[language]}
      />
    </div>
  )
}
