import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import useSubscriptionStore from '@/stores/useSubscriptionStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import {
  SubscriptionTier,
  SubscriptionDiscount,
  PMSpecificPricing,
} from '@/lib/types'

export function SubscriptionSettings() {
  const { subscriptionConfig, updateSubscriptionConfig } =
    useSubscriptionStore()
  const { allUsers } = useAuthStore()
  const { toast } = useToast()

  const pms = allUsers.filter((u) => u.role === 'software_tenant')

  // Dialog states
  const [tierOpen, setTierOpen] = useState(false)
  const [discountOpen, setDiscountOpen] = useState(false)
  const [overrideOpen, setOverrideOpen] = useState(false)

  // Form states
  const [newTier, setNewTier] = useState<Partial<SubscriptionTier>>({
    region: 'global',
  })
  const [newDiscount, setNewDiscount] = useState<Partial<SubscriptionDiscount>>(
    { type: 'percentage' },
  )
  const [newOverride, setNewOverride] = useState<Partial<PMSpecificPricing>>({})

  const handleSaveTier = () => {
    if (!newTier.name || !newTier.basePrice) return
    const tier = {
      ...newTier,
      id: `tier-${Date.now()}`,
      features: ['Standard features', 'Support'],
    } as SubscriptionTier
    updateSubscriptionConfig({
      ...subscriptionConfig,
      tiers: [...subscriptionConfig.tiers, tier],
    })
    setTierOpen(false)
    setNewTier({ region: 'global' })
    toast({ title: 'Tier created' })
  }

  const handleDeleteTier = (id: string) => {
    updateSubscriptionConfig({
      ...subscriptionConfig,
      tiers: subscriptionConfig.tiers.filter((t) => t.id !== id),
    })
  }

  const handleSaveDiscount = () => {
    if (!newDiscount.name || !newDiscount.value || !newDiscount.expiresAt)
      return
    const discount = {
      ...newDiscount,
      id: `disc-${Date.now()}`,
    } as SubscriptionDiscount
    updateSubscriptionConfig({
      ...subscriptionConfig,
      discounts: [...subscriptionConfig.discounts, discount],
    })
    setDiscountOpen(false)
    setNewDiscount({ type: 'percentage' })
    toast({ title: 'Discount created' })
  }

  const handleDeleteDiscount = (id: string) => {
    updateSubscriptionConfig({
      ...subscriptionConfig,
      discounts: subscriptionConfig.discounts.filter((d) => d.id !== id),
    })
  }

  const handleSaveOverride = () => {
    if (!newOverride.pmId || newOverride.fixedRate === undefined) return
    const override = {
      ...newOverride,
      id: `ovr-${Date.now()}`,
    } as PMSpecificPricing
    updateSubscriptionConfig({
      ...subscriptionConfig,
      pmOverrides: [...subscriptionConfig.pmOverrides, override],
    })
    setOverrideOpen(false)
    setNewOverride({})
    toast({ title: 'Override created' })
  }

  const handleDeleteOverride = (id: string) => {
    updateSubscriptionConfig({
      ...subscriptionConfig,
      pmOverrides: subscriptionConfig.pmOverrides.filter((o) => o.id !== id),
    })
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Subscription & Pricing Config</CardTitle>
        <CardDescription>
          Manage SaaS pricing tiers, regional costs, and promotional discounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tiers">
          <TabsList className="mb-4">
            <TabsTrigger value="tiers">Base Tiers</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
            <TabsTrigger value="overrides">PM Overrides</TabsTrigger>
          </TabsList>

          <TabsContent value="tiers">
            <div className="flex justify-end mb-4">
              <Dialog open={tierOpen} onOpenChange={setTierOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Tier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Pricing Tier</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Tier Name</Label>
                      <Input
                        value={newTier.name || ''}
                        onChange={(e) =>
                          setNewTier({ ...newTier, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Base Price ($)</Label>
                        <Input
                          type="number"
                          value={newTier.basePrice || ''}
                          onChange={(e) =>
                            setNewTier({
                              ...newTier,
                              basePrice: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Max Included Units</Label>
                        <Input
                          type="number"
                          value={newTier.maxUnits || ''}
                          onChange={(e) =>
                            setNewTier({
                              ...newTier,
                              maxUnits: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Additional Unit Cost ($)</Label>
                        <Input
                          type="number"
                          value={newTier.additionalUnitCost || ''}
                          onChange={(e) =>
                            setNewTier({
                              ...newTier,
                              additionalUnitCost: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Region</Label>
                        <Select
                          value={newTier.region}
                          onValueChange={(v) =>
                            setNewTier({ ...newTier, region: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="eu">Europe</SelectItem>
                            <SelectItem value="br">Brazil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveTier}>Save Tier</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Max Units</TableHead>
                  <TableHead>Extra Unit Cost</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionConfig.tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="font-bold">{tier.name}</TableCell>
                    <TableCell>${tier.basePrice}</TableCell>
                    <TableCell>{tier.maxUnits}</TableCell>
                    <TableCell>${tier.additionalUnitCost}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {tier.region}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDeleteTier(tier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="discounts">
            <div className="flex justify-end mb-4">
              <Dialog open={discountOpen} onOpenChange={setDiscountOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Promo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Temporary Discount</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Promo Name / Code</Label>
                      <Input
                        value={newDiscount.name || ''}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select
                          value={newDiscount.type}
                          onValueChange={(v: 'percentage' | 'fixed') =>
                            setNewDiscount({ ...newDiscount, type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage
                            </SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Value</Label>
                        <Input
                          type="number"
                          value={newDiscount.value || ''}
                          onChange={(e) =>
                            setNewDiscount({
                              ...newDiscount,
                              value: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Expires At</Label>
                      <Input
                        type="date"
                        value={newDiscount.expiresAt || ''}
                        onChange={(e) =>
                          setNewDiscount({
                            ...newDiscount,
                            expiresAt: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveDiscount}>Save Discount</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code / Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionConfig.discounts.map((disc) => (
                  <TableRow key={disc.id}>
                    <TableCell className="font-bold">{disc.name}</TableCell>
                    <TableCell>
                      {disc.type === 'percentage'
                        ? `${disc.value}%`
                        : `$${disc.value}`}
                    </TableCell>
                    <TableCell>{disc.expiresAt}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDeleteDiscount(disc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="overrides">
            <div className="flex justify-end mb-4">
              <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Override
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>PM Pricing Override</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Select Property Manager</Label>
                      <Select
                        value={newOverride.pmId || ''}
                        onValueChange={(v) =>
                          setNewOverride({ ...newOverride, pmId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select PM..." />
                        </SelectTrigger>
                        <SelectContent>
                          {pms.map((pm) => (
                            <SelectItem key={pm.id} value={pm.id}>
                              {pm.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Fixed Monthly Rate ($)</Label>
                      <Input
                        type="number"
                        value={newOverride.fixedRate ?? ''}
                        onChange={(e) =>
                          setNewOverride({
                            ...newOverride,
                            fixedRate: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveOverride}>Save Override</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Manager</TableHead>
                  <TableHead>Fixed Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionConfig.pmOverrides.map((ovr) => {
                  const pm = pms.find((p) => p.id === ovr.pmId)
                  return (
                    <TableRow key={ovr.id}>
                      <TableCell className="font-bold">
                        {pm?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>${ovr.fixedRate} /mo (Flat)</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeleteOverride(ovr.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
