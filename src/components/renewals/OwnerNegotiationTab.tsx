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
import { Send, CheckCircle2 } from 'lucide-react'
import { Tenant, Owner, ChatMessage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format, parseISO, isValid } from 'date-fns'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'

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
  const { t, language } = useLanguageStore()
  const { toast } = useToast()
  const [text, setText] = useState('')
  const [proposed, setProposed] = useState<number>(
    tenant.suggestedRenewalPrice || tenant.rentValue || 0,
  )
  const [decision, setDecision] = useState(tenant.ownerDecision || 'pending')

  const loc =
    language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'

  const formatLocalCurrency = (value: number) => {
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

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
      `Property Manager sent a proposal: ${formatLocalCurrency(proposed)}. Status marked as: ${t(`common.${decision}`)}`,
    )
    toast({
      title: t('common.success'),
      description: t('common.success'),
    })
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
    <div className="mt-4 space-y-4 flex flex-col h-full">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            {t('renewals.pricing_owner_approval')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2">
            <span className="text-muted-foreground">
              {t('renewals.current_value')}:
            </span>
            <span className="font-bold text-lg">
              {formatLocalCurrency(tenant.rentValue)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                {t('renewals.proposed_value')}
              </Label>
              <CurrencyInput
                value={proposed}
                onChange={setProposed}
                locale={loc}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                {t('common.status')}
              </Label>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t('common.pending')}</SelectItem>
                  <SelectItem value="accepted">
                    {t('common.accepted')}
                  </SelectItem>
                  <SelectItem value="counter">{t('common.counter')}</SelectItem>
                  <SelectItem value="rejected">
                    {t('common.rejected')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-2">
            <Button
              size="default"
              className="w-full bg-trust-blue hover:bg-blue-700 text-white transition-colors"
              onClick={handleSendProposal}
            >
              {t('renewals.update_terms_notify')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="h-[250px] border rounded-md p-4 bg-slate-50 flex-1">
        <div className="flex flex-col gap-4">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm pt-4">
              {t('renewals.empty_messages')}
            </div>
          ) : (
            history.map((msg, idx) => (
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
                      : 'bg-white border rounded-bl-none',
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm shrink-0">
        <Input
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none px-2"
          placeholder={t('renewals.type_message')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' &&
            !e.shiftKey &&
            text.trim() &&
            (onSend(text.trim()), setText(''))
          }
        />
        <Button
          size="icon"
          className="shrink-0 rounded-full h-8 w-8 bg-trust-blue"
          disabled={!text.trim()}
          onClick={() => {
            onSend(text.trim())
            setText('')
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
