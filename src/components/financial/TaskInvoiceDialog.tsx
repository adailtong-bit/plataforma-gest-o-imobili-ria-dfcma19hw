import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'

export function TaskInvoiceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addInvoice } = useFinancialStore()
  const { toast } = useToast()
  const [form, setForm] = useState({ description: '', amount: '' })

  const handleSave = () => {
    if (!form.description || !form.amount) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      })
      return
    }
    addInvoice({
      id: `inv-${Date.now()}`,
      description: form.description,
      amount: Number(form.amount),
      status: 'pending',
      date: new Date().toISOString(),
    })
    toast({ title: 'Invoice Generated' })
    onOpenChange(false)
    setForm({ description: '', amount: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Task Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Generate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
