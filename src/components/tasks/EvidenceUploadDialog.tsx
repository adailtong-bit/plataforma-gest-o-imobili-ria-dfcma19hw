import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin, Clock, Camera, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { Evidence, Task } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'
import { ScrollArea } from '@/components/ui/scroll-area'

interface EvidenceUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  type: 'arrival' | 'completion'
  onConfirm: (evidenceList: Evidence[]) => void
}

export function EvidenceUploadDialog({
  open,
  onOpenChange,
  task,
  type,
  onConfirm,
}: EvidenceUploadDialogProps) {
  const { t } = useLanguageStore()
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationData, setLocationData] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)

  useEffect(() => {
    if (open) {
      setFiles([])
      setPreviews([])
      setLocationData(null)
      setLoadingLocation(true)

      // Simulate getting location
      const timer = setTimeout(() => {
        setLocationData({
          lat: 28.5383,
          lng: -81.3792,
          address: task.propertyAddress || 'Localização Detectada',
        })
        setLoadingLocation(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [open, task.propertyAddress])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f))

      setFiles((prev) => [...prev, ...newFiles])
      setPreviews((prev) => [...prev, ...newPreviews])

      // Reset input value to allow selecting same file again if needed
      e.target.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    if (files.length === 0) return

    const evidenceList: Evidence[] = previews.map((url, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: url, // In a real app, upload to S3 here
      type: type,
      timestamp: new Date().toISOString(),
      location: locationData || undefined,
      notes: `Photo ${index + 1} of ${previews.length}`,
    }))

    onConfirm(evidenceList)
  }

  const title =
    type === 'arrival' ? t('tasks.checkin_title') : t('tasks.checkout_title')
  const description =
    type === 'arrival' ? t('tasks.checkin_desc') : t('tasks.checkout_desc')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-3 p-3 bg-muted/40 rounded-lg border">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Horário:</span>
              <span>{format(new Date(), 'HH:mm dd/MM/yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="font-medium">{t('tasks.location')}:</span>
              {loadingLocation ? (
                <span className="flex items-center gap-1 text-muted-foreground italic">
                  <Loader2 className="h-3 w-3 animate-spin" />{' '}
                  {t('tasks.gps_loading')}
                </span>
              ) : (
                <span
                  className="truncate max-w-[200px]"
                  title={locationData?.address}
                >
                  {locationData?.address || 'Localização indisponível'}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Evidência Fotográfica (Múltiplas)</Label>
            <ScrollArea className="h-[220px] w-full rounded-md border p-2">
              <div className="grid grid-cols-2 gap-2">
                {previews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-md overflow-hidden border bg-black group"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${idx}`}
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(idx)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                <div className="aspect-video w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors relative cursor-pointer">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center px-2">
                    {files.length > 0
                      ? 'Adicionar mais'
                      : t('tasks.photo_placeholder')}
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              {files.length} foto(s) selecionada(s).
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={files.length === 0 || loadingLocation}
            className="flex-1 sm:flex-none bg-trust-blue"
          >
            {type === 'arrival'
              ? t('tasks.confirm_arrival')
              : t('tasks.finalize_service')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
