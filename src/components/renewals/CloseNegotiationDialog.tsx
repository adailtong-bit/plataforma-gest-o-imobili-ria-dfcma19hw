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

    setNewStart('')
    setNewEnd('')
    setContractUrl('')
  }

  const loc =
    language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('renewals.close_negotiation')}</DialogTitle>
          <DialogDescription>
            {t('renewals.close_negotiation_desc')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label className="font-semibold">{t('renewals.new_value')}</Label>
            <CurrencyInput
              value={newValue}
              onChange={setNewValue}
              locale={loc}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold">
                {t('renewals.new_start_date')}
              </Label>
              <Input
                type="date"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">
                {t('renewals.new_end_date')}
              </Label>
              <Input
                type="date"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">
              {t('renewals.contract_upload')}
            </Label>
            <FileUpload
              value={contractUrl}
              onChange={setContractUrl}
              accept=".pdf,.doc,.docx"
            />
          </div>
        </div>
        <DialogFooter className="gap-3 sm:gap-2 pt-2 border-t mt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleConfirm}
          >
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
