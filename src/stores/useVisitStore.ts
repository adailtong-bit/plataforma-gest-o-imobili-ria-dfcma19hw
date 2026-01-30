import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useVisitStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useVisitStore must be used within AppProvider')

  return {
    visits: context.visits,
    addVisit: context.addVisit,
    updateVisit: context.updateVisit,
    deleteVisit: context.deleteVisit,
  }
}

export default useVisitStore
