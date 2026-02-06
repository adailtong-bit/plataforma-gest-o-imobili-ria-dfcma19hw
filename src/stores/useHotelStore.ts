import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useHotelStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useHotelStore must be used within AppProvider')

  return {
    hotels: context.hotels,
    towers: context.towers,
    addHotel: context.addHotel,
    updateHotel: context.updateHotel,
    deleteHotel: context.deleteHotel,
    addTower: context.addTower,
    updateTower: context.updateTower,
    deleteTower: context.deleteTower,
  }
}

export default useHotelStore
