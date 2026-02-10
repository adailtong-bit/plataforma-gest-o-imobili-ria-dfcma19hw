import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'

export function ShortTermCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <div className="flex justify-center border rounded-md p-4 bg-white">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    </div>
  )
}
