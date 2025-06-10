'use client';

import { useState, useEffect, useCallback } from 'react';

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

interface VisitantesData {
  datos: VisitantesPorDia[];
  estadisticas: EstadisticasVisitantes;
  estadisticasAgregadas?: EstadisticasAgregadas;
  insight: string;
  rangeFechas?: {
    inicio: string;
    fin: string;
    totalDias: number;
  };
}

interface UseVisitantesDataReturn {
  data: VisitantesData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  changeWeek: (startDate: string, endDate: string) => Promise<void>;
  lastUpdated: Date | null;
}

export function useVisitantesData(): UseVisitantesDataReturn {
  const [data, setData] = useState<VisitantesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentRange, setCurrentRange] = useState<{start: string, end: string} | null>(null);

  const getCurrentWeek = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  }, []);

  const fetchData = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);

      let url: string;
      let range = { start: '', end: '' };

      if (startDate && endDate) {
        // Usar API flexible para rangos específicos
        const params = new URLSearchParams({
          startDate: startDate,
          endDate: endDate
        });
        url = `/api/dashboard/visitantes?${params}`;
        range = { start: startDate, end: endDate };
      } else {
        // Usar API básica para semana actual
        url = '/api/dashboard/basic';
        range = getCurrentWeek();
      }

      console.log(`🔄 Cargando desde: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al obtener datos');
      }

      setData(result.data.visitantesPorDia);
      setCurrentRange(range);
      setLastUpdated(new Date());
      
      console.log('✅ Datos cargados correctamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error cargando datos:', errorMessage);
      setError(errorMessage);
      
      setData({
        datos: [],
        estadisticas: { total: 0, promedio: 0, maximo: 0, minimo: 0 },
        insight: 'Error al cargar datos de visitantes'
      });
    } finally {
      setLoading(false);
    }
  }, [getCurrentWeek]);

  const changeWeek = useCallback(async (startDate: string, endDate: string) => {
    await fetchData(startDate, endDate);
  }, [fetchData]);

  const refetch = useCallback(async () => {
    if (currentRange) {
      await fetchData(currentRange.start, currentRange.end);
    } else {
      await fetchData();
    }
  }, [fetchData, currentRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    changeWeek,
    lastUpdated
  };
}