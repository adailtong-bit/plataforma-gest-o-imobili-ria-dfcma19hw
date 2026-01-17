import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Building2 } from 'lucide-react'
import { Partner } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import usePropertyStore from '@/stores/usePropertyStore'

interface PartnerPropertiesProps {
  partner: Partner
  onUpdate: (partner: Partner) => void
  canEdit: boolean
}

export function PartnerProperties({
  partner,
  onUpdate,
  canEdit,
}: PartnerPropertiesProps) {
  const { properties } = usePropertyStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedPropId, setSelectedPropId] = useState<string>('')

  const linkedIds = partner.linkedPropertyIds || []
  const linkedProperties = properties.filter((p) => linkedIds.includes(p.id))
  const availableProperties = properties.filter(
    (p) => !linkedIds.includes(p.id),
  )

  const handleLink = () => {
    if (!selectedPropId) return
    const newLinks = [...linkedIds, selectedPropId]
    onUpdate({ ...partner, linkedPropertyIds: newLinks })
    setOpen(false)
    setSelectedPropId('')
    toast({ title: 'Propriedade vinculada' })
  }

  const handleUnlink = (id: string) => {
    if (confirm('Desvincular propriedade?')) {
      const newLinks = linkedIds.filter((lid) => lid !== id)
      onUpdate({ ...partner, linkedPropertyIds: newLinks })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Propriedades Vinculadas (Whitelist)</CardTitle>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-trust-blue">
                <Plus className="h-4 w-4 mr-2" /> Vincular
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vincular Propriedade</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Selecione a Propriedade</Label>
                  <Select
                    value={selectedPropId}
                    onValueChange={setSelectedPropId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProperties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleLink} disabled={!selectedPropId}>
                  Confirmar Vínculo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Propriedade</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Comunidade</TableHead>
              {canEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {linkedProperties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Nenhuma propriedade vinculada.
                </TableCell>
              </TableRow>
            ) : (
              linkedProperties.map((prop) => (
                <TableRow key={prop.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {prop.name}
                  </TableCell>
                  <TableCell>{prop.address}</TableCell>
                  <TableCell>{prop.community}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleUnlink(prop.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
