// src/hooks/useActividades.ts - VERSIÓN CON TABLA NUEVA 🚀
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ActividadReciente } from '@/types/dashboard';

interface UseActividadesOptions {
  limite?: number;
  enableRealtime?: boolean;
  soloPublicas?: boolean;
  incluirAdmin?: boolean;
  filtrarPorTipo?: string[];
  filtrarPorPrioridad?: string[];
}

interface UseActividadesReturn {
  actividades: ActividadReciente[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  isRealtime: boolean;
  totalActividades: number;
}

// 🎯 Mapeo de datos de la BD a interfaz del dashboard
interface ActividadBD {
  id: string;
  tipo: string;
  accion: string;
  titulo: string;
  descripcion: string | null;
  prioridad: string;
  categoria: string | null;
  icono: string;
  color: string;
  timestamp: string;
  zona_id: string | null;
  zona_nombre: string | null;
  usuario_id: string | null;
  usuario_nombre: string | null;
  datos_adicionales: any;
  tiempo_transcurrido: string;
  es_reciente: boolean;
}

export const useActividades = ({
  limite = 15,
  enableRealtime = true,
  soloPublicas = true,
  incluirAdmin = false,
  filtrarPorTipo = [],
  filtrarPorPrioridad = []
}: UseActividadesOptions = {}): UseActividadesReturn => {
  
  const [actividades, setActividades] = useState<ActividadReciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const [totalActividades, setTotalActividades] = useState(0);
  
  // Referencias para cleanup
  const channelRef = useRef<RealtimeChannel | null>(null);
  const actividadesRef = useRef<ActividadReciente[]>([]);

  // 🔄 Función para obtener actividades de la nueva tabla
  const obtenerActividades = useCallback(async (): Promise<ActividadReciente[]> => {
    try {
      console.log('📊 Obteniendo actividades desde tabla actividad_museo...');

      // Construir query con filtros
      let query = supabase
        .from('vista_actividades_dashboard')
        .select('*', { count: 'exact' });

      // Aplicar filtros
      if (soloPublicas) {
        // La vista ya filtra por es_publica = true
      }

      if (!incluirAdmin) {
        // Si no queremos incluir admin, podemos agregar un filtro adicional aquí
        // Por ahora la vista maneja esto
      }

      if (filtrarPorTipo.length > 0) {
        query = query.in('tipo', filtrarPorTipo);
      }

      if (filtrarPorPrioridad.length > 0) {
        query = query.in('prioridad', filtrarPorPrioridad);
      }

      // Orden y límite
      const { data: actividadesBD, error, count } = await query
        .order('timestamp', { ascending: false })
        .limit(limite);

      if (error) {
        throw error;
      }

      if (!actividadesBD) {
        return [];
      }

      // Mapear datos de BD a interfaz del dashboard
      const actividadesMapeadas: ActividadReciente[] = actividadesBD.map((actividad: ActividadBD) => ({
        id: actividad.id,
        tipo: mapearTipoActividad(actividad.tipo),
        titulo: actividad.titulo,
        descripcion: actividad.descripcion || '',
        timestamp: actividad.timestamp,
        usuario: actividad.usuario_nombre || extraerUsuarioDeDescripcion(actividad),
        zona: actividad.zona_nombre || extraerZonaDeDescripcion(actividad),
        icono: mapearIcono(actividad.icono, actividad.tipo),
        color: mapearColor(actividad.color, actividad.prioridad),
        // Metadatos adicionales
        prioridad: actividad.prioridad,
        categoria: actividad.categoria,
        esReciente: actividad.es_reciente,
        tiempoTranscurrido: actividad.tiempo_transcurrido,
        datosAdicionales: actividad.datos_adicionales
      }));

      setTotalActividades(count || 0);
      return actividadesMapeadas;

    } catch (err: any) {
      console.error('❌ Error al obtener actividades:', err);
      throw err;
    }
  }, [limite, soloPublicas, incluirAdmin, filtrarPorTipo, filtrarPorPrioridad]);

  // 🔥 Función para agregar nueva actividad en tiempo real
  const agregarActividadRealtime = useCallback((payload: any) => {
    if (payload.eventType === 'INSERT') {
      const nuevaActividad = payload.new;
      
      // Mapear la nueva actividad
      const actividadMapeada: ActividadReciente = {
        id: nuevaActividad.id,
        tipo: mapearTipoActividad(nuevaActividad.tipo),
        titulo: nuevaActividad.titulo,
        descripcion: nuevaActividad.descripcion || '',
        timestamp: nuevaActividad.timestamp,
        usuario: extraerUsuarioDeActividad(nuevaActividad),
        zona: extraerZonaDeActividad(nuevaActividad),
        icono: mapearIcono(nuevaActividad.icono, nuevaActividad.tipo),
        color: mapearColor(nuevaActividad.color, nuevaActividad.prioridad),
        prioridad: nuevaActividad.prioridad,
        categoria: nuevaActividad.categoria,
        esReciente: true,
        tiempoTranscurrido: 'Ahora mismo',
        datosAdicionales: nuevaActividad.datos_adicionales
      };

      // Verificar filtros antes de agregar
      if (aplicarFiltros(actividadMapeada)) {
        setActividades(prev => {
          const nuevasActividades = [actividadMapeada, ...prev].slice(0, limite);
          actividadesRef.current = nuevasActividades;
          return nuevasActividades;
        });

        setLastUpdated(new Date());
        setTotalActividades(prev => prev + 1);
        
        // Notificación visual
        mostrarNotificacion(actividadMapeada);
      }
    }
  }, [limite, soloPublicas, incluirAdmin, filtrarPorTipo, filtrarPorPrioridad]);

  // 🎯 Verificar si una actividad pasa los filtros
  const aplicarFiltros = useCallback((actividad: ActividadReciente): boolean => {
    if (filtrarPorTipo.length > 0 && !filtrarPorTipo.includes(actividad.tipo)) {
      return false;
    }
    
    if (filtrarPorPrioridad.length > 0 && !filtrarPorPrioridad.includes(actividad.prioridad || '')) {
      return false;
    }
    
    return true;
  }, [filtrarPorTipo, filtrarPorPrioridad]);

  // 🔥 Configurar suscripción en tiempo real
  const configurarRealtime = useCallback(() => {
    if (!enableRealtime) return;

    console.log('🔥 Configurando suscripción realtime para actividad_museo...');

    // Limpiar suscripción anterior
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Crear nueva suscripción
    const channel = supabase
      .channel('actividad_museo_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'actividad_museo',
          filter: soloPublicas ? 'es_publica=eq.true' : undefined
        },
        (payload) => {
          console.log('🔥 Nueva actividad en tiempo real:', payload.new.titulo);
          agregarActividadRealtime(payload);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Suscripción actividad_museo:`, status);
        if (status === 'SUBSCRIBED') {
          setIsRealtime(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsRealtime(false);
          console.warn('⚠️ Error en suscripción realtime:', status);
        }
      });

    channelRef.current = channel;
  }, [enableRealtime, soloPublicas, agregarActividadRealtime]);

  // 🚀 Función refetch
  const refetch = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const actividadesObtenidas = await obtenerActividades();
      setActividades(actividadesObtenidas);
      actividadesRef.current = actividadesObtenidas;
      setLastUpdated(new Date());
      
      console.log(`✅ ${actividadesObtenidas.length} actividades cargadas`);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al cargar actividades';
      setError(errorMessage);
      
      // Usar datos de fallback en caso de error
      const datosFallback = getDatosFallback(limite);
      setActividades(datosFallback);
      actividadesRef.current = datosFallback;
    } finally {
      setLoading(false);
    }
  }, [obtenerActividades, limite]);

  // ⚡ Effect principal
  useEffect(() => {
    // Cargar datos iniciales
    refetch();

    // Configurar realtime después de cargar datos iniciales
    if (enableRealtime) {
      const timer = setTimeout(() => {
        configurarRealtime();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [refetch, configurarRealtime, enableRealtime]);

  // 🧹 Cleanup
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    actividades,
    loading,
    error,
    refetch,
    lastUpdated,
    isRealtime,
    totalActividades
  };
};

// 🛠️ Funciones auxiliares de mapeo

const mapearTipoActividad = (tipo: string): ActividadReciente['tipo'] => {
  const mapeo: Record<string, ActividadReciente['tipo']> = {
    'visita': 'visita',
    'show': 'show',
    'noticia': 'noticia',
    'contenido': 'contenido',
    'zona': 'visita', // Mapeamos zona a visita para compatibilidad
    'usuario': 'visita',
    'sistema': 'contenido'
  };
  return mapeo[tipo] || 'contenido';
};

const mapearIcono = (icono: string, tipo: string): string => {
  const iconos: Record<string, string> = {
    'user': 'user',
    'play-circle': 'play-circle',
    'play': 'play-circle',
    'stop': 'stop',
    'clock': 'clock-circle',
    'team': 'team',
    'edit': 'edit',
    'delete': 'delete',
    'news': 'file-text',
    'picture': 'picture',
    'home': 'environment',
    'rocket': 'rocket',
    'experiment': 'experiment'
  };
  return iconos[icono] || 'info-circle';
};

const mapearColor = (color: string, prioridad: string): ActividadReciente['color'] => {
  // Priorizar color por prioridad si existe
  if (prioridad) {
    const coloresPrioridad: Record<string, ActividadReciente['color']> = {
      'critica': 'red',
      'alta': 'orange',
      'media': 'blue',
      'baja': 'green'
    };
    return coloresPrioridad[prioridad] || 'blue';
  }
  
  // Mapeo de colores estándar
  const colores: Record<string, ActividadReciente['color']> = {
    'green': 'green',
    'blue': 'blue',
    'orange': 'orange',
    'purple': 'purple',
    'red': 'orange', // Convertimos red a orange para el theme
    'yellow': 'orange'
  };
  return colores[color] || 'blue';
};

const extraerUsuarioDeDescripcion = (actividad: ActividadBD): string | undefined => {
  // Intentar extraer usuario de datos adicionales primero
  if (actividad.datos_adicionales?.usuario_nombre) {
    return actividad.datos_adicionales.usuario_nombre;
  }
  
  // Fallback: intentar extraer de la descripción
  const descripcion = actividad.descripcion || '';
  if (descripcion.includes('Visitante ')) {
    const match = descripcion.match(/Visitante ([^'\s]+)/);
    return match ? match[1] : undefined;
  }
  
  return actividad.usuario_nombre || undefined;
};

const extraerZonaDeDescripcion = (actividad: ActividadBD): string | undefined => {
  // Intentar extraer zona de datos adicionales primero
  if (actividad.datos_adicionales?.zona_nombre) {
    return actividad.datos_adicionales.zona_nombre;
  }
  
  return actividad.zona_nombre || undefined;
};

const extraerUsuarioDeActividad = (actividad: any): string | undefined => {
  return actividad.datos_adicionales?.usuario_nombre || 
         actividad.usuario_admin || 
         'Usuario';
};

const extraerZonaDeActividad = (actividad: any): string | undefined => {
  return actividad.datos_adicionales?.zona_nombre || undefined;
};

// 🔔 Mostrar notificación visual (opcional)
const mostrarNotificacion = (actividad: ActividadReciente) => {
  // Solo para actividades de alta prioridad
  if (actividad.prioridad === 'critica' || actividad.prioridad === 'alta') {
    console.log(`🔥 ACTIVIDAD IMPORTANTE: ${actividad.titulo}`);
    
    // Aquí podrías agregar notificaciones del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Museo del Acero', {
        body: actividad.titulo,
        icon: '/favicon.ico',
        tag: actividad.id
      });
    }
  }
};

// 📊 Datos de fallback mejorados
const getDatosFallback = (limite: number): ActividadReciente[] => [
  {
    id: 'fallback-1',
    tipo: 'sistema',
    titulo: '🔧 Modo sin conexión',
    descripcion: 'Mostrando actividades de ejemplo - Verifica tu conexión',
    timestamp: new Date().toISOString(),
    usuario: 'Sistema',
    zona: undefined,
    icono: 'disconnect',
    color: 'orange',
    prioridad: 'media',
    categoria: 'Sistema',
    esReciente: false,
    tiempoTranscurrido: 'Ahora'
  },
  {
    id: 'fallback-2',
    tipo: 'visita',
    titulo: '👥 Ejemplo de visita',
    descripcion: 'Visitante de ejemplo inició recorrido - 60 min disponibles',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    usuario: 'Visitante Ejemplo',
    zona: 'Historia del Acero',
    icono: 'user',
    color: 'green',
    prioridad: 'baja',
    categoria: 'Visitantes',
    esReciente: false,
    tiempoTranscurrido: '5 min'
  }
].slice(0, limite);

// 🆕 Agregar campos opcionales a la interfaz existente
declare module '@/types/dashboard' {
  interface ActividadReciente {
    prioridad?: string;
    categoria?: string;
    esReciente?: boolean;
    tiempoTranscurrido?: string;
    datosAdicionales?: any;
  }
}