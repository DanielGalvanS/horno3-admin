'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthService } from '@/services/authService'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'

// Tipos
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error: string | null }>
}

interface AuthProviderProps {
  children: ReactNode
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
export function AuthProvider(props: AuthProviderProps) {
  const { children } = props
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkUser()

    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, !!session)
        
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      authListener.data.subscription?.unsubscribe()
    }
  }, [])

  async function checkUser() {
    try {
      console.log('🔍 Verificando usuario actual...')
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        console.log('✅ Usuario encontrado:', currentUser.email)
      } else {
        console.log('❌ No hay usuario autenticado')
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    setLoading(true)
    try {
      const result = await AuthService.login(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        
        router.push('/dashboard') 
        
        return { success: true, error: null }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado' }
    } finally {
      setLoading(false)
    }
  }

  async function register(email: string, password: string, name: string) {
    setLoading(true)
    try {
      const result = await AuthService.register(email, password, name)
      
      if (result.success) {
        const currentUser = await AuthService.getCurrentUser()
        
        if (currentUser) {
            setUser(currentUser)
            router.push('/dashboard')
        }
        
        return { success: true, error: null }
    } else {
        return { success: false, error: result.error }
    }} catch (error) {
      return { success: false, error: 'Error inesperado' }
  } finally {
    setLoading(false)
  }
}

  async function logout() {
    setLoading(true)
    try {
      await AuthService.logout()
      setUser(null)
      router.push('/authentication/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(email: string) {
    return await AuthService.resetPassword(email)
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}