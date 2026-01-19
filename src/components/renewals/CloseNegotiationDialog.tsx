import { useState } from 'react'
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
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [newValue, setNewValue] = useState(currentValue)
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [contractUrl, setContractUrl] = useState('')

  const handleConfirm = () => {
    if (!newStart || !newEnd || !contractUrl) {
      toast({
        title: t('common.error'),
        description: 'Por favor, preencha todos os campos e anexe o contrato.',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('renewals.close_negotiation')}</DialogTitle>
          <DialogDescription>
            Confirme os novos termos e anexe o contrato assinado para finalizar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t('renewals.new_value')}</Label>
            <Input
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              label="Upload PDF/Doc"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} className="bg-trust-blue">
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
