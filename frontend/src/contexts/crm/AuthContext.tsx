import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../supabase'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  company?: string
  role?: string
  onboardingCompleted?: boolean
  onboarding_completed?: boolean
  subscription?: {
    planId?: string
    usage?: {
      leadsUnlockedThisMonth?: number
    }
    limits?: {
      maxLeadsPerMonth?: number
    }
  }
  profile?: any
  portfolio?: any
  strategy?: any
  icp?: any
  productGroups?: any[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    name: string
    password: string
    company: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Fetch additional user profile data from public.users table if needed
        fetchUserProfile(session.user.id, session.user.email!)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id, session.user.email!)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (id: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        // Handle common RLS or missing profile issues
        console.warn('Profile fetch error:', error.message)

        // Fallback: Ensure both camelCase and snake_case are present to prevent redirect loops
        setUser({
          id,
          email,
          name: email.split('@')[0],
          onboarding_completed: true,
          onboardingCompleted: true,
          role: 'user'
        })
        return
      }

      if (data) {
        // Merge data and ensure camelCase mapping
        setUser({
          ...data,
          id,
          email,
          onboardingCompleted: data.onboarding_completed ?? data.onboardingCompleted
        })
      } else {
        setUser({ id, email, name: email.split('@')[0], onboardingCompleted: true })
      }
    } catch (err) {
      console.error('Critical error fetching profile:', err)
      setUser({ id, email, name: email.split('@')[0], onboardingCompleted: true })
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back!')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message.includes('Email not confirmed')) {
        toast.error('Please verify your email address before logging in.')
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password.')
      } else {
        toast.error(error.message || 'Login failed')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    email: string
    name: string
    password: string
    company: string
  }) => {
    try {
      setIsLoading(true)
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            company: data.company
          }
        }
      })
      if (error) throw error

      // Profile creation is now handled by the database trigger 'on_auth_user_created'
      // This prevents duplicate key errors and ensures atomicity.

      toast.success('Registration successful! Please check your email.')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
