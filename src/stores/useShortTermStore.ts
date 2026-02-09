import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useShortTermStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useShortTermStore must be used within AppProvider')

  // Helper method to simulate check-in
  const performCheckIn = (
    bookingId: string,
    data: { signature: string; arrivalTime: string },
  ) => {
    const booking = context.bookings.find((b) => b.id === bookingId)
    if (booking) {
      context.updateBooking({
        ...booking,
        status: 'checked_in',
        checkedInAt: new Date().toISOString(),
        guestSignature: data.signature,
        estimatedArrival: data.arrivalTime,
      })

      // Trigger 'before_checkin' actually happens before, but for demo we might assume checkin triggers arrival workflows
      // Or we assume 'after_checkout' is the main one for turnover.
    }
  }

  // Helper method to simulate check-out and trigger cleaning
  const performCheckOut = (bookingId: string) => {
    const booking = context.bookings.find((b) => b.id === bookingId)
    if (booking) {
      // 1. Update Booking
      context.updateBooking({
        ...booking,
        status: 'checked_out',
        checkedOutAt: new Date().toISOString(),
      })

      // 2. Trigger Property Update (Status -> Cleaning)
      const property = context.properties.find(
        (p) => p.id === booking.propertyId,
      )
      if (property) {
        context.updateProperty({ ...property, status: 'cleaning' })

        // 3. Run Automation Workflow for 'after_checkout'
        context.runWorkflows('after_checkout', { booking, property })
      }
    }
  }

  return {
    bookings: context.bookings,
    calendarBlocks: context.calendarBlocks,
    messageTemplates: context.messageTemplates,
    feedbacks: context.feedbacks,
    posTransactions: context.posTransactions, // Exposed for folio
    addBooking: context.addBooking,
    updateBooking: context.updateBooking,
    deleteBooking: context.deleteBooking,
    addCalendarBlock: context.addCalendarBlock,
    deleteCalendarBlock: context.deleteCalendarBlock,
    addMessageTemplate: context.addMessageTemplate,
    updateMessageTemplate: context.updateMessageTemplate,
    deleteMessageTemplate: context.deleteMessageTemplate,
    addFeedback: context.addFeedback,
    updateFeedback: context.updateFeedback,
    performCheckIn,
    performCheckOut,
  }
}

export default useShortTermStore
