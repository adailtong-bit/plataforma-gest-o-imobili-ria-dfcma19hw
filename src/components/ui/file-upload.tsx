import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

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
  label,
  accept,
  disabled,
}: FileUploadProps) {
  const { t } = useLanguageStore()
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
      <Label>{label || t('common.upload')}</Label>
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
          className="w-full bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
        >
          <Upload className="h-4 w-4 mr-2" /> {t('common.upload')}
        </Button>
      </div>
      {value && (
        <div className="text-xs text-emerald-600 truncate mt-1 flex items-center gap-1 font-medium">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t('common.success')}
        </div>
      )}
    </div>
  )
}
