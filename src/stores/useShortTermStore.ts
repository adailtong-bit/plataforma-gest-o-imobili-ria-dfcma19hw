import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useShortTermStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useShortTermStore must be used within AppProvider')

  return {
    bookings: context.bookings,
    addBooking: context.addBooking,
    updateBooking: context.updateBooking,
    deleteBooking: context.deleteBooking,
  }
}

export default useShortTermStore
