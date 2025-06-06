// src/services/noticia.service.ts
import { supabaseAdmin } from '@/lib/supabase';
import type { Noticia, NoticiaDB, CreateNoticiaData } from '@/types/noticia';

export class NoticiaService {
  private static readonly BUCKET_NAME = 'imagenes-noticias'; // Usar el bucket existente

  // Subir imagen al storage
  static async uploadImage(file: File): Promise<string> {
    try {
      console.log('Subiendo imagen:', file.name, file.size);

      // Generar nombre único para el archivo
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `imagenes/${fileName}`;

      // Subir archivo
      const { data, error } = await supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error al subir imagen:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log('Imagen subida exitosamente:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error: any) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  }

  // Crear nueva noticia
  static async create(data: CreateNoticiaData): Promise<Noticia> {
    try {
      console.log('Creando noticia:', data);

      let imagen_url: string | null = null;

      // Subir imagen si existe
      if (data.imagen) {
        imagen_url = await this.uploadImage(data.imagen);
      }

      // Preparar datos para insertar
      const insertData: Omit<NoticiaDB, 'id'> = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        zona_id: data.zona_id || null,
        imagen_url,
        fecha_publicacion: new Date().toISOString()
      };

      console.log('Datos a insertar:', insertData);

      // Insertar en la base de datos
      const { data: noticia, error } = await supabaseAdmin
        .from('noticia')
        .insert(insertData)
        .select(`
          *,
          zona:zona(id, nombre)
        `)
        .single();

      if (error) {
        console.error('Error al insertar noticia:', error);
        
        // Si hay error y se subió imagen, intentar eliminarla
        if (imagen_url) {
          try {
            await this.deleteImage(imagen_url);
          } catch (deleteError) {
            console.error('Error al eliminar imagen tras fallo:', deleteError);
          }
        }
        
        throw new Error(`Error al crear noticia: ${error.message}`);
      }

      console.log('Noticia creada exitosamente:', noticia);
      return noticia as Noticia;

    } catch (error: any) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  // Obtener todas las noticias
  static async getAll(): Promise<Noticia[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('noticia')
        .select(`
          *,
          zona:zona(id, nombre)
        `)
        .order('fecha_publicacion', { ascending: false });

      if (error) {
        console.error('Error al obtener noticias:', error);
        throw new Error(`Error al obtener noticias: ${error.message}`);
      }

      return (data as Noticia[]) || [];
    } catch (error: any) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  // Obtener noticia por ID
  static async getById(id: string): Promise<Noticia> {
    try {
      const { data, error } = await supabaseAdmin
        .from('noticia')
        .select(`
          *,
          zona:zona(id, nombre)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error al obtener noticia:', error);
        throw new Error(`Error al obtener noticia: ${error.message}`);
      }

      if (!data) {
        throw new Error('Noticia no encontrada');
      }

      return data as Noticia;
    } catch (error: any) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  // Actualizar noticia
  static async update(id: string, data: Partial<CreateNoticiaData>): Promise<Noticia> {
    try {
      console.log('Actualizando noticia:', id, data);

      // Obtener noticia actual
      const noticiaActual = await this.getById(id);

      let imagen_url = noticiaActual.imagen_url;

      // Si hay nueva imagen, subirla
      if (data.imagen) {
        // Eliminar imagen anterior si existe
        if (imagen_url) {
          try {
            await this.deleteImage(imagen_url);
          } catch (deleteError) {
            console.error('Error al eliminar imagen anterior:', deleteError);
          }
        }

        imagen_url = await this.uploadImage(data.imagen);
      }

      // Preparar datos para actualizar
      const updateData: Partial<NoticiaDB> = {};
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.zona_id !== undefined) updateData.zona_id = data.zona_id;
      if (data.imagen) updateData.imagen_url = imagen_url;

      console.log('Datos a actualizar:', updateData);

      // Actualizar en la base de datos
      const { data: noticia, error } = await supabaseAdmin
        .from('noticia')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          zona:zona(id, nombre)
        `)
        .single();

      if (error) {
        console.error('Error al actualizar noticia:', error);
        throw new Error(`Error al actualizar noticia: ${error.message}`);
      }

      return noticia as Noticia;
    } catch (error: any) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  // Eliminar noticia
  static async delete(id: string): Promise<void> {
    try {
      console.log('Eliminando noticia:', id);

      // Obtener noticia para eliminar imagen si existe
      const noticia = await this.getById(id);

      // Eliminar de la base de datos
      const { error } = await supabaseAdmin
        .from('noticia')  // Singular
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar noticia:', error);
        throw new Error(`Error al eliminar noticia: ${error.message}`);
      }

      // Eliminar imagen si existe
      if (noticia.imagen_url) {
        try {
          await this.deleteImage(noticia.imagen_url);
        } catch (deleteError) {
          console.error('Error al eliminar imagen:', deleteError);
          // No lanzar error aquí, la noticia ya fue eliminada
        }
      }

      console.log('Noticia eliminada exitosamente');
    } catch (error: any) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  // Eliminar imagen del storage
  private static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el path del archivo de la URL
      const urlParts = imageUrl.split('/storage/v1/object/public/' + this.BUCKET_NAME + '/');
      if (urlParts.length !== 2) {
        throw new Error('URL de imagen inválida');
      }

      const filePath = urlParts[1];

      const { error } = await supabaseAdmin.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Error al eliminar imagen:', error);
        throw new Error(`Error al eliminar imagen: ${error.message}`);
      }

      console.log('Imagen eliminada exitosamente:', filePath);
    } catch (error: any) {
      console.error('Error en deleteImage:', error);
      throw error;
    }
  }

  // Obtener noticias por zona
  static async getByZona(zonaId: string): Promise<Noticia[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('noticia')
        .select(`
          *,
          zona:zona(id, nombre)
        `)
        .eq('zona_id', zonaId)
        .order('fecha_publicacion', { ascending: false });

      if (error) {
        throw new Error(`Error al obtener noticias por zona: ${error.message}`);
      }

      return (data as Noticia[]) || [];
    } catch (error: any) {
      console.error('Error en getByZona:', error);
      throw error;
    }
  }

  // Buscar noticias
  static async search(searchTerm: string): Promise<Noticia[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('noticia')
        .select(`
          *,
          zona:zona(id, nombre)
        `)
        .or(`titulo.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%`)
        .order('fecha_publicacion', { ascending: false });

      if (error) {
        throw new Error(`Error al buscar noticias: ${error.message}`);
      }

      return (data as Noticia[]) || [];
    } catch (error: any) {
      console.error('Error en search:', error);
      throw error;
    }
  }

  // Obtener noticias recientes
  static async getRecientes(limit: number = 5): Promise<Noticia[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('noticia')
        .select(`
          *,
          zona:zona(id, nombre)
        `)
        .order('fecha_publicacion', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Error al obtener noticias recientes: ${error.message}`);
      }

      return (data as Noticia[]) || [];
    } catch (error: any) {
      console.error('Error en getRecientes:', error);
      throw error;
    }
  }
}