import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useTaskStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useTaskStore must be used within AppProvider')

  return {
    tasks: context.tasks,
    updateTaskStatus: context.updateTaskStatus,
    addTask: context.addTask,
    addTaskImage: context.addTaskImage,
  }
}

export default useTaskStore
