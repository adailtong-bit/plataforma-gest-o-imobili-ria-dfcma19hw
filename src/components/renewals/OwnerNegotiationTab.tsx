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
import { Tenant, Owner, ChatMessage } from '@/lib/types'
import { cn, formatCurrency } from '@/lib/utils'
import { format, parseISO, isValid } from 'date-fns'

interface OwnerNegotiationTabProps {
  tenant: Tenant
  owner: Owner | null | undefined
  history: ChatMessage[]
  onSend: (text: string) => void
  onUpdateTenant: (data: Partial<Tenant>) => void
}

export function OwnerNegotiationTab({
  tenant,
  owner,
  history,
  onSend,
  onUpdateTenant,
}: OwnerNegotiationTabProps) {
  const [text, setText] = useState('')
  const [proposed, setProposed] = useState(
    tenant.suggestedRenewalPrice?.toString() || '',
  )
  const [decision, setDecision] = useState(tenant.ownerDecision || 'pending')

  const handleSendProposal = () => {
    const val = parseFloat(proposed)
    onUpdateTenant({
      suggestedRenewalPrice: val,
      ownerDecision: decision as any,
    })
    onSend(
      `Property Manager sent a proposal: ${formatCurrency(val)}. Status marked as: ${decision}`,
    )
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
          <CardTitle className="text-sm">Pricing & Owner Approval</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Rent Value:</span>
            <span className="font-bold">
              {formatCurrency(tenant.rentValue)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label className="text-xs">Proposed Renewal Value</Label>
              <Input
                type="number"
                value={proposed}
                onChange={(e) => setProposed(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Owner Decision</Label>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="counter">Counter-offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full bg-trust-blue text-white"
            onClick={handleSendProposal}
          >
            Update Terms & Notify Owner
          </Button>
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
          placeholder="Message to owner..."
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
