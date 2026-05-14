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
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile((data as UserProfile) || null)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setProfile((data as UserProfile) || null)
            setLoading(false)
          })
          .catch(() => {
            setProfile(null)
            setLoading(false)
          })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
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
