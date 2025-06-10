// app/api/auth/logout/route.ts - Endpoint profesional de logout
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 [API] Procesando logout...');

    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso'
    });

    // Obtener cookies
    const cookieStore = await cookies();
    
    // Lista completa de cookies a limpiar
    const cookiesToClear = [
      // Supabase cookies estándar
      'sb-access-token',
      'sb-refresh-token', 
      'sb-auth-token',
      'sb-session',
      'sb-user',
      'sb-provider-token',
      'sb-provider-refresh-token',
      
      // Variaciones de nombres de cookies de Supabase
      'supabase-auth-token',
      'supabase.auth.token',
      'supabase_auth_token',
      
      // Cookies de sesión generales
      'auth-token',
      'session',
      'user-session',
      'admin-session'
    ];

    // Limpiar cookies específicas
    cookiesToClear.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });

    // Limpiar cookies dinámicas que empiecen con patrones conocidos
    try {
      const allCookies = cookieStore.getAll();
      
      allCookies.forEach(cookie => {
        const name = cookie.name;
        
        // Patrones para identificar cookies de autenticación
        const patterns = [
          /^sb-/,           // Supabase
          /supabase/i,      // Cualquier cosa con "supabase"
          /auth/i,          // Cualquier cosa con "auth"
          /session/i,       // Cualquier cosa con "session"
          /token/i          // Cualquier cosa con "token"
        ];
        
        const shouldDelete = patterns.some(pattern => pattern.test(name));
        
        if (shouldDelete) {
          response.cookies.delete(name);
          console.log(`🧹 Cookie eliminada: ${name}`);
        }
      });
    } catch (cookieError) {
      console.warn('⚠️ Error accediendo a cookies dinámicas:', cookieError);
    }

    // Headers adicionales para asegurar limpieza completa
    response.headers.set('Clear-Site-Data', '"cookies", "storage", "cache"');
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Header personalizado para indicar logout exitoso
    response.headers.set('X-Logout-Success', 'true');

    console.log('✅ [API] Logout procesado exitosamente');

    return response;

  } catch (error: any) {
    console.error('❌ [API] Error crítico en logout:', error);
    
    // Incluso si hay error, intentar limpiar lo básico
    const errorResponse = NextResponse.json({
      success: false,
      error: 'Error al cerrar sesión'
    }, { status: 500 });

    // Limpiar cookies críticas aunque haya error
    errorResponse.cookies.delete('sb-access-token');
    errorResponse.cookies.delete('sb-refresh-token');
    errorResponse.cookies.delete('sb-session');

    return errorResponse;
  }
}