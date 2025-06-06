// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada')
}

// Cliente para operaciones del lado del cliente (navegador)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para operaciones del lado del servidor (API routes)
// Si no hay Service Role Key, usar el cliente normal
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey, // Fallback al anon key si no hay service key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Advertir si no hay Service Role Key
if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY no está configurada. Usando ANON_KEY como fallback.')
  console.warn('💡 Para operaciones administrativas, configura el Service Role Key en .env.local')
}

// Tipos para TypeScript
export interface User {
  id: string
  email: string
  name?: string
  role?: string
}

export interface AuthResponse {
  user: User | null
  error: string | null
  success: boolean
}