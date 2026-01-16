export interface Property {
  id: string
  name: string
  address: string
  type: string
  community: string
  status: 'occupied' | 'vacant' | 'maintenance'
  image: string
  bedrooms: number
  bathrooms: number
  guests: number
  accessCode: string
  wifi: string
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
}

export interface Owner {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  accountNumber?: string
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

export interface Financials {
  revenue: { month: string; value: number }[]
  expenses: { category: string; value: number; fill: string }[]
  invoices: Invoice[]
}

export interface Message {
  id: string
  contact: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  type?: 'owner' | 'tenant' | 'partner'
  history: ChatMessage[]
}

export interface ChatMessage {
  id: string
  text: string
  sender: 'me' | 'other'
  timestamp: string
  attachments?: string[]
}
