import { createContext, ReactNode, useState } from 'react'

export const AppContext = createContext<any>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [feedbacks, setFeedbacks] = useState([])
  const [campaigns, setCampaigns] = useState([])

  return (
    <AppContext.Provider
      value={{
        feedbacks,
        campaigns,
        addCampaign: () => {},
        updateCampaign: () => {},
        deleteCampaign: () => {},
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
