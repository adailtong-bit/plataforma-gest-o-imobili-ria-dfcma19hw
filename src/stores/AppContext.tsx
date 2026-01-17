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
  User,
  Payment,
  AutomationRule,
  Condominium,
  PaymentIntegration,
} from '@/lib/types'
import {
  properties as initialProperties,
  tasks as initialTasks,
  financials as initialFinancials,
  messages as initialMessages,
  tenants as initialTenants,
  owners as initialOwners,
  partners as initialPartners,
  systemUsers,
  automationRules as initialAutomationRules,
  condominiums as initialCondominiums,
  defaultPaymentIntegrations,
} from '@/lib/mockData'
import { canChat } from '@/lib/permissions'
import { translations, Language } from '@/lib/translations'

interface AppContextType {
  properties: Property[]
  condominiums: Condominium[]
  tasks: Task[]
  financials: Financials
  messages: Message[]
  tenants: Tenant[]
  owners: Owner[]
  partners: Partner[]
  automationRules: AutomationRule[]
  currentUser: User | Owner | Partner | Tenant
  allUsers: (User | Owner | Partner | Tenant)[]
  users: User[] // Managed system users
  paymentIntegrations: PaymentIntegration[]
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
  addProperty: (property: Property) => void
  updateProperty: (property: Property) => void
  deleteProperty: (propertyId: string) => void
  addCondominium: (condo: Condominium) => void
  updateCondominium: (condo: Condominium) => void
  deleteCondominium: (condoId: string) => void
  updateTaskStatus: (taskId: string, status: Task['status']) => void
  addTask: (task: Task) => void
  addInvoice: (invoice: Invoice) => void
  markPaymentAs: (paymentId: string, status: Payment['status']) => void
  addTaskImage: (taskId: string, imageUrl: string) => void
  addTaskEvidence: (taskId: string, evidence: Evidence) => void
  sendMessage: (contactId: string, text: string, attachments?: string[]) => void
  markAsRead: (contactId: string) => void
  addTenant: (tenant: Tenant) => void
  addOwner: (owner: Owner) => void
  addPartner: (partner: Partner) => void
  setCurrentUser: (userId: string) => void
  startChat: (contactId: string) => void
  updateAutomationRule: (rule: AutomationRule) => void
  // User Management
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (userId: string) => void
  // Payment Settings
  updatePaymentIntegration: (integration: PaymentIntegration) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [condominiums, setCondominiums] =
    useState<Condominium[]>(initialCondominiums)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [financials, setFinancials] = useState<Financials>(initialFinancials)
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [owners, setOwners] = useState<Owner[]>(initialOwners)
  const [partners, setPartners] = useState<Partner[]>(initialPartners)
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(
    initialAutomationRules,
  )
  const [allMessages, setAllMessages] = useState<Message[]>(initialMessages)
  const [users, setUsers] = useState<User[]>(systemUsers)
  const [paymentIntegrations, setPaymentIntegrations] = useState<
    PaymentIntegration[]
  >(defaultPaymentIntegrations)

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language')
    return (saved as Language) || 'pt'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app_language', lang)
  }

  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.')
    let current: any = translations[language]

    for (const k of keys) {
      if (current[k] === undefined) return key
      current = current[k]
    }

    if (typeof current === 'string' && params) {
      let text = current
      Object.entries(params).forEach(([pkey, pval]) => {
        text = text.replace(`{${pkey}}`, pval)
      })
      return text
    }

    return current as string
  }

  const [currentUser, setCurrentUserObj] = useState<
    User | Owner | Partner | Tenant
  >(systemUsers[0])

  const allUsers = [...users, ...owners, ...partners, ...tenants]

  const setCurrentUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId)
    if (user) setCurrentUserObj(user)
  }

  const visibleMessages = allMessages.filter(
    (m) => m.ownerId === currentUser.id,
  )

  const addProperty = (property: Property) => {
    setProperties([...properties, property])
  }

  const updateProperty = (property: Property) => {
    setProperties(properties.map((p) => (p.id === property.id ? property : p)))
  }

  const deleteProperty = (propertyId: string) => {
    const hasActiveTenant = tenants.some(
      (t) => t.propertyId === propertyId && t.status === 'active',
    )
    if (hasActiveTenant) {
      throw new Error('error_active_tenant')
    }
    setProperties(properties.filter((p) => p.id !== propertyId))
  }

  const addCondominium = (condo: Condominium) => {
    setCondominiums([...condominiums, condo])
  }

  const updateCondominium = (condo: Condominium) => {
    setCondominiums(condominiums.map((c) => (c.id === condo.id ? condo : c)))
  }

  const deleteCondominium = (condoId: string) => {
    const isLinked = properties.some((p) => p.condominiumId === condoId)
    if (isLinked) {
      throw new Error('error_linked_condo')
    }
    setCondominiums(condominiums.filter((c) => c.id !== condoId))
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

  const markPaymentAs = (paymentId: string, status: Payment['status']) => {
    setFinancials({
      ...financials,
      payments: financials.payments.map((p) =>
        p.id === paymentId ? { ...p, status } : p,
      ),
    })
  }

  const sendMessage = (
    contactId: string,
    text: string,
    attachments: string[] = [],
  ) => {
    setAllMessages((prev) => {
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

    const existing = visibleMessages.find((m) => m.contactId === contactId)
    if (existing) {
      // Logic for existing chat
    } else {
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

  const updateAutomationRule = (rule: AutomationRule) => {
    setAutomationRules(
      automationRules.map((r) => (r.id === rule.id ? rule : r)),
    )
  }

  const addUser = (user: User) => {
    setUsers([...users, user])
  }

  const updateUser = (user: User) => {
    setUsers(users.map((u) => (u.id === user.id ? user : u)))
  }

  const deleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  const updatePaymentIntegration = (integration: PaymentIntegration) => {
    setPaymentIntegrations(
      paymentIntegrations.map((p) =>
        p.provider === integration.provider ? integration : p,
      ),
    )
  }

  return (
    <AppContext.Provider
      value={{
        properties,
        condominiums,
        tasks,
        financials,
        messages: visibleMessages,
        tenants,
        owners,
        partners,
        automationRules,
        currentUser,
        allUsers,
        users,
        paymentIntegrations,
        language,
        setLanguage,
        t,
        addProperty,
        updateProperty,
        deleteProperty,
        addCondominium,
        updateCondominium,
        deleteCondominium,
        updateTaskStatus,
        addTask,
        addInvoice,
        markPaymentAs,
        addTaskImage,
        addTaskEvidence,
        sendMessage,
        markAsRead,
        addTenant,
        addOwner,
        addPartner,
        setCurrentUser,
        startChat,
        updateAutomationRule,
        addUser,
        updateUser,
        deleteUser,
        updatePaymentIntegration,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
