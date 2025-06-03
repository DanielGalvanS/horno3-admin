"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🔄 Redirigiendo a login...');
        router.push('/authentication/login');
      } else {
        console.log('🔄 Redirigiendo a dashboard...');
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Cargando...</h2>
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Redirigiendo...</h2>
    </div>
  );
}