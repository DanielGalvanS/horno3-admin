// src/types/horarioshow.ts

export interface HorarioShow {
    id: string;
    dia: 'lunes' | 'martes' | 'miércoles' | 'jueves' | 'viernes' | 'sábado' | 'domingo';
    hora: string; // Formato HH:MM
    nombre?: string;
    descripcion?: string;
    tipo?: string;
    duracion?: number; // En minutos
    idioma?: string;
    cupo_maximo?: number;
    zona_id?: string;
    activo?: boolean;
  }
  
  export interface CreateHorarioShowData {
    dia: HorarioShow['dia'];
    hora: string;
    nombre?: string;
    descripcion?: string;
    tipo?: string;
    duracion?: number;
    idioma?: string;
    cupo_maximo?: number;
    zona_id?: string;
    activo?: boolean;
  }
  
  export interface UpdateHorarioShowData extends CreateHorarioShowData {
    id: string;
  }
  
  // Constantes útiles
  export const DIAS_SEMANA: { label: string; value: HorarioShow['dia'] }[] = [
    { label: 'Lunes', value: 'lunes' },
    { label: 'Martes', value: 'martes' },
    { label: 'Miércoles', value: 'miércoles' },
    { label: 'Jueves', value: 'jueves' },
    { label: 'Viernes', value: 'viernes' },
    { label: 'Sábado', value: 'sábado' },
    { label: 'Domingo', value: 'domingo' },
  ];
  
  export const TIPOS_SHOW: { label: string; value: string }[] = [
    { label: 'Laboratorio', value: 'laboratorio' },
    { label: 'Show', value: 'show' },
  ];
  
  export const IDIOMAS: { label: string; value: string }[] = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: '한국어', value: 'ko' },
  ];