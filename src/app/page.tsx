'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) return <div>Cargando...</div>

  if (!user) {
    redirect('/authentication/login')
  }

  redirect('/dashboard') 
}