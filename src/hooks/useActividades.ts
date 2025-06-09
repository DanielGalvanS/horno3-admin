// src/hooks/useActividades.ts - HOOK SIMPLIFICADO 🎯

'use client';

import { useActividades as useActividadesContext } from '@/contexts/ActividadesContext';

// 🎯 HOOK SUPER SIMPLE - Solo reexporta el context
export const useActividades = (limite?: number) => {
  const context = useActividadesContext();
  
  // Si se especifica un límite diferente, filtrar las actividades
  if (limite && limite !== 20) {
    return {
      ...context,
      actividades: context.actividades.slice(0, limite)
    };
  }
  
  return context;
};

// 🎯 HOOKS ESPECÍFICOS PARA CASOS PARTICULARES
export const useActividadesRecientes = (limite: number = 5) => {
  const { actividades, isRealtime, lastUpdated } = useActividadesContext();
  
  return {
    actividades: actividades.slice(0, limite),
    isRealtime,
    lastUpdated,
    total: actividades.length
  };
};

export const useActividadesPorTipo = (tipo: string, limite: number = 10) => {
  const { actividades } = useActividadesContext();
  
  const actividadesFiltradas = actividades
    .filter(act => act.tipo === tipo)
    .slice(0, limite);
  
  return {
    actividades: actividadesFiltradas,
    total: actividadesFiltradas.length
  };
};

export const useEstadoSistema = () => {
  const { isRealtime, isOnline, error, loading, lastUpdated } = useActividadesContext();
  
  return {
    isRealtime,
    isOnline,
    hasError: !!error,
    error,
    loading,
    lastUpdated,
    status: isRealtime ? 'realtime' : isOnline ? 'online' : 'offline'
  };
};