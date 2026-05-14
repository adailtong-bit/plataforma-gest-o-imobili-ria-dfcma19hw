import { useContext, useMemo } from 'react'
import { AppContext } from '@/stores/AppContext'
import { ENV } from '@/lib/env'
import useAuthStore from '@/stores/useAuthStore'

const useShortTermStore = () => {
  const context = useContext(AppContext)
  const { currentUser, simulationMode, simulationRole, allUsers } =
    useAuthStore()

  if (!context)
    throw new Error('useShortTermStore must be used within AppProvider')

  const bookings = useMemo(() => {
    let targetUserId = currentUser?.id
    if (simulationMode && simulationRole === 'property_owner') {
      const firstOwner = allUsers.find((u) => u.role === 'property_owner')
      if (firstOwner) targetUserId = firstOwner.id
    }

    if (ENV.isDev && targetUserId) {
      const mockPropId = `dev_mock_prop_${targetUserId}`
      const mockBookings = [
        {
          id: `dev_mock_bkg_1`,
          propertyId: mockPropId,
          propertyName: '[DEV Sandbox] Oceanfront Villa',
          guestName: '[DEV] John Doe',
          guestEmail: 'john@example.com',
          checkIn: new Date(Date.now() - 86400000 * 5).toISOString(),
          checkOut: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: 'checked_out',
          totalAmount: 1800,
          baseAmount: 1800,
          paid: true,
          platform: 'airbnb',
        },
        {
          id: `dev_mock_bkg_2`,
          propertyId: mockPropId,
          propertyName: '[DEV Sandbox] Oceanfront Villa',
          guestName: '[DEV] Alice Smith',
          guestEmail: 'alice@example.com',
          checkIn: new Date(Date.now() + 86400000 * 2).toISOString(),
          checkOut: new Date(Date.now() + 86400000 * 7).toISOString(),
          status: 'confirmed',
          totalAmount: 2500,
          baseAmount: 2500,
          paid: false,
          platform: 'vrbo',
        },
      ] as any[]

      const filtered = context.bookings.filter(
        (b) => !b.id.startsWith('dev_mock_'),
      )
      return [...filtered, ...mockBookings]
    }
    return context.bookings
  }, [context.bookings, currentUser, simulationMode, simulationRole, allUsers])

  return {
    bookings,
    addBooking: context.addBooking,
    updateBooking: context.updateBooking,
    deleteBooking: context.deleteBooking,
  }
}

export default useShortTermStore
