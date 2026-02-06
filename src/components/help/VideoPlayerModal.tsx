import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import useTourStore from '@/stores/useTourStore'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export function VideoPlayerModal() {
  const { activeVideo, closeVideo, tutorialModules } = useTourStore()

  // Find the module associated with the active video URL
  const activeModule = tutorialModules.find((m) => m.videoUrl === activeVideo)

  if (!activeVideo) return null

  // Ensure autoplay is enabled for better UX when opening the modal
  const videoUrlWithAutoplay = activeVideo.includes('?')
    ? `${activeVideo}&autoplay=1`
    : `${activeVideo}?autoplay=1`

  return (
    <Dialog open={!!activeVideo} onOpenChange={(open) => !open && closeVideo()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white border-none shadow-2xl">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy">
              {activeModule?.title || 'Tutorial Video'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {activeModule?.description ||
                'Watch this tutorial to learn more about the platform features.'}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="w-full bg-black relative">
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={videoUrlWithAutoplay}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={activeModule?.title || 'Video player'}
            />
          </AspectRatio>
        </div>
      </DialogContent>
    </Dialog>
  )
}
