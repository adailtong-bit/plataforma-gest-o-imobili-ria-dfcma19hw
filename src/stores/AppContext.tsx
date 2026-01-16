import React, { createContext, useState, ReactNode } from 'react'
import {
  Property,
  Task,
  Financials,
  Message,
  Invoice,
  Evidence,
  Tenant,
  Owner,
  Partner,
} from '@/lib/types'
import {
  properties as initialProperties,
  tasks as initialTasks,
  financials as initialFinancials,
  messages as initialMessages,
  tenants as initialTenants,
  owners as initialOwners,
  partners as initialPartners,
} from '@/lib/mockData'

interface AppContextType {
  properties: Property[]
  tasks: Task[]
  financials: Financials
  messages: Message[]
  tenants: Tenant[]
  owners: Owner[]
  partners: Partner[]
  addProperty: (property: Property) => void
  updateTaskStatus: (taskId: string, status: Task['status']) => void
  addTask: (task: Task) => void
  addInvoice: (invoice: Invoice) => void
  addTaskImage: (taskId: string, imageUrl: string) => void
  addTaskEvidence: (taskId: string, evidence: Evidence) => void
  sendMessage: (contactId: string, text: string, attachments?: string[]) => void
  markAsRead: (contactId: string) => void
  addTenant: (tenant: Tenant) => void
  addOwner: (owner: Owner) => void
  addPartner: (partner: Partner) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [financials, setFinancials] = useState<Financials>(initialFinancials)
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [owners, setOwners] = useState<Owner[]>(initialOwners)
  const [partners, setPartners] = useState<Partner[]>(initialPartners)

  // Transform initial messages to include history if not present
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map((m) => ({
      ...m,
      history: [
        { id: '1', text: m.lastMessage, sender: 'other', timestamp: m.time },
      ],
    })),
  )

  const addProperty = (property: Property) => {
    setProperties([...properties, property])
  }

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)))
  }

  const addTask = (task: Task) => {
    setTasks([...tasks, task])
  }

  const addTaskImage = (taskId: string, imageUrl: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, images: [...(t.images || []), imageUrl] } : t,
      ),
    )
  }

  const addTaskEvidence = (taskId: string, evidence: Evidence) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              evidence: [...(t.evidence || []), evidence],
              images: [...(t.images || []), evidence.url],
            }
          : t,
      ),
    )
  }

  const addInvoice = (invoice: Invoice) => {
    setFinancials({
      ...financials,
      invoices: [invoice, ...financials.invoices],
    })
  }

  const sendMessage = (
    contactId: string,
    text: string,
    attachments: string[] = [],
  ) => {
    setMessages((prev) => {
      const existing = prev.find((m) => m.id === contactId)
      if (existing) {
        return prev.map((m) => {
          if (m.id === contactId) {
            return {
              ...m,
              lastMessage: text || (attachments.length > 0 ? '📎 Anexo' : ''),
              time: 'Agora',
              history: [
                ...m.history,
                {
                  id: Date.now().toString(),
                  text,
                  sender: 'me',
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  attachments,
                },
              ],
            }
          }
          return m
        })
      } else {
        // Create new conversation mock
        return [
          {
            id: contactId,
            contact: 'Novo Contato', // In a real app, resolve name from ID
            lastMessage: text,
            time: 'Agora',
            unread: 0,
            avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male',
            history: [
              {
                id: Date.now().toString(),
                text,
                sender: 'me',
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                attachments,
              },
            ],
          },
          ...prev,
        ]
      }
    })
  }

  const markAsRead = (contactId: string) => {
    setMessages(
      messages.map((m) => (m.id === contactId ? { ...m, unread: 0 } : m)),
    )
  }

  const addTenant = (tenant: Tenant) => {
    setTenants([...tenants, tenant])
  }

  const addOwner = (owner: Owner) => {
    setOwners([...owners, owner])
  }

  const addPartner = (partner: Partner) => {
    setPartners([...partners, partner])
  }

  return (
    <AppContext.Provider
      value={{
        properties,
        tasks,
        financials,
        messages,
        tenants,
        owners,
        partners,
        addProperty,
        updateTaskStatus,
        addTask,
        addInvoice,
        addTaskImage,
        addTaskEvidence,
        sendMessage,
        markAsRead,
        addTenant,
        addOwner,
        addPartner,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
