'use client'

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { IconShieldCheck, IconShieldX } from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/authentication/login',
  '/authentication/register'
];

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAdmin = true,
  fallback 
}) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Esperar a que termine la verificación inicial
      if (loading) {
        return;
      }

      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

      console.log('🛡️ AuthGuard verificando:', {
        pathname,
        isPublicRoute,
        isAuthenticated,
        isAdmin,
        requireAdmin
      });

      // Si es ruta pública y está autenticado, redirigir al dashboard
      if (isPublicRoute && isAuthenticated) {
        console.log('📍 Usuario autenticado en ruta pública, redirigiendo...');
        router.replace('/dashboard');
        return;
      }

      // Si es ruta pública y no está autenticado, permitir acceso
      if (isPublicRoute && !isAuthenticated) {
        console.log('✅ Acceso permitido a ruta pública');
        setIsChecking(false);
        return;
      }

      // Si es ruta protegida y no está autenticado, redirigir al login
      if (!isPublicRoute && !isAuthenticated) {
        console.log('🚫 No autenticado, redirigiendo al login');
        router.replace('/authentication/login');
        return;
      }

      // Si es ruta protegida, está autenticado, pero no es admin y se requiere
      if (!isPublicRoute && isAuthenticated && requireAdmin && !isAdmin) {
        console.log('🚫 No es administrador, acceso denegado');
        setIsChecking(false);
        return;
      }

      // Si es ruta protegida, está autenticado y es admin (o no se requiere admin)
      if (!isPublicRoute && isAuthenticated && (!requireAdmin || isAdmin)) {
        console.log('✅ Acceso autorizado');
        setIsChecking(false);
        return;
      }

      // Fallback: si algo salió mal, redirigir al login
      console.warn('⚠️ Estado de auth inconsistente, redirigiendo al login');
      router.replace('/authentication/login');
    };

    checkAuth();
  }, [user, loading, isAuthenticated, isAdmin, pathname, router, requireAdmin]);

  // Mostrar loading mientras verifica auth
  if (loading || isChecking) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          backgroundColor: 'background.default'
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Verificando autenticación...
        </Typography>
      </Box>
    );
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Para rutas públicas, mostrar contenido directamente
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Para rutas protegidas, verificar autenticación y rol
  if (!isAuthenticated) {
    return fallback || (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3
        }}
      >
        <IconShieldX size={48} color="#f44336" />
        <Typography variant="h6" color="error">
          Acceso no autorizado
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Debes iniciar sesión para acceder a esta página
        </Typography>
      </Box>
    );
  }

  // Si requiere admin pero el usuario no lo es
  if (requireAdmin && !isAdmin) {
    return fallback || (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3
        }}
      >
        <IconShieldX size={48} color="#f44336" />
        <Typography variant="h6" color="error">
          Acceso restringido
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Solo administradores pueden acceder a esta sección
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, maxWidth: 400 }}>
          Tu cuenta no tiene los permisos necesarios para acceder al panel de administración.
        </Alert>
      </Box>
    );
  }

  // Usuario autenticado y autorizado, mostrar contenido
  return <>{children}</>;
};

export default AuthGuard;