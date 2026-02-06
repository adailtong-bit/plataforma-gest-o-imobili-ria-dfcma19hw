import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'
import useTourStore from '@/stores/useTourStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useLanguageStore from '@/stores/useLanguageStore'

interface VideoHelpButtonProps {
  moduleKey: string
  className?: string
}

export function VideoHelpButton({
  moduleKey,
  className,
}: VideoHelpButtonProps) {
  const { openVideo, activeVideo, closeVideo, tutorialModules } = useTourStore()
  const { t } = useLanguageStore()

  const moduleData = tutorialModules.find((m) => m.key === moduleKey)

  if (!moduleData) return null

  // Check if this specific video is active
  const isOpen = activeVideo === moduleData.videoUrl

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 ${className}`}
        onClick={() => openVideo(moduleData.videoUrl)}
      >
        <PlayCircle className="h-4 w-4" /> Watch Tutorial
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && closeVideo()}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black">
          <DialogHeader className="p-4 bg-background border-b">
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              {moduleData.title} Tutorial
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full flex items-center justify-center bg-black text-white relative">
            {/* Placeholder for video player */}
            <div className="text-center p-8">
              <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Video Player Placeholder</p>
              <p className="text-sm text-gray-400 mt-2">
                Source: {moduleData.videoUrl}
              </p>
            </div>
            {/* In a real implementation, an iframe or video tag would go here */}
            {/* <iframe src={moduleData.videoUrl} className="w-full h-full" frameBorder="0" allowFullScreen /> */}
          </div>
          <div className="p-4 bg-background border-t">
            <p className="text-sm text-muted-foreground">
              {moduleData.description}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
