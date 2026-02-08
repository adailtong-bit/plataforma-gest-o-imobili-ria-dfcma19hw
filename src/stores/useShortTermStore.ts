import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useShortTermStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useShortTermStore must be used within AppProvider')

  return {
    bookings: context.bookings,
    calendarBlocks: context.calendarBlocks,
    messageTemplates: context.messageTemplates,
    feedbacks: context.feedbacks, // Added feedback
    addBooking: context.addBooking,
    updateBooking: context.updateBooking,
    deleteBooking: context.deleteBooking,
    addCalendarBlock: context.addCalendarBlock,
    deleteCalendarBlock: context.deleteCalendarBlock,
    addMessageTemplate: context.addMessageTemplate,
    updateMessageTemplate: context.updateMessageTemplate,
    deleteMessageTemplate: context.deleteMessageTemplate,
    addFeedback: context.addFeedback, // Added method
    updateFeedback: context.updateFeedback, // Added method
  }
}

export default useShortTermStore
