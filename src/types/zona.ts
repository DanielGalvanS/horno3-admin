// src/types/zona.ts

// Tipo que coincide exactamente con la tabla zona en la base de datos
export interface Zona {
    id: string
    nombre: string
    descripcion: string | null
    categorias: string[] | null
    nivel: number | null
    duracion: number
    actividad: 'baja' | 'media' | 'alta'
    activo: boolean
  }
  
  // Tipo para crear nuevas zonas
  export interface CreateZonaData {
    nombre: string
    descripcion?: string | null
    categorias?: string[] | null
    nivel?: number | null
    duracion: number
    actividad: 'baja' | 'media' | 'alta'
    activo: boolean
  }

  export interface ValidationErrors {
    nombre?: string;
    descripcion?: string;
    categorias?: string;
    nivel?: string;
    duracion?: string;
    actividad?: string;
  }

  // Tipo para actualizar zonas
export interface UpdateZonaData extends Partial<CreateZonaData> {
    id?: never // No permitir cambiar el ID
  }
  
  // Tipos de utilidad para filtros y validaciones
  export type ActividadTipo = 'baja' | 'media' | 'alta';
  export type NivelTipo = 1 | 2 | 3;
  
  // Tipo para validaciones (si lo necesitas en el futuro)
  export interface ValidationErrors {
    [key: string]: string | undefined;
  }
  
  export interface ValidationErrors {
    nombre?: string;
    descripcion?: string;
    categorias?: string;
    nivel?: string;
    duracion?: string;
    actividad?: string;
  }