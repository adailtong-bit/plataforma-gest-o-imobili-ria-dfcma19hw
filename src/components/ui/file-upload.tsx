import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
  label?: string
}

export function FileUpload({
  value,
  onChange,
  disabled,
  label = 'Upload',
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (mock)
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Apenas imagens são permitidas.',
          variant: 'destructive',
        })
        return
      }

      // Create object URL (mock upload)
      const url = URL.createObjectURL(file)
      setPreview(url)
      onChange(url)
      toast({
        title: 'Sucesso',
        description: 'Arquivo carregado com sucesso.',
      })
    }
  }

  const handleRemove = () => {
    setPreview(undefined)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {preview ? (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border bg-muted group">
          <img
            src={preview}
            alt="Uploaded file"
            className="w-full h-full object-cover"
          />
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
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer relative"
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}
