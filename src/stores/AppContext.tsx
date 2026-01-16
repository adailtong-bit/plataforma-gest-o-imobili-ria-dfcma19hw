import React, { createContext, useState, ReactNode } from 'react'
import {
  Property,
  Task,
  Financials,
  Message,
  Invoice,
  Evidence,
} from '@/lib/types'
import {
  properties as initialProperties,
  tasks as initialTasks,
  financials as initialFinancials,
  messages as initialMessages,
} from '@/lib/mockData'

interface AppContextType {
  properties: Property[]
  tasks: Task[]
  financials: Financials
  messages: Message[]
  addProperty: (property: Property) => void
  updateTaskStatus: (taskId: string, status: Task['status']) => void
  addTask: (task: Task) => void
  addInvoice: (invoice: Invoice) => void
  addTaskImage: (taskId: string, imageUrl: string) => void
  addTaskEvidence: (taskId: string, evidence: Evidence) => void
  sendMessage: (contactId: string, text: string, attachments?: string[]) => void
  markAsRead: (contactId: string) => void
}

export const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(
    initialProperties as Property[],
  )
  const [tasks, setTasks] = useState<Task[]>(initialTasks as Task[])
  const [financials, setFinancials] = useState<Financials>(
    initialFinancials as Financials,
  )

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
              // Add to images for backward compatibility if needed, but not strictly required
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
    setMessages(
      messages.map((m) => {
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
      }),
    )
  }

  const markAsRead = (contactId: string) => {
    setMessages(
      messages.map((m) => (m.id === contactId ? { ...m, unread: 0 } : m)),
    )
  }

  return (
    <AppContext.Provider
      value={{
        properties,
        tasks,
        financials,
        messages,
        addProperty,
        updateTaskStatus,
        addTask,
        addInvoice,
        addTaskImage,
        addTaskEvidence,
        sendMessage,
        markAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
