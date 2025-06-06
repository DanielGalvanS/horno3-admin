// src/types/noticia.ts

import type { Zona } from './zona'

// Tipo base que coincide exactamente con la tabla en la base de datos
export interface NoticiaDB {
  id: string
  fecha_publicacion: string
  imagen_url: string | null
  zona_id: string | null
  titulo: string | null
  descripcion: string | null
}

// Tipo para mostrar en la aplicación (con zona populada)
export interface Noticia extends NoticiaDB {
  zona?: Zona | null
}

// Tipo para crear nuevas noticias
export interface CreateNoticiaData {
  titulo: string
  descripcion: string
  zona_id?: string | null
  imagen?: File
}

// Tipo para actualizar noticias
export interface UpdateNoticiaData extends Partial<CreateNoticiaData> {
  id?: never // No permitir cambiar el ID
}