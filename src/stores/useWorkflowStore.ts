import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useWorkflowStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useWorkflowStore must be used within AppProvider')

  return {
    workflows: context.workflows,
    addWorkflow: context.addWorkflow,
    updateWorkflow: context.updateWorkflow,
    deleteWorkflow: context.deleteWorkflow,
    runWorkflows: context.runWorkflows,
  }
}

export default useWorkflowStore
