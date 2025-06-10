// services/authService.ts - Versión profesional y completa
import { supabase } from '@/lib/supabase'
import type { AuthResponse, User } from '@/lib/supabase'

export class AuthService {
  // Constantes
  private static readonly ALLOWED_ROLES = ['administrador'];
  private static readonly DEFAULT_ROLE = 'administrador';

  /**
   * Registrar nuevo usuario administrador
   */
  static async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Iniciando registro de administrador:', email);

      // Validaciones básicas
      if (!email || !password || !name) {
        return { user: null, error: 'Todos los campos son obligatorios', success: false };
      }

      if (password.length < 6) {
        return { user: null, error: 'La contraseña debe tener al menos 6 caracteres', success: false };
      }

      // Crear usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            role: this.DEFAULT_ROLE
          }
        }
      });

      if (error) {
        console.error('❌ Error en Supabase Auth:', error);
        return { user: null, error: this.getFormattedError(error.message), success: false };
      }

      if (!data.user) {
        return { user: null, error: 'Error al crear la cuenta', success: false };
      }

      // Crear registro en tabla usuario
      const { error: dbError } = await supabase
        .from('usuario')
        .insert({
          auth_user_id: data.user.id,
          email: email.toLowerCase().trim(),
          nombre: name.trim(),
          tipo_usuario: this.DEFAULT_ROLE,
          fecha_creacion: new Date().toISOString()
        });

      if (dbError) {
        console.error('⚠️ Error creando usuario en BD:', dbError);
        // No fallar aquí, el usuario se creó en Auth
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: name.trim(),
        role: this.DEFAULT_ROLE
      };

      console.log('✅ Usuario administrador registrado exitosamente');
      return { user, error: null, success: true };

    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      return { user: null, error: 'Error de conexión. Intenta de nuevo.', success: false };
    }
  }

  /**
   * Iniciar sesión con validación de rol
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Iniciando login:', email);

      // Validaciones básicas
      if (!email || !password) {
        return { user: null, error: 'Email y contraseña son obligatorios', success: false };
      }

      // Autenticar en Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        console.error('❌ Error en login:', error);
        return { user: null, error: this.getFormattedError(error.message), success: false };
      }

      if (!data.user) {
        return { user: null, error: 'Credenciales inválidas', success: false };
      }

      // Verificar rol del usuario
      const userRole = data.user.user_metadata?.role || 'usuario';
      
      if (!this.ALLOWED_ROLES.includes(userRole)) {
        console.warn('🚫 Acceso denegado - rol no autorizado:', userRole);
        
        // Cerrar sesión inmediatamente
        await supabase.auth.signOut();
        
        return { 
          user: null, 
          error: 'Acceso denegado. Solo administradores pueden acceder a este panel.', 
          success: false 
        };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || 'Administrador',
        role: userRole
      };

      console.log('✅ Login exitoso para administrador:', user.email);
      return { user, error: null, success: true };

    } catch (error: any) {
      console.error('❌ Error en login:', error);
      return { user: null, error: 'Error de conexión. Intenta de nuevo.', success: false };
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🚪 Cerrando sesión...');

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error en logout:', error);
        return { success: false, error: 'Error al cerrar sesión' };
      }

      // Limpiar storage local
      this.clearLocalStorage();

      console.log('✅ Sesión cerrada exitosamente');
      return { success: true, error: null };

    } catch (error: any) {
      console.error('❌ Error crítico en logout:', error);
      
      // Forzar limpieza aunque falle
      this.clearLocalStorage();
      return { success: false, error: 'Error de conexión' };
    }
  }

  /**
   * Obtener usuario actual con validación de rol
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Verificar que el usuario tenga rol autorizado
      const userRole = user.user_metadata?.role || 'usuario';
      
      if (!this.ALLOWED_ROLES.includes(userRole)) {
        console.warn('🚫 Usuario con rol no autorizado detectado:', userRole);
        await this.logout(); // Cerrar sesión automáticamente
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || 'Administrador',
        role: userRole
      };

    } catch (error: any) {
      console.error('❌ Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Verificar si hay sesión activa válida
   */
  static async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      // Verificar rol en la sesión
      const userRole = session.user.user_metadata?.role || 'usuario';
      
      if (!this.ALLOWED_ROLES.includes(userRole)) {
        console.warn('🚫 Sesión con rol no autorizado:', userRole);
        await this.logout();
        return null;
      }

      return session;

    } catch (error: any) {
      console.error('❌ Error obteniendo sesión:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario es administrador
   */
  static async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user?.role === 'administrador' || false;
    } catch {
      return false;
    }
  }

  /**
   * Limpiar localStorage y sessionStorage
   */
  private static clearLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Limpiar cookies de Supabase
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'sb-auth-token',
        'sb-session',
        'sb-user'
      ];

      cookiesToClear.forEach(cookie => {
        localStorage.removeItem(cookie);
        sessionStorage.removeItem(cookie);
      });

      // Limpiar cualquier cosa que empiece con 'sb-'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });

      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      });

    } catch (error) {
      console.warn('⚠️ Error limpiando storage:', error);
    }
  }

  /**
   * Formatear mensajes de error para el usuario
   */
  private static getFormattedError(error: string): string {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Email o contraseña incorrectos',
      'Email not confirmed': 'Por favor verifica tu email antes de iniciar sesión',
      'User already registered': 'Este email ya está registrado',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Invalid email': 'Email inválido',
      'signup_disabled': 'El registro está deshabilitado temporalmente',
      'email_address_invalid': 'Email inválido',
      'password_too_short': 'La contraseña es muy corta'
    };

    return errorMap[error] || 'Error de autenticación. Intenta de nuevo.';
  }
}