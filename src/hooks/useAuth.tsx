'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthService } from '@/services/authService'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/supabase'

// Tipos
interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

interface AuthProviderProps {
  children: ReactNode
}

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = ['/authentication/login', '/authentication/register'];

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Valores computados
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'administrador'

  /**
   * Verificar autenticación del usuario
   */
  const checkAuth = useCallback(async () => {
    try {
      console.log('🔍 Verificando autenticación...')
      
      const currentUser = await AuthService.getCurrentUser()
      
      if (currentUser) {
        console.log('✅ Usuario autenticado:', currentUser.email, 'Rol:', currentUser.role)
        setUser(currentUser)
        
        // Si está en página pública, redirigir al dashboard
        if (PUBLIC_ROUTES.includes(pathname)) {
          router.replace('/dashboard')
        }
      } else {
        console.log('❌ No hay usuario autenticado')
        setUser(null)
        
        // Si está en página protegida, redirigir al login
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace('/authentication/login')
        }
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error)
      setUser(null)
      
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.replace('/authentication/login')
      }
    } finally {
      setLoading(false)
    }
  }, [pathname, router])

  /**
   * Manejar cambios de estado de autenticación
   */
  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    console.log('🔄 Cambio de estado de auth:', event, !!session)
    
    try {
      if (event === 'SIGNED_IN' && session) {
        const currentUser = await AuthService.getCurrentUser()
        
        if (currentUser) {
          console.log('✅ Usuario logueado:', currentUser.email)
          setUser(currentUser)
          
          // Solo redirigir si está en página pública
          if (PUBLIC_ROUTES.includes(pathname)) {
            router.replace('/dashboard')
          }
        } else {
          console.warn('⚠️ Sesión inválida - cerrando')
          setUser(null)
          router.replace('/authentication/login')
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuario deslogueado')
        setUser(null)
        
        // Solo redirigir si está en página protegida
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace('/authentication/login')
        }
      }
    } catch (error) {
      console.error('❌ Error en cambio de estado:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [pathname, router])

  /**
   * Inicialización y listeners
   */
  useEffect(() => {
    // Verificación inicial
    checkAuth()

    // Listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    return () => {
      subscription?.unsubscribe()
    }
  }, [checkAuth, handleAuthStateChange])

  /**
   * Función de login
   */
  const login = async (email: string, password: string) => {
    setLoading(true)
    
    try {
      console.log('🔐 Iniciando login desde context...')
      
      const result = await AuthService.login(email, password)
      
      if (result.success && result.user) {
        setUser(result.user)
        console.log('✅ Login exitoso, redirigiendo...')
        
        // Usar replace para evitar que puedan volver atrás
        router.replace('/dashboard')
        
        return { success: true, error: null }
      } else {
        console.error('❌ Login fallido:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.error('❌ Error crítico en login:', error)
      return { success: false, error: 'Error inesperado. Intenta de nuevo.' }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función de registro
   */
  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    
    try {
      console.log('📝 Iniciando registro desde context...')
      
      const result = await AuthService.register(email, password, name)
      
      if (result.success && result.user) {
        setUser(result.user)
        console.log('✅ Registro exitoso, redirigiendo...')
        
        router.replace('/dashboard')
        
        return { success: true, error: null }
      } else {
        console.error('❌ Registro fallido:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.error('❌ Error crítico en registro:', error)
      return { success: false, error: 'Error inesperado. Intenta de nuevo.' }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Función de logout
   */
  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout desde context...')
      
      // Llamar API de logout primero
      try {
        const response = await fetch('/api/auth/logout', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        console.log('🌐 Respuesta del servidor:', response.status)
      } catch (serverError) {
        console.warn('⚠️ Error del servidor (continuando):', serverError)
      }

      // Cerrar sesión en Supabase
      await AuthService.logout()
      
      // Limpiar estado inmediatamente
      setUser(null)
      
      console.log('✅ Logout completado, redirigiendo...')
      
      // Forzar navegación completa para limpiar todo el estado
      window.location.replace('/authentication/login')
      
    } catch (error: any) {
      console.error('❌ Error en logout:', error)
      
      // Fallback: limpiar estado y forzar redirect
      setUser(null)
      window.location.replace('/authentication/login')
    }
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  
  return context
}