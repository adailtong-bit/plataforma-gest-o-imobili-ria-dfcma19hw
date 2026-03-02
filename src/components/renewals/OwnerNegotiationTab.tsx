import { useState, useEffect } from 'react'
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
import { CurrencyInput } from '@/components/ui/currency-input'
import { Send } from 'lucide-react'
import { Tenant, Owner, ChatMessage } from '@/lib/types'
import { cn, formatCurrency } from '@/lib/utils'
import { format, parseISO, isValid } from 'date-fns'
import useLanguageStore from '@/stores/useLanguageStore'

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
  const { t } = useLanguageStore()
  const [text, setText] = useState('')
  const [proposed, setProposed] = useState<number>(
    tenant.suggestedRenewalPrice || tenant.rentValue || 0,
  )
  const [decision, setDecision] = useState(tenant.ownerDecision || 'pending')

  useEffect(() => {
    if (tenant.suggestedRenewalPrice) {
      setProposed(tenant.suggestedRenewalPrice)
    }
    if (tenant.ownerDecision) {
      setDecision(tenant.ownerDecision)
    }
  }, [tenant.suggestedRenewalPrice, tenant.ownerDecision])

  const handleSendProposal = () => {
    onUpdateTenant({
      suggestedRenewalPrice: proposed,
      ownerDecision: decision as any,
    })
    onSend(
      `Property Manager sent a proposal: ${formatCurrency(proposed)}. Status marked as: ${decision}`,
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
          <CardTitle className="text-sm">
            {t('renewals.pricing_owner_approval') || 'Pricing & Owner Approval'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2">
            <span className="text-muted-foreground">
              {t('renewals.current_value') || 'Current Rent Value'}:
            </span>
            <span className="font-bold">
              {formatCurrency(tenant.rentValue)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">
                {t('renewals.proposed_value') || 'Proposed Renewal Value'}
              </Label>
              <CurrencyInput value={proposed} onChange={setProposed} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">
                {t('common.status') || 'Owner Decision'}
              </Label>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    {t('common.pending') || 'Pending'}
                  </SelectItem>
                  <SelectItem value="accepted">
                    {t('common.accepted') || 'Accepted'}
                  </SelectItem>
                  <SelectItem value="counter">
                    {t('common.counter') || 'Counter-offer'}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {t('common.rejected') || 'Rejected'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full bg-trust-blue text-white"
              onClick={handleSendProposal}
            >
              {t('common.update') || 'Update Terms'} &{' '}
              {t('common.notify_owner') || 'Notify Owner'}
            </Button>
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
          placeholder={t('common.type_message') || 'Message to owner...'}
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
