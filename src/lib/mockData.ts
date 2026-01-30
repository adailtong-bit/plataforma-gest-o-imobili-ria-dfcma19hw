import {
  subDays,
  addDays,
  startOfMonth,
  subMonths,
  endOfMonth,
  eachMonthOfInterval,
  subMonths as subMonthsFn,
  addMonths,
} from 'date-fns'
// ... previous imports
import {
  Property,
  Task,
  Financials,
  Message,
  Tenant,
  Owner,
  Partner,
  User,
  AutomationRule,
  Condominium,
  PaymentIntegration,
  FinancialSettings,
  BankStatement,
  LedgerEntry,
  AuditLog,
  ServiceRate,
  Notification,
  Workflow,
  MarketData,
  Advertisement,
  Advertiser,
  AdPricing,
  Booking,
  CalendarBlock,
  MessageTemplate,
  InventoryItem,
  ChatMessage,
  InventoryMedia,
  ServiceCategory,
  Invoice,
  Lead,
  Visit,
} from '@/lib/types'

// ... existing code ...

// --- 9. VISITS GENERATION ---

export const visits: Visit[] = []

// Generate some visits
for (let i = 0; i < 15; i++) {
  const prop = randomItem(properties)
  const isPast = i % 2 === 0

  visits.push({
    id: `visit_${i}`,
    propertyId: prop.id,
    propertyName: prop.name,
    clientName: `Client ${i + 1}`,
    date: isPast
      ? subDays(new Date(), randomInt(1, 10)).toISOString()
      : addDays(new Date(), randomInt(1, 14)).toISOString(),
    status: isPast ? 'completed' : 'scheduled',
    notes: 'Interested in buying/renting.',
    agentId: 'partner_0_2',
  })
}

// ... existing exports ...
