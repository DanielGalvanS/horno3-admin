// services/authService.ts
import { supabase } from '@/lib/supabase'
import type { AuthResponse, User } from '@/lib/supabase'

export class AuthService {
  // Registrar nuevo usuario
  static async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: 'administrador' 
          }
        }
      })

      if (error) {
        return { user: null, error: error.message, success: false }
      }

      if (data.user) {
        const { error: dbError } = await supabase
          .from('usuario')
          .insert({
            auth_user_id: data.user.id, 
            email: email,
            nombre: name,
            tipo_usuario: 'administrador',     
            fecha_creacion: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19)
          })

        if (dbError) {
          console.error('Error creando usuario en tabla usuario:', dbError)
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: name,
          role: 'administrador'
        }
        return { user, error: null, success: true }
      }

      return { user: null, error: 'Error desconocido', success: false }
    } catch (error) {
      return { user: null, error: 'Error de conexión', success: false }
    }
  }

  // Iniciar sesión
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message, success: false }
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || 'Admin',
          role: data.user.user_metadata?.role || 'administrador'
        }
        return { user, error: null, success: true }
      }

      return { user: null, error: 'Error desconocido', success: false }
    } catch (error) {
      return { user: null, error: 'Error de conexión', success: false }
    }
  }

  // Cerrar sesión
  static async logout(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    }
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        return {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || 'Admin',
          role: user.user_metadata?.role || 'admin'
        }
      }
      
      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Verificar si hay sesión activa
  static async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  // Recuperar contraseña
  static async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/authentication/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    }
  }
}