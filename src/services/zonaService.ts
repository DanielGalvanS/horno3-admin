import { supabase } from '@/lib/supabase';
import type { Zona, CreateZonaData } from '@/types/zona';

export class ZonaService {
  static async getAll(): Promise<Zona[]> {
    const { data, error } = await supabase
      .from('zona')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async create(zonaData: CreateZonaData): Promise<Zona> {
    const newZonaData = {
      nombre: zonaData.nombre.trim(),
      descripcion: zonaData.descripcion.trim(),
      categorias: [zonaData.categorias],
      nivel: zonaData.nivel,
      duracion: zonaData.duracion,
      actividad: zonaData.actividad.trim()
    };

    const { data, error } = await supabase
      .from('zona')
      .insert([newZonaData])
      .select()
      .single();

    if (error) {
      if (error.message.includes('zona_actividad_check')) {
        throw new Error(`Actividad inválida. Solo se permiten: baja, media, alta.`);
      }
      if (error.message.includes('duplicate key')) {
        throw new Error('Ya existe una sección con ese nombre.');
      }
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id: string, zonaData: CreateZonaData): Promise<Zona> {
    const updateData = {
      nombre: zonaData.nombre.trim(),
      descripcion: zonaData.descripcion.trim(),
      categorias: [zonaData.categorias],
      nivel: zonaData.nivel,
      duracion: zonaData.duracion,
      actividad: zonaData.actividad.trim()
    };

    const { data, error } = await supabase
      .from('zona')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message.includes('zona_actividad_check')) {
        throw new Error(`Actividad inválida. Solo se permiten: baja, media, alta.`);
      }
      throw new Error(error.message);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('zona')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}