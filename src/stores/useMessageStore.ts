import { useContext } from 'react'
import { AppContext } from '@/stores/AppContext'

const useMessageStore = () => {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useMessageStore must be used within AppProvider')

  return {
    messages: context.messages,
    typingStatus: context.typingStatus,
    sendMessage: context.sendMessage,
    markAsRead: context.markAsRead,
    startChat: context.startChat,
    setTyping: context.setTyping,
  }
}

export default useMessageStore
