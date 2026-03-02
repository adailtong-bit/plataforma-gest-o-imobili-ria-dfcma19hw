import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'
import { Tenant, ChatMessage } from '@/lib/types'
import { cn, formatCurrency } from '@/lib/utils'
import { format, parseISO, isValid } from 'date-fns'

interface TenantNegotiationTabProps {
  tenant: Tenant
  history: ChatMessage[]
  onSend: (text: string) => void
  onUpdateTenant: (data: Partial<Tenant>) => void
}

export function TenantNegotiationTab({
  tenant,
  history,
  onSend,
  onUpdateTenant,
}: TenantNegotiationTabProps) {
  const [text, setText] = useState('')
  const [decision, setDecision] = useState(tenant.tenantDecision || 'pending')

  const proposedRent = tenant.suggestedRenewalPrice || tenant.rentValue
  const ownerAccepted = tenant.ownerDecision === 'accepted'

  const handleSendProposal = () => {
    onUpdateTenant({ tenantDecision: decision as any })
    onSend(`Property Manager updated Tenant status to: ${decision}`)
  }

  const formatTime = (iso: string) => {
    try {
      if (!iso) return ''
      const date = parseISO(iso)
      if (isValid(date)) return format(date, 'dd/MM HH:mm')
      return iso
    } catch {
      return iso
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pricing & Tenant Approval</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">
              New Rent Value (Preço de Renovação):
            </span>
            <div className="text-right">
              <span className="font-bold text-lg text-trust-blue">
                {formatCurrency(proposedRent)}
              </span>
              {!ownerAccepted && (
                <div className="text-xs text-orange-600 font-medium">
                  Pending Owner Approval
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-xs">Tenant Decision</Label>
            <div className="flex gap-2">
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="counter">Counter-offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={handleSendProposal}>
                Save Decision
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[250px] border rounded-md p-4 bg-white">
        <div className="flex flex-col gap-4">
          {history.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex flex-col max-w-[85%]',
                msg.senderId === 'me'
                  ? 'self-end items-end'
                  : 'self-start items-start',
              )}
            >
              <div
                className={cn(
                  'p-3 rounded-lg text-sm shadow-sm',
                  msg.senderId === 'me'
                    ? 'bg-trust-blue text-white rounded-br-none'
                    : 'bg-gray-100 border rounded-bl-none',
                )}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Input
          placeholder="Message to tenant..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' && !e.shiftKey && (onSend(text), setText(''))
          }
        />
        <Button
          size="icon"
          onClick={() => {
            onSend(text)
            setText('')
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
