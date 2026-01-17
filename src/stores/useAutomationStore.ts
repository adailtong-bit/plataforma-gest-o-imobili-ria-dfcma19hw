import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useAutomationStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useAutomationStore must be used within AppProvider')

  return {
    automationRules: context.automationRules,
    updateAutomationRule: context.updateAutomationRule,
  }
}

export default useAutomationStore
