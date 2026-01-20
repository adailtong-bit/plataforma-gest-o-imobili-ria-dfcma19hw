import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  label?: string
  accept?: string
}

export function FileUpload({
  value,
  onChange,
  disabled,
  label = 'Upload',
  accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx',
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const [isImage, setIsImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setPreview(value)
    if (value) {
      // Simple check to see if it looks like an image URL
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      const lowerValue = value.toLowerCase()
      const hasImageExt = imageExtensions.some((ext) =>
        lowerValue.includes(ext),
      )
      // If it's a blob url or has image extension
      setIsImage(hasImageExt || value.startsWith('blob:'))
    }
  }, [value])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const isFileImage = file.type.startsWith('image/')
      const url = URL.createObjectURL(file)

      setPreview(url)
      setIsImage(isFileImage)
      onChange(url)

      toast({
        title: 'Sucesso',
        description: 'Arquivo carregado com sucesso.',
      })
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    setIsImage(false)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {preview ? (
        <div className="relative w-full h-40 rounded-md overflow-hidden border bg-muted group flex items-center justify-center">
          {isImage ? (
            <img
              src={preview}
              alt="Uploaded file"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-muted-foreground">
              <FileText className="h-10 w-10" />
              <span className="text-xs font-medium">Documento Anexado</span>
            </div>
          )}
          {!disabled && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer relative',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground/70">
              PDF, DOC, JPG, PNG
            </span>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}
