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
  owner: string
}

export interface Task {
  id: string
  title: string
  propertyId: string
  propertyName: string
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  type: 'cleaning' | 'maintenance' | 'inspection'
  assignee: string
  date: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  images?: string[]
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
  history: ChatMessage[]
}

export interface ChatMessage {
  id: string
  text: string
  sender: 'me' | 'other'
  timestamp: string
  attachments?: string[]
}
