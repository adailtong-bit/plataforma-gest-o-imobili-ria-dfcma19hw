import { useEffect, useState, useRef } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import useTourStore from '@/stores/useTourStore'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function TourGuide() {
  const {
    isTourOpen,
    currentStepIndex,
    tourSteps,
    nextStep,
    prevStep,
    endTour,
  } = useTourStore()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const currentStep = tourSteps[currentStepIndex]

  // Update target rect on step change or resize
  useEffect(() => {
    if (!isTourOpen || !currentStep) return

    const updateRect = () => {
      if (currentStep.targetId === 'center') {
        setTargetRect(null)
        return
      }
      const element = document.getElementById(currentStep.targetId)
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        // Scroll into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        // If element not found, fallback to center or skip
        setTargetRect(null)
      }
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [isTourOpen, currentStep])

  if (!isTourOpen || !currentStep) return null

  // Styles for the highlight box
  const highlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: targetRect.top - 4,
        left: targetRect.left - 4,
        width: targetRect.width + 8,
        height: targetRect.height + 8,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        zIndex: 50,
        borderRadius: '6px',
        transition: 'all 0.3s ease',
        pointerEvents: 'none', // Allow clicks to pass through if needed, but usually blocked during tour
      }
    : {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 50,
      }

  // Calculate Popover Position
  const popoverStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: targetRect.bottom + 16,
        left: targetRect.left,
        zIndex: 51,
        width: '320px',
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 51,
        width: '400px',
      }

  // Adjust for edges (simple logic)
  if (targetRect && targetRect.left + 320 > window.innerWidth) {
    popoverStyle.left = 'auto'
    popoverStyle.right = 16
  }
  if (targetRect && targetRect.bottom + 200 > window.innerHeight) {
    popoverStyle.top = 'auto'
    popoverStyle.bottom = window.innerHeight - targetRect.top + 16
  }

  const isLastStep = currentStepIndex === tourSteps.length - 1

  return createPortal(
    <>
      <div style={highlightStyle} />
      <Card style={popoverStyle} className="shadow-2xl border-2 border-primary">
        <CardHeader className="relative pb-2">
          <CardTitle className="text-lg">{currentStep.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => endTour()}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm text-foreground">
            {currentStep.content}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="text-xs text-muted-foreground self-center">
            {currentStepIndex + 1} / {tourSteps.length}
          </div>
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                Previous
              </Button>
            )}
            <Button
              size="sm"
              onClick={nextStep}
              className="bg-primary text-primary-foreground"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>,
    document.body,
  )
}
