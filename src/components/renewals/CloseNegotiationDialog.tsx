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
import { FileUpload } from '@/components/ui/file-upload'
import { CurrencyInput } from '@/components/ui/currency-input'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'

interface CloseNegotiationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: {
    newValue: number
    newStart: string
    newEnd: string
    contractUrl: string
  }) => void
  currentValue: number
}

export function CloseNegotiationDialog({
  open,
  onOpenChange,
  onConfirm,
  currentValue,
}: CloseNegotiationDialogProps) {
  const { t, language } = useLanguageStore()
  const { toast } = useToast()
  const [newValue, setNewValue] = useState(currentValue)
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [contractUrl, setContractUrl] = useState('')

  useEffect(() => {
    if (open) {
      setNewValue(currentValue)
    }
  }, [open, currentValue])

  const handleConfirm = () => {
    if (!newStart || !newEnd || !contractUrl) {
      toast({
        title: t('common.error'),
        description: t('renewals.fill_all_fields'),
        variant: 'destructive',
      })
      return
    }

    onConfirm({
      newValue,
      newStart,
      newEnd,
      contractUrl,
    })
    onOpenChange(false)
  }

  const loc =
    language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('renewals.close_negotiation')}</DialogTitle>
          <DialogDescription>
            {t('renewals.close_negotiation_desc')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t('renewals.new_value')}</Label>
            <CurrencyInput
              value={newValue}
              onChange={setNewValue}
              locale={loc}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('renewals.new_start_date')}</Label>
              <Input
                type="date"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('renewals.new_end_date')}</Label>
              <Input
                type="date"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t('renewals.contract_upload')}</Label>
            <FileUpload
              value={contractUrl}
              onChange={setContractUrl}
              label={t('common.upload') || 'Upload'}
              accept=".pdf,.doc,.docx"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
