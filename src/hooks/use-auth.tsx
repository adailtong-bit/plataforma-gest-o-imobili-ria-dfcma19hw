import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  permissions?: string[]
}

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  session: Session | null
  signUp: (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
  hasPermissionSync: (
    profile: UserProfile,
    resource: string,
    action?: string,
  ) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error(
            '[useAuth] Error fetching profile for user:',
            userId,
            error,
          )
        }

        if (mounted) {
          setProfile((data as UserProfile) || null)
        }
      } catch (error) {
        console.error('[useAuth] Exception in loadProfile:', error)
        if (mounted) {
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setLoading(false)
      } else if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session?.user) {
          setLoading(true)
          loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
      // For TOKEN_REFRESHED and USER_UPDATED, we only update the session state (handled above)
      // to avoid triggering full page reloads or loops.
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      // If we don't have a session, we can stop loading immediately.
      // If we DO have a session, onAuthStateChange (INITIAL_SESSION)
      // will handle loading the profile, preventing race conditions.
      if (!session) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const hasPermissionSync = (
    p: UserProfile,
    resource: string,
    action?: string,
  ) => {
    if (
      [
        'master',
        'super_admin',
        'platform_owner',
        'admin',
        'software_tenant',
      ].includes(p.role)
    )
      return true
    return true // Simplified initial permission check
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        signUp,
        signIn,
        signOut,
        loading,
        hasPermissionSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
