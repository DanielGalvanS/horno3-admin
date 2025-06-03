export interface Zona {
    id: string;
    nombre: string;
    descripcion: string;
    categorias: string[];
    nivel: number;
    duracion: number;
    actividad: 'baja' | 'media' | 'alta';
  }
  
  export interface CreateZonaData {
    nombre: string;
    descripcion: string;
    categorias: string;
    nivel: number;
    duracion: number;
    actividad: 'baja' | 'media' | 'alta';
  }
  
  export interface ValidationErrors {
    nombre?: string;
    descripcion?: string;
    categorias?: string;
    nivel?: string;
    duracion?: string;
    actividad?: string;
  }