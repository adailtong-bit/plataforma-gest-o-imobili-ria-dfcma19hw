import { useState, useContext } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export function PromotionsManagement() {
  const { promotions, addPromotion } = useContext(AppContext)!
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '' })

  const handleSave = () => {
    if (!form.code) return
    addPromotion({
      id: `promo-${Date.now()}`,
      code: form.code.toUpperCase(),
      type: form.type as any,
      value: Number(form.value) || 0,
      active: true,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      usageCount: 0,
    })
    setOpen(false)
    setForm({ code: '', type: 'percentage', value: '' })
    toast({ title: 'Promotion created.' })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Promo Codes</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Promo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold">{p.code}</TableCell>
                <TableCell className="capitalize">
                  {p.type.replace('_', ' ')}
                </TableCell>
                <TableCell>
                  {p.type === 'percentage' ? `${p.value}%` : `$${p.value}`}
                </TableCell>
                <TableCell>{p.usageCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
