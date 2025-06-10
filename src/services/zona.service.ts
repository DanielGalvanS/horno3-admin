// src/services/zona.service.ts
import { supabaseAdmin } from '@/lib/supabase';
import type { Zona, CreateZonaData } from '@/types/zona';

export class ZonaService {
  // Obtener todas las zonas
  static async getAll(): Promise<Zona[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('zona')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error al obtener zonas:', error);
        throw new Error(`Error al obtener zonas: ${error.message}`);
      }

      return (data as Zona[]) || [];
    } catch (error: any) {
      console.error('Error en ZonaService.getAll:', error);
      throw error;
    }
  }

  // Obtener zona por ID
  // Método getById mejorado en zona.service.ts

// Obtener zona por ID (mejorado para manejar casos cuando no existe)
// Método getById mejorado en zona.service.ts

static async getById(id: string): Promise<Zona | null> {
  try {
    console.log(`🔍 Buscando zona con ID: ${id}`);
    
    const { data, error } = await supabaseAdmin
      .from('zona')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Si es "no encontrado", retornar null
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        console.log(`ℹ️ Zona con ID ${id} no encontrada`);
        return null;
      }
      
      console.error('❌ Error al obtener zona:', error);
      throw new Error(`Error al obtener zona: ${error.message}`);
    }

    if (!data) {
      console.log(`ℹ️ Zona con ID ${id} no encontrada (data null)`);
      return null;
    }

    console.log(`✅ Zona encontrada: ${data.nombre}`);
    return data as Zona;
    
  } catch (error: any) {
    console.error('❌ Error en ZonaService.getById:', error);
    throw error;
  }
}

  // Crear nueva zona
  static async create(zonaData: CreateZonaData): Promise<Zona> {
    try {
      const { data, error } = await supabaseAdmin
        .from('zona')
        .insert(zonaData)
        .select()
        .single();

      if (error) {
        console.error('Error al crear zona:', error);
        throw new Error(`Error al crear zona: ${error.message}`);
      }

      return data as Zona;
    } catch (error: any) {
      console.error('Error en ZonaService.create:', error);
      throw error;
    }
  }

  // Actualizar zona
  static async update(id: string, zonaData: Partial<CreateZonaData>): Promise<Zona> {
    try {
      const { data, error } = await supabaseAdmin
        .from('zona')
        .update(zonaData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar zona:', error);
        throw new Error(`Error al actualizar zona: ${error.message}`);
      }

      return data as Zona;
    } catch (error: any) {
      console.error('Error en ZonaService.update:', error);
      throw error;
    }
  }

  // Eliminar zona
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('zona')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar zona:', error);
        throw new Error(`Error al eliminar zona: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error en ZonaService.delete:', error);
      throw error;
    }
  }

  // 🖼️ NUEVOS MÉTODOS PARA MANEJO DE IMÁGENES

  // Subir imagen a bucket de secciones
  static async uploadImage(file: File, zonaId?: string): Promise<string> {
    try {
      // Generar nombre único para la imagen
      const fileExt = file.name.split('.').pop();
      const fileName = `${zonaId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `secciones/${fileName}`;

      console.log(`📤 Subiendo imagen: ${filePath}`);

      // Subir archivo al bucket
      const { data, error } = await supabaseAdmin.storage
        .from('imagenes-secciones')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error al subir imagen:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabaseAdmin.storage
        .from('imagenes-secciones')
        .getPublicUrl(filePath);

      console.log(`✅ Imagen subida: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;

    } catch (error: any) {
      console.error('Error en ZonaService.uploadImage:', error);
      throw error;
    }
  }

  // Eliminar imagen del bucket
  

  // Crear zona con imagen
  static async createWithImage(zonaData: CreateZonaData, imageFile?: File): Promise<Zona> {
    try {
      let imagen_url = null;

      // Si hay archivo de imagen, subirlo primero
      if (imageFile) {
        imagen_url = await this.uploadImage(imageFile);
      }

      // Crear zona con la URL de la imagen
      const zonaConImagen = {
        ...zonaData,
        imagen_url
      };

      return await this.create(zonaConImagen);

    } catch (error: any) {
      console.error('Error en ZonaService.createWithImage:', error);
      throw error;
    }
  }

  // Actualizar zona con imagen
  static async updateWithImage(
    id: string, 
    zonaData: Partial<CreateZonaData>, 
    imageFile?: File,
    deleteCurrentImage?: boolean
  ): Promise<Zona> {
    try {
      let imagen_url = zonaData.imagen_url;

      // Obtener zona actual para la imagen existente
      const zonaActual = await this.getById(id);
      
      // Si se quiere eliminar la imagen actual
      if (deleteCurrentImage && zonaActual?.imagen_url) {
        await this.deleteImage(zonaActual.imagen_url);
        imagen_url = null;
      }

      // Si hay nuevo archivo de imagen, subirlo
      if (imageFile) {
        // Eliminar imagen anterior si existe
        if (zonaActual?.imagen_url) {
          await this.deleteImage(zonaActual.imagen_url);
        }
        
        imagen_url = await this.uploadImage(imageFile, id);
      }

      // Actualizar zona con nueva URL de imagen
      const zonaActualizada = {
        ...zonaData,
        imagen_url
      };

      return await this.update(id, zonaActualizada);

    } catch (error: any) {
      console.error('Error en ZonaService.updateWithImage:', error);
      throw error;
    }
  }

  // Eliminar zona y su imagen
  // Método deleteWithImage mejorado en zona.service.ts

// Eliminar zona y su imagen (método mejorado y más robusto)

// Reemplazar método deleteWithImage en zona.service.ts

// Eliminar zona y su imagen (patrón igual que noticias)

// También mejorar deleteImage para que sea más robusto

// ✅ Verificar si la zona está siendo utilizada por otros elementos


// ✅ Obtener detalles de uso de la zona


// ✅ Método deleteWithImage mejorado con mejor manejo de errores
// Reemplaza el método deleteWithImage en zona.service.ts

// Eliminar zona y su imagen (simplificado - la BD maneja las referencias automáticamente)
static async deleteWithImage(id: string): Promise<void> {
  try {
    console.log(`🗑️ Iniciando eliminación de zona: ${id}`);

    // Obtener zona para eliminar imagen si existe
    const zona = await this.getById(id);
    
    if (!zona) {
      throw new Error('Zona no encontrada');
    }

    // ✅ Eliminar de la base de datos (ON DELETE SET NULL maneja las referencias automáticamente)
    const { error } = await supabaseAdmin
      .from('zona')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar zona de BD:', error);
      throw new Error(`Error al eliminar zona: ${error.message}`);
    }

    console.log(`✅ Zona ${id} eliminada de la base de datos`);

    // ✅ Eliminar imagen si existe
    if (zona.imagen_url) {
      try {
        await this.deleteImage(zona.imagen_url);
        console.log(`🖼️ Imagen eliminada: ${zona.imagen_url}`);
      } catch (deleteError) {
        console.error('⚠️ Error al eliminar imagen:', deleteError);
        // No lanzar error aquí, la zona ya fue eliminada exitosamente
      }
    }

    console.log(`✅ Eliminación completa de zona ${id}`);

  } catch (error: any) {
    console.error('❌ Error en ZonaService.deleteWithImage:', error);
    throw error;
  }
}

// ✅ Método deleteImage mejorado
// Agrega este método deleteImage después del método uploadImage en zona.service.ts

// Eliminar imagen del bucket
static async deleteImage(imageUrl: string): Promise<void> {
  try {
    console.log(`🗑️ Eliminando imagen: ${imageUrl}`);
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.warn('URL de imagen inválida');
      return;
    }

    // Extraer path del archivo
    let filePath: string;
    
    if (imageUrl.includes('/storage/v1/object/public/imagenes-secciones/')) {
      const parts = imageUrl.split('/storage/v1/object/public/imagenes-secciones/');
      if (parts.length === 2) {
        filePath = parts[1];
      } else {
        console.warn('No se pudo extraer path de URL:', imageUrl);
        return;
      }
    } else {
      // Fallback
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'imagenes-secciones');
      
      if (bucketIndex === -1) {
        console.warn('URL de imagen no válida:', imageUrl);
        return;
      }

      filePath = urlParts.slice(bucketIndex + 1).join('/');
    }

    console.log(`📂 Path a eliminar: ${filePath}`);

    const { error } = await supabaseAdmin.storage
      .from('imagenes-secciones')
      .remove([filePath]);

    if (error) {
      console.error('❌ Error al eliminar imagen del storage:', error);
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }

    console.log('✅ Imagen eliminada del storage');

  } catch (error: any) {
    console.error('❌ Error en deleteImage:', error);
    throw error;
  }
}
}