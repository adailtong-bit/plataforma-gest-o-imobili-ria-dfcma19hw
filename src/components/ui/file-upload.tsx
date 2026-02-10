import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  accept?: string
  disabled?: boolean
}

export function FileUpload({
  value,
  onChange,
  label = 'Upload File',
  accept,
  disabled,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onChange(url)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" /> Select File
        </Button>
      </div>
      {value && (
        <div className="text-xs text-green-600 truncate mt-1">
          File uploaded successfully
        </div>
      )}
    </div>
  )
}
