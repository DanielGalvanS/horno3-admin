// src/hooks/useDashboardBasic.ts - CORREGIDO 🔧
'use client';

import { useState, useEffect, useCallback } from 'react';
// 🔥 IMPORTAR desde el archivo principal de tipos
import type { 
  DashboardStats, 
  VisitantesPorDia, 
  ZonaPopular,
  EstadisticasVisitantes 
} from '@/types/dashboard';


interface DashboardData {
  kpis: DashboardStats;
  visitantesPorDia: {
    datos: VisitantesPorDia[];
    estadisticas: EstadisticasVisitantes;
    insight: string;
  };
  zonasPopulares: ZonaPopular[];
}

interface UseDashboardBasicReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useDashboardBasic(): UseDashboardBasicReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando datos del dashboard...');
      
      const response = await fetch('/api/dashboard/basic', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📊 Datos recibidos:', result);

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener datos del dashboard');
      }

      // 🎯 Transformar datos usando tipos importados
      const transformedData: DashboardData = {
        kpis: {
          visitantesHoy: result.data.kpis.visitantesHoy || 0,
          visitantesMes: (result.data.kpis.visitantesHoy || 0) * 30,
          visitantesAyer: result.data.kpis.visitantesAyer || 0,
          eventosHoy: result.data.kpis.eventosHoy || 0,
          showsHoy: result.data.kpis.showsHoy || 0,
          laboratoriosHoy: result.data.kpis.laboratoriosHoy || 0,
          capacidadHoy: result.data.kpis.capacidadHoy || 0,
          zonasActivas: result.data.kpis.zonasActivas || 0,
          totalZonas: 12,
          duracionPromedio: 85,
          crecimientoVisitantes: result.data.kpis.crecimientoVisitantes || 0
        },
        visitantesPorDia: result.data.visitantesPorDia,
        zonasPopulares: result.data.zonasPopulares
      };

      setData(transformedData);
      setLastUpdated(new Date());
      
      console.log('✅ Dashboard cargado correctamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error cargando dashboard:', errorMessage);
      setError(errorMessage);
      
      // 🔄 Datos de fallback con TODOS los campos
      setData({
        kpis: {
          visitantesHoy: 0,
          visitantesMes: 0,
          visitantesAyer: 0,
          eventosHoy: 0,
          showsHoy: 0,
          laboratoriosHoy: 0,
          capacidadHoy: 0,           // ⭐ Este era el que faltaba
          zonasActivas: 0,
          totalZonas: 12,
          duracionPromedio: 85,
          crecimientoVisitantes: 0
        },
        visitantesPorDia: {
          datos: [],
          estadisticas: { total: 0, promedio: 0, maximo: 0, minimo: 0 },
          insight: 'No hay datos disponibles'
        },
        zonasPopulares: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh del dashboard...');
      fetchData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
}