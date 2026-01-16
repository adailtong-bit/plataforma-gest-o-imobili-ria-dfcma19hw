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
import { Loader2, MapPin, Clock, Camera } from 'lucide-react'
import { format } from 'date-fns'
import { Evidence, Task } from '@/lib/types'

interface EvidenceUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  type: 'arrival' | 'completion'
  onConfirm: (evidence: Evidence) => void
}

export function EvidenceUploadDialog({
  open,
  onOpenChange,
  task,
  type,
  onConfirm,
}: EvidenceUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationData, setLocationData] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(null)

  useEffect(() => {
    if (open) {
      setFile(null)
      setPreview(null)
      setLocationData(null)
      setLoadingLocation(true)

      // Simulate getting location
      const timer = setTimeout(() => {
        // Mock location based on task property or generic
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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleConfirm = () => {
    if (!file || !preview) return

    const newEvidence: Evidence = {
      id: Math.random().toString(36).substr(2, 9),
      url: preview, // In a real app, this would be the S3 URL
      type: type,
      timestamp: new Date().toISOString(),
      location: locationData || undefined,
    }

    onConfirm(newEvidence)
  }

  const title =
    type === 'arrival'
      ? 'Check-in: Início do Serviço'
      : 'Check-out: Conclusão do Serviço'
  const description =
    type === 'arrival'
      ? 'Tire uma foto do local ao chegar para registrar o início dos trabalhos.'
      : 'Tire uma foto do serviço realizado para finalizar a tarefa.'

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
              <span className="font-medium">Localização:</span>
              {loadingLocation ? (
                <span className="flex items-center gap-1 text-muted-foreground italic">
                  <Loader2 className="h-3 w-3 animate-spin" /> Obtendo GPS...
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
            <Label>Evidência Fotográfica</Label>
            {!preview ? (
              <div className="h-40 w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/40 transition-colors relative cursor-pointer">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para tirar ou carregar foto
                </span>
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative h-40 w-full rounded-md overflow-hidden border bg-black">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 h-7 text-xs"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                >
                  Alterar
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!file || loadingLocation}
            className="flex-1 sm:flex-none bg-trust-blue"
          >
            {type === 'arrival' ? 'Confirmar Chegada' : 'Finalizar Serviço'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
