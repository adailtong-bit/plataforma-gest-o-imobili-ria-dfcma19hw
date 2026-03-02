import { useState, useEffect } from 'react'

let listeners = new Set<(state: any) => void>()

let state = {
  isTourOpen: false,
  currentStepIndex: 0,
  tourSteps: [] as any[],
}

export const useTourStore = () => {
  const [localState, setLocalState] = useState(state)

  useEffect(() => {
    listeners.add(setLocalState)
    return () => {
      listeners.delete(setLocalState)
    }
  }, [])

  const updateState = (newState: Partial<typeof state>) => {
    state = { ...state, ...newState }
    listeners.forEach((l) => l(state))
  }

  return {
    ...localState,
    startTour: (steps: any[]) =>
      updateState({ isTourOpen: true, currentStepIndex: 0, tourSteps: steps }),
    endTour: () => updateState({ isTourOpen: false, currentStepIndex: 0 }),
    nextStep: () => {
      if (state.currentStepIndex < state.tourSteps.length - 1) {
        updateState({ currentStepIndex: state.currentStepIndex + 1 })
      } else {
        updateState({ isTourOpen: false, currentStepIndex: 0 })
      }
    },
    prevStep: () => {
      if (state.currentStepIndex > 0) {
        updateState({ currentStepIndex: state.currentStepIndex - 1 })
      }
    },
  }
}

export default useTourStore
