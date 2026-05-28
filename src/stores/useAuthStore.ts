import { create } from 'zustand'

interface AuthUser {
  id: string
  email?: string
  name?: string
  role?: string
  avatar?: string
  isDemo?: boolean
  language_preference?: string
}

interface AuthState {
  isAuthenticated: boolean
  isAuthLoading: boolean
  currentUser: AuthUser | null
  allUsers: AuthUser[]
  simulationMode: boolean
  simulationRole: string | null
  setAuth: (isAuthenticated: boolean, user: any) => void
  setCurrentUser: (userId: string | AuthUser) => void
  logout: () => void
  hasPermissionSync: (user: any, resource: string, action: string) => boolean
}

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isAuthLoading: true,
  currentUser: null,
  allUsers: [
    { id: 'admin1', name: 'Admin Demo', role: 'master', isDemo: true },
    { id: 'owner1', name: 'Owner Demo', role: 'property_owner', isDemo: true },
    { id: 'tenant1', name: 'Tenant Demo', role: 'tenant', isDemo: true },
  ],
  simulationMode: false,
  simulationRole: null,

  setAuth: (isAuthenticated, user) => {
    let authUser = null
    if (user) {
      authUser = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        role: user.user_metadata?.role || 'master',
        language_preference: user.user_metadata?.language_preference || 'en',
      }
    }
    set({ isAuthenticated, isAuthLoading: false, currentUser: authUser })
  },

  setCurrentUser: (userId) => {
    if (typeof userId === 'string') {
      const user = get().allUsers.find((u) => u.id === userId)
      if (user) {
        set({
          currentUser: user,
          isAuthenticated: true,
          simulationMode: true,
          simulationRole: user.role,
        })
      }
    } else {
      set({ currentUser: userId })
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null,
      simulationMode: false,
      simulationRole: null,
    })
  },

  hasPermissionSync: (user, resource, action) => {
    if (!user) return false
    if (user.role === 'master' || user.role === 'platform_owner') return true

    // Fallback logic
    const perms: Record<string, string[]> = {
      property_owner: ['dashboard', 'properties', 'financial'],
      tenant: ['dashboard', 'financial'],
      partner: ['dashboard', 'tasks'],
    }

    if (perms[user.role] && perms[user.role].includes(resource)) {
      return true
    }

    return true // Fail open for demo
  },
}))

export default useAuthStore
