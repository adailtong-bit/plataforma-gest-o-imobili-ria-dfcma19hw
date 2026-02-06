import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useTaskStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useTaskStore must be used within AppProvider')

  return {
    tasks: context.tasks,
    updateTaskStatus: context.updateTaskStatus,
    updateTask: context.updateTask,
    addTask: context.addTask,
    deleteTask: context.deleteTask,
    approveTask: context.approveTask,
    rejectTask: context.rejectTask,
    addTaskImage: context.addTaskImage,
    addTaskEvidence: context.addTaskEvidence,
    notifySupplier: context.notifySupplier,
  }
}

export default useTaskStore
