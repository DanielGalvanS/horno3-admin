// src/services/horario.service.ts

import { createClient } from '@supabase/supabase-js';
import type { HorarioShow, CreateHorarioShowData } from '@/types/horarioshow';

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class HorarioService {
  // Obtener todos los horarios con filtros opcionales
  static async getAll(params?: {
    search?: string;
    dia?: string;
    tipo?: string;
    activo?: boolean;
  }): Promise<HorarioShow[]> {
    try {
      let query = supabase
        .from('horarioshow')
        .select('*')
        .order('dia')
        .order('hora');

      // Filtro por día
      if (params?.dia) {
        query = query.eq('dia', params.dia);
      }

      // Filtro por tipo
      if (params?.tipo) {
        query = query.eq('tipo', params.tipo);
      }

      // Filtro por activo
      if (params?.activo !== undefined) {
        query = query.eq('activo', params.activo);
      }

      // Filtro por búsqueda (en nombre, descripción o día)
      if (params?.search) {
        query = query.or(`nombre.ilike.%${params.search}%,descripcion.ilike.%${params.search}%,dia.ilike.%${params.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error('Error al obtener horarios: ' + error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error en HorarioService.getAll:', error);
      throw error;
    }
  }

  // Obtener horario por ID
  static async getById(id: string): Promise<HorarioShow | null> {
    try {
      const { data, error } = await supabase
        .from('horarioshow')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null;
        }
        throw new Error('Error al obtener horario: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Error en HorarioService.getById:', error);
      throw error;
    }
  }

  // Verificar si existe un horario con el mismo día y hora
  static async existsHorario(dia: string, hora: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('horarioshow')
        .select('id')
        .eq('dia', dia)
        .eq('hora', hora);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') { // PGRST116 es "no rows found"
        throw new Error('Error al verificar horario existente: ' + error.message);
      }

      return !!data;
    } catch (error) {
      console.error('Error en HorarioService.existsHorario:', error);
      throw error;
    }
  }

  // Crear nuevo horario
  static async create(data: CreateHorarioShowData): Promise<HorarioShow> {
    try {
      // Generar UUID manualmente
      const id = crypto.randomUUID();
      
      const { data: horario, error } = await supabase
        .from('horarioshow')
        .insert({
          id,
          dia: data.dia,
          hora: data.hora,
          nombre: data.nombre,
          descripcion: data.descripcion,
          tipo: data.tipo,
          duracion: data.duracion,
          idioma: data.idioma,
          cupo_maximo: data.cupo_maximo,
          zona_id: data.zona_id,
          activo: data.activo ?? true
        })
        .select()
        .single();

      if (error) {
        throw new Error('Error al crear horario: ' + error.message);
      }

      return horario;
    } catch (error) {
      console.error('Error en HorarioService.create:', error);
      throw error;
    }
  }

  // Actualizar horario
  static async update(id: string, data: CreateHorarioShowData): Promise<HorarioShow> {
    try {
      const { data: horario, error } = await supabase
        .from('horarioshow')
        .update({
          dia: data.dia,
          hora: data.hora,
          nombre: data.nombre,
          descripcion: data.descripcion,
          tipo: data.tipo,
          duracion: data.duracion,
          idioma: data.idioma,
          cupo_maximo: data.cupo_maximo,
          zona_id: data.zona_id,
          activo: data.activo
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error('Error al actualizar horario: ' + error.message);
      }

      return horario;
    } catch (error) {
      console.error('Error en HorarioService.update:', error);
      throw error;
    }
  }

  // Eliminar horario
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('horarioshow')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error('Error al eliminar horario: ' + error.message);
      }
    } catch (error) {
      console.error('Error en HorarioService.delete:', error);
      throw error;
    }
  }

  // Obtener horarios agrupados por día
  static async getGroupedByDay(): Promise<{ [key: string]: HorarioShow[] }> {
    try {
      const horarios = await this.getAll();
      
      const grouped = horarios.reduce((acc, horario) => {
        const dia = horario.dia;
        if (!acc[dia]) {
          acc[dia] = [];
        }
        acc[dia].push(horario);
        return acc;
      }, {} as { [key: string]: HorarioShow[] });

      // Ordenar horarios dentro de cada día
      Object.keys(grouped).forEach(dia => {
        grouped[dia].sort((a, b) => a.hora.localeCompare(b.hora));
      });

      return grouped;
    } catch (error) {
      console.error('Error en HorarioService.getGroupedByDay:', error);
      throw error;
    }
  }
}