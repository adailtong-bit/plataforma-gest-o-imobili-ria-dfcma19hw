export type UserRole =
  | 'app_owner'
  | 'platform_owner'
  | 'platform_manager'
  | 'platform_staff_long'
  | 'platform_staff_short'
  | 'property_owner'
  | 'partner'
  | 'tenant'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  phone?: string
  companyName?: string
}

export interface Condominium {
  id: string
  name: string
  address: string
  managerName?: string
  managerPhone?: string
  managerEmail?: string
}

export interface Property {
  id: string
  name: string
  address: string
  type: string
  community: string // Can be legacy field, or sync with Condo name
  condominiumId?: string
  status: 'occupied' | 'vacant' | 'maintenance'
  marketingStatus?: 'listed' | 'unlisted'
  image: string
  gallery?: string[]
  bedrooms: number
  bathrooms: number
  guests: number

  // Access
  wifiSsid?: string
  wifiPassword?: string
  accessCodeBuilding?: string
  accessCodeUnit?: string
  accessCodeGuest?: string
  accessCodeService?: string
  accessCodeCleaning?: string

  // HOA / Condominium Info
  hoaValue?: number
  hoaFrequency?: 'monthly' | 'quarterly' | 'semi-annually' | 'annually'

  // Multilingual Content
  description?: {
    pt: string
    en: string
    es: string
  }
  hoaRules?: {
    pt: string
    en: string
    es: string
  }

  // Documents
  documents?: {
    id: string
    name: string
    url: string
    date: string
    size?: string
    type?: string
  }[]

  // Contract Alerts
  contractConfig?: {
    expirationAlertDays: number
    renewalAlertDate?: string
  }

  ownerId: string
  agentId?: string // Associated Realtor/Agent
}

export interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  propertyId?: string
  rentValue: number
  leaseStart?: string
  leaseEnd?: string
  status: 'active' | 'past' | 'prospective'
  role: UserRole
  avatar?: string
}

export interface Owner {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  accountNumber?: string
  role: UserRole
  avatar?: string
}

export interface Partner {
  id: string
  name: string
  type: 'agent' | 'cleaning' | 'maintenance'
  companyName?: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  rating?: number
  role: UserRole
  avatar?: string
}

export interface Evidence {
  id: string
  url: string
  type: 'arrival' | 'completion' | 'other'
  timestamp: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  notes?: string
}

export interface Task {
  id: string
  title: string
  propertyId: string
  propertyName: string
  propertyAddress?: string
  propertyCommunity?: string
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  type: 'cleaning' | 'maintenance' | 'inspection'
  assignee: string // Can be Partner ID or Name
  assigneeId?: string // Link to Partner
  date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  images?: string[]
  evidence?: Evidence[]
  description?: string
  price?: number
  backToBack?: boolean
}

export interface Invoice {
  id: string
  description: string
  amount: number
  status: 'pending' | 'paid' | 'approved'
  date: string
}

export interface Payment {
  id: string
  tenantId: string
  tenantName: string
  propertyId: string
  amount: number
  date: string
  dueDate: string
  status: 'paid' | 'pending' | 'overdue'
  type: 'rent' | 'deposit' | 'fee'
}

export interface Financials {
  revenue: { month: string; value: number }[]
  expenses: { category: string; value: number; fill: string }[]
  invoices: Invoice[]
  payments: Payment[]
}

export interface AutomationRule {
  id: string
  type: 'rent_reminder' | 'contract_expiry' | 'maintenance_update'
  enabled: boolean
  daysBefore: number
  template: string
}

export interface Message {
  id: string
  contact: string // Display Name
  contactId: string // The ID of the other person
  ownerId: string // The ID of the user who owns this message thread (Inbox Owner)
  lastMessage: string
  time: string
  unread: number
  avatar: string
  type?: string
  history: ChatMessage[]
}

export interface ChatMessage {
  id: string
  text: string
  sender: 'me' | 'other'
  timestamp: string
  attachments?: string[]
}
