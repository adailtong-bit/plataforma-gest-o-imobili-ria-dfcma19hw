import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useTaskStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useTaskStore must be used within AppProvider')

  return {
    tasks: context.tasks,
    addTask: context.addTask,
    updateTask: context.updateTask,
    deleteTask: context.deleteTask,
    updateTaskStatus: context.updateTaskStatus,
    approveTask: context.approveTask,
    rejectTask: context.rejectTask,
    addTaskImage: context.addTaskImage,
    addTaskEvidence: context.addTaskEvidence,
  }
}

export default useTaskStore
