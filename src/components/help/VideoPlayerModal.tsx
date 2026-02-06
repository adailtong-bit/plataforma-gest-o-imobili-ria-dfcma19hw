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

  return (
    <Dialog open={!!activeVideo} onOpenChange={(open) => !open && closeVideo()}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy">
              {activeModule?.title || 'Tutorial Video'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {activeModule?.description ||
                'Assista a este tutorial para aprender mais sobre a plataforma.'}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="w-full bg-black aspect-video relative">
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={activeVideo}
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
