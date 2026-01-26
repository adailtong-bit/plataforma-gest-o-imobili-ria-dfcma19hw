import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Calendar as CalendarIcon,
  User as UserIcon,
  FileText,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useTenantStore from '@/stores/useTenantStore'
import { format } from 'date-fns'
import { Tenant } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface PropertyContractsProps {
  propertyId: string
  canEdit: boolean
}

export function PropertyContracts({
  propertyId,
  canEdit,
}: PropertyContractsProps) {
  const { tenants, addTenant } = useTenantStore()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  // Local state for new contract (Tenant lease)
  const [newContract, setNewContract] = useState<Partial<Tenant>>({
    name: '',
    email: '',
    phone: '',
    leaseStart: '',
    leaseEnd: '',
    rentValue: 0,
    status: 'active',
  })

  const propertyTenants = tenants.filter((t) => t.propertyId === propertyId)

  const handleSave = () => {
    if (
      !newContract.name ||
      !newContract.leaseStart ||
      !newContract.leaseEnd ||
      !newContract.rentValue
    ) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }

    addTenant({
      id: `tenant-${Date.now()}`,
      propertyId,
      name: newContract.name,
      email: newContract.email || 'placeholder@email.com',
      phone: newContract.phone || '',
      rentValue: Number(newContract.rentValue),
      leaseStart: newContract.leaseStart,
      leaseEnd: newContract.leaseEnd,
      status: (newContract.status as any) || 'active',
      role: 'tenant',
    } as Tenant)

    setIsOpen(false)
    setNewContract({
      name: '',
      email: '',
      phone: '',
      leaseStart: '',
      leaseEnd: '',
      rentValue: 0,
      status: 'active',
    })
    toast({ title: 'Contract Added', description: 'Lease agreement recorded.' })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Rental Contracts</CardTitle>
          <CardDescription>
            Manage lease agreements and history.
          </CardDescription>
        </div>
        {canEdit && (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-trust-blue gap-2"
          >
            <Plus className="h-4 w-4" /> Add Contract
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertyTenants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No contracts found.
                </TableCell>
              </TableRow>
            ) : (
              propertyTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    {tenant.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      {tenant.leaseStart
                        ? format(new Date(tenant.leaseStart), 'dd/MM/yyyy')
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      {tenant.leaseEnd
                        ? format(new Date(tenant.leaseEnd), 'dd/MM/yyyy')
                        : '-'}
                    </div>
                  </TableCell>
                  <TableCell>${tenant.rentValue}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tenant.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {tenant.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Rental Contract</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tenant Name</Label>
              <Input
                value={newContract.name}
                onChange={(e) =>
                  setNewContract({ ...newContract, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newContract.leaseStart}
                  onChange={(e) =>
                    setNewContract({
                      ...newContract,
                      leaseStart: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newContract.leaseEnd}
                  onChange={(e) =>
                    setNewContract({ ...newContract, leaseEnd: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Monthly Rent ($)</Label>
                <Input
                  type="number"
                  value={newContract.rentValue}
                  onChange={(e) =>
                    setNewContract({
                      ...newContract,
                      rentValue: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={newContract.status}
                  onValueChange={(v) =>
                    setNewContract({ ...newContract, status: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospective">Pending</SelectItem>
                    <SelectItem value="past">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-trust-blue">
              Save Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
