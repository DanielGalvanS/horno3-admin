'use client';

import { useState, useEffect, useCallback } from 'react';

interface DashboardStats {
  visitantesHoy: number;
  visitantesMes: number;
  visitantesAyer: number;
  eventosHoy: number;
  showsHoy: number;
  laboratoriosHoy: number;
  capacidadHoy: number;
  zonasActivas: number;
  totalZonas: number;
  duracionPromedio: number;
  crecimientoVisitantes: number;
}

interface VisitantesPorDia {
  fecha: string;
  visitantes: number;
  dia_semana: string;
  dia_numero?: number;
  duracion_promedio?: number;
  visitantes_dia_anterior?: number;
  crecimiento_diario?: number;
  nivel_actividad?: string;
  tipo_dia?: string;
  ranking_visitantes?: number;
  promedio_movil_3dias?: number;
  es_dia_pico?: boolean;
  es_dia_minimo?: boolean;
}

interface EstadisticasVisitantes {
  total: number;
  promedio: number;
  maximo: number;
  minimo: number;
}

interface EstadisticasAgregadas {
  total_visitantes_semana: number;
  promedio_diario: number;
  maximo_dia: number;
  minimo_dia: number;
  duracion_promedio_semana: number;
  total_visitantes_semana_pasada: number;
  crecimiento_semanal: number;
  dias_con_actividad: number;
  dias_sin_actividad: number;
  mejor_dia: string;
  peor_dia: string;
  tendencia_general: 'Creciendo' | 'Decreciendo' | 'Estable';
}

interface ZonaPopular {
  id: string;
  nombre: string;
  ranking: number;
  visitas: number;
  porcentaje: number;
  nivel: number;
  categoria: string;
  duracion: number;
  actividad?: string;
  shows?: number;
  laboratorios?: number;
  clasificacion?: string;
}

interface DashboardData {
  kpis: DashboardStats;
  visitantesPorDia: {
    datos: VisitantesPorDia[];
    estadisticas: EstadisticasVisitantes;
    estadisticasAgregadas?: EstadisticasAgregadas;
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
          totalZonas: result.data.kpis.totalZonas || 0,
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
      
      setData({
        kpis: {
          visitantesHoy: 0,
          visitantesMes: 0,
          visitantesAyer: 0,
          eventosHoy: 0,
          showsHoy: 0,
          laboratoriosHoy: 0,
          capacidadHoy: 0,
          zonasActivas: 0,
          totalZonas: 0,
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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