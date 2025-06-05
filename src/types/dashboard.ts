// src/types/dashboard.ts

export interface DashboardStats {
    visitantesHoy: number;
    visitantesMes: number;
    zonasActivas: number;
    totalZonas: number;
    duracionPromedio: number;
    showsHoy: number;
    crecimientoVisitantes: number; // porcentaje
  }
  
  export interface VisitantesPorDia {
    fecha: string;
    visitantes: number;
    dia: string;
  }
  
  export interface ZonaPopular {
    id: string;
    nombre: string;
    visitas: number;
    porcentaje: number;
    nivel: number;
    categoria: string;
    duracion: number;
  }
  
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
  }
  
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
  
  // Props para componentes
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