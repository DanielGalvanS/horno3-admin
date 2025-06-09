// src/types/dashboard.ts - CORREGIDO PARA TU PROYECTO 🔧

import React from 'react';

// 🔥 ACTUALIZADO: DashboardStats con todos los campos necesarios
export interface DashboardStats {
  visitantesHoy: number;
  visitantesMes: number;
  visitantesAyer: number;         // 🆕 Necesario para crecimiento
  eventosHoy: number;             // 🆕 Para el nuevo KPI
  showsHoy: number;
  laboratoriosHoy: number;        // 🆕 Para el nuevo KPI
  capacidadHoy: number;           // 🆕 Para el KPI de capacidad ⭐ ESTE FALTABA
  zonasActivas: number;
  totalZonas: number;
  duracionPromedio: number;
  crecimientoVisitantes: number;
}

// ✅ TUS TIPOS ORIGINALES (sin cambios)
export interface VisitantesPorDia {
  fecha: string;
  visitantes: number;
  dia: string;
  duracionPromedio?: number;      // 🆕 Opcional para datos adicionales
}

// 🔥 ACTUALIZADO: ZonaPopular con campos adicionales para datos reales
export interface ZonaPopular {
  id: string;
  nombre: string;
  ranking: number;                // 🆕 Para el ranking real
  visitas: number;
  porcentaje: number;
  nivel: number;
  categoria: string;
  duracion: number;
  actividad?: string;             // 🆕 Actividad de la zona
  shows?: number;                 // 🆕 Número de shows
  laboratorios?: number;          // 🆕 Número de laboratorios
  clasificacion?: string;         // 🆕 Clasificación calculada
}

// ✅ TUS TIPOS ORIGINALES (sin cambios)
export interface ActividadReciente {
  id: string;
  tipo: 'visita' | 'show' | 'noticia' | 'contenido';
  titulo: string;
  descripcion: string;
  timestamp: string;
  usuario?: string;
  zona?: string;
  icono: string;
  color: 'green' | 'blue' | 'orange' | 'purple';
  
  // Campos opcionales para tiempo real
  prioridad?: 'critica' | 'alta' | 'media' | 'baja';
  categoria?: string;
  esReciente?: boolean;
  tiempoTranscurrido?: string;
  datosAdicionales?: Record<string, any>;
}

// ✅ TUS TIPOS ORIGINALES (sin cambios)
export interface ShowProximo {
  id: string;
  nombre: string;
  hora: string;
  zona: string;
  ocupacion: number;
  capacidadMaxima: number;
  estado: 'programado' | 'en_curso' | 'finalizado';
}

export interface PreferenciaVisitante {
  tipo_acompanantes: 'familia' | 'pareja' | 'solo' | 'mayores';
  actividad_preferida: 'baja' | 'media' | 'alta';
  desea_show: boolean;
  restricciones: string[];
  intereses: string[];
}

export interface AnaliticsData {
  visitantesPorHora: { hora: string; visitantes: number }[];
  visitantesPorEdad: { grupo: string; cantidad: number }[];
  preferenciasActividad: { actividad: string; porcentaje: number }[];
  zonasPopularesPorMes: { zona: string; visitas: number; mes: string }[];
}

// ✅ TUS PROPS ORIGINALES (sin cambios)
export interface KPICardProps {
  titulo: string;
  valor: number | string;
  sufijo?: string;
  prefijo?: React.ReactNode;
  cambio?: number;
  icono: React.ReactNode;
  color?: string;
  gradient?: string;
  loading?: boolean;
}

export interface ChartCardProps {
  titulo: string;
  data: any[];
  tipo: 'line' | 'column' | 'pie' | 'area';
  altura?: number;
  loading?: boolean;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  titulo?: string;
  acciones?: React.ReactNode;
}

// 🆕 TIPOS ADICIONALES PARA EL DASHBOARD CON DATOS REALES
export interface EstadisticasVisitantes {
  total: number;
  promedio: number;
  maximo: number;
  minimo: number;
}

export interface DashboardApiResponse {
  success: boolean;
  data: {
    kpis: DashboardStats;
    visitantesPorDia: {
      datos: VisitantesPorDia[];
      estadisticas: EstadisticasVisitantes;
      insight: string;
    };
    zonasPopulares: ZonaPopular[];
    metadata?: {
      timestamp: string;
      processingTimeMs: number;
    };
  };
  error?: string;
}

// 🎯 Props para componentes con datos reales
export interface VisitantesChartProps {
  data: VisitantesPorDia[];
  loading?: boolean;
  estadisticas?: EstadisticasVisitantes;
  insight?: string;
}

export interface ActivityTimelineProps {
  actividades: ActividadReciente[];
  loading?: boolean;
  altura?: number;
  isRealtime?: boolean;
  lastUpdated?: Date | null;
  totalActividades?: number;
  maxItems?: number;
}