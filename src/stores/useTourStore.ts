import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useTourStore = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useTourStore must be used within AppProvider')

  return {
    isTourOpen: context.isTourOpen,
    currentStepIndex: context.currentStepIndex,
    tourSteps: context.tourSteps,
    tutorialModules: context.tutorialModules,
    activeVideo: context.activeVideo,
    startTour: context.startTour,
    endTour: context.endTour,
    nextStep: context.nextStep,
    prevStep: context.prevStep,
    openVideo: context.openVideo,
    closeVideo: context.closeVideo,
  }
}

export default useTourStore
