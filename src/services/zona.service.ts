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
  static async getById(id: string): Promise<Zona | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('zona')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error al obtener zona:', error);
        throw new Error(`Error al obtener zona: ${error.message}`);
      }

      return data as Zona;
    } catch (error: any) {
      console.error('Error en ZonaService.getById:', error);
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
}