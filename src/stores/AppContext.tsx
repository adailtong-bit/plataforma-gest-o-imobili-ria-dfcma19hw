import React, { createContext, useState, ReactNode, useEffect } from 'react'
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
  User,
  UserRole,
} from '@/lib/types'
import {
  properties as initialProperties,
  tasks as initialTasks,
  financials as initialFinancials,
  messages as initialMessages,
  owner1Messages,
  partner1Messages,
  tenants as initialTenants,
  owners as initialOwners,
  partners as initialPartners,
  systemUsers,
} from '@/lib/mockData'
import { canChat } from '@/lib/permissions'

interface AppContextType {
  properties: Property[]
  tasks: Task[]
  financials: Financials
  messages: Message[]
  tenants: Tenant[]
  owners: Owner[]
  partners: Partner[]
  currentUser: User | Owner | Partner | Tenant
  allUsers: (User | Owner | Partner | Tenant)[]
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
  setCurrentUser: (userId: string) => void
  startChat: (contactId: string) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [financials, setFinancials] = useState<Financials>(initialFinancials)
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [owners, setOwners] = useState<Owner[]>(initialOwners)
  const [partners, setPartners] = useState<Partner[]>(initialPartners)
  const [allMessages, setAllMessages] = useState<Message[]>([
    ...initialMessages,
    ...owner1Messages,
    ...partner1Messages,
  ])

  // Auth State
  const [currentUser, setCurrentUserObj] = useState<
    User | Owner | Partner | Tenant
  >(systemUsers.find((u) => u.id === 'plat_manager')!)

  const allUsers = [...systemUsers, ...owners, ...partners, ...tenants]

  const setCurrentUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId)
    if (user) setCurrentUserObj(user)
  }

  // Filter messages for current user
  const visibleMessages = allMessages.filter(
    (m) => m.ownerId === currentUser.id,
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
    setAllMessages((prev) => {
      // Find existing conversation for this user
      const existing = prev.find(
        (m) => m.ownerId === currentUser.id && m.contactId === contactId,
      )

      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      if (existing) {
        return prev.map((m) => {
          if (m.id === existing.id) {
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
                  timestamp,
                  attachments,
                },
              ],
            }
          }
          return m
        })
      } else {
        // Create new conversation
        const contact = allUsers.find((u) => u.id === contactId)
        if (!contact) return prev

        const newMsg: Message = {
          id: `${currentUser.id}_${contactId}_${Date.now()}`,
          ownerId: currentUser.id,
          contact: contact.name,
          contactId: contact.id,
          type: contact.role,
          lastMessage: text,
          time: 'Agora',
          unread: 0,
          avatar: contact.avatar || '',
          history: [
            {
              id: Date.now().toString(),
              text,
              sender: 'me',
              timestamp,
              attachments,
            },
          ],
        }
        return [newMsg, ...prev]
      }
    })
  }

  const startChat = (contactId: string) => {
    const contact = allUsers.find((u) => u.id === contactId)
    if (!contact) return

    // Check if conversation exists
    const existing = visibleMessages.find((m) => m.contactId === contactId)
    if (existing) {
      // It exists, UI should select it (handled by router/state in page usually, but here we just ensure it's there)
    } else {
      // We create an empty conversation or just let UI handle "New Chat" state
      // For simplicity, we just create a placeholder conversation if not exists
      if (canChat(currentUser.role, contact.role)) {
        const newMsg: Message = {
          id: `${currentUser.id}_${contactId}_new`,
          ownerId: currentUser.id,
          contact: contact.name,
          contactId: contact.id,
          type: contact.role,
          lastMessage: 'Inicie a conversa...',
          time: 'Agora',
          unread: 0,
          avatar: contact.avatar || '',
          history: [],
        }
        setAllMessages((prev) => [newMsg, ...prev])
      }
    }
  }

  const markAsRead = (messageId: string) => {
    setAllMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, unread: 0 } : m)),
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
        messages: visibleMessages,
        tenants,
        owners,
        partners,
        currentUser,
        allUsers,
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
        setCurrentUser,
        startChat,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
