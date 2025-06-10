// src/contexts/ActividadesContext.tsx - CON API ROUTES Y CORRECCIONES SSR 🚀

'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ActividadReciente } from '@/types/dashboard';

// 🎯 TIPOS
interface ActividadesState {
  actividades: ActividadReciente[];
  loading: boolean;
  error: string | null;
  isRealtime: boolean;
  lastUpdated: Date | null;
  totalActividades: number;
  isOnline: boolean;
  initialized: boolean;
  isClient: boolean; // 🆕 Para controlar hidratación SSR
}

interface ActividadesContextType extends ActividadesState {
  refetch: () => Promise<void>;
  clearError: () => void;
  addActividad: (actividad: ActividadReciente) => void;
}

// 🎯 ACCIONES
type ActividadesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVIDADES'; payload: { actividades: ActividadReciente[]; total: number } }
  | { type: 'ADD_ACTIVIDAD'; payload: ActividadReciente }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REALTIME'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_CLIENT'; payload: boolean } // 🆕
  | { type: 'UPDATE_TIMESTAMP' };

// 🎯 REDUCER
const actividadesReducer = (state: ActividadesState, action: ActividadesAction): ActividadesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ACTIVIDADES':
      return {
        ...state,
        actividades: action.payload.actividades,
        totalActividades: action.payload.total,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        initialized: true
      };
    
    case 'ADD_ACTIVIDAD':
      return {
        ...state,
        actividades: [action.payload, ...state.actividades].slice(0, 20),
        totalActividades: state.totalActividades + 1,
        lastUpdated: new Date()
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false,
        initialized: true // 🆕 Marcar como inicializado aunque haya error
      };
    
    case 'SET_REALTIME':
      return { ...state, isRealtime: action.payload };
    
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    
    case 'SET_CLIENT':
      return { ...state, isClient: action.payload };
    
    case 'UPDATE_TIMESTAMP':
      return { ...state, lastUpdated: new Date() };
    
    default:
      return state;
  }
};

// 🎯 ESTADO INICIAL
const initialState: ActividadesState = {
  actividades: [],
  loading: true,
  error: null,
  isRealtime: false,
  lastUpdated: null,
  totalActividades: 0,
  isOnline: true,
  initialized: false,
  isClient: false // 🆕 Para evitar problemas de hidratación
};

// 🎯 CONTEXT
const ActividadesContext = createContext<ActividadesContextType | null>(null);

// 🎯 PROVIDER COMPONENT
export const ActividadesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(actividadesReducer, initialState);
  
  // Referencias para cleanup y control
  const channelRef = useRef<RealtimeChannel | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 🔧 DETECTAR CLIENTE (hidratación)
  useEffect(() => {
    dispatch({ type: 'SET_CLIENT', payload: true });
  }, []);

  // 🎯 FUNCIÓN PARA OBTENER ACTIVIDADES (usando API Route)
  const obtenerActividades = useCallback(async (forzar: boolean = false): Promise<void> => {
    const ahora = Date.now();
    
    // Evitar llamadas muy frecuentes (caché de 10 segundos)
    if (!forzar && ahora - lastFetchRef.current < 10000 && state.initialized) {
      console.log('🎯 Usando caché, última actualización hace', (ahora - lastFetchRef.current) / 1000, 'segundos');
      return;
    }
    
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    try {
      console.log('📊 Obteniendo actividades via API Route...');
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // 🚀 USAR API ROUTE EN LUGAR DE SUPABASE DIRECTO
      const response = await fetch('/api/actividades?limite=20', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
        // Añadir cache control para mejor rendimiento
        cache: forzar ? 'no-cache' : 'default'
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error desconocido del servidor');
      }

      // 🔧 Guardar en localStorage para persistencia (solo en cliente)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('museo_actividades', JSON.stringify({
            actividades: data.actividades,
            total: data.total,
            timestamp: ahora
          }));
        } catch (e) {
          console.warn('No se pudo guardar en localStorage:', e);
        }
      }

      dispatch({ 
        type: 'SET_ACTIVIDADES', 
        payload: { actividades: data.actividades, total: data.total } 
      });
      
      lastFetchRef.current = ahora;
      console.log(`✅ API: ${data.actividades.length} actividades obtenidas`);

    } catch (err: any) {
      // No mostrar error si fue cancelado por abort
      if (err.name === 'AbortError') {
        console.log('🚫 Petición cancelada');
        return;
      }
      
      console.error('❌ Error al obtener actividades via API:', err);
      
      // 🔧 Intentar cargar desde localStorage como fallback (solo en cliente)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const stored = localStorage.getItem('museo_actividades');
          if (stored) {
            const parsedData = JSON.parse(stored);
            const edadDatos = ahora - parsedData.timestamp;
            
            if (edadDatos < 300000) { // Menos de 5 minutos
              console.log('📦 Cargando desde localStorage como fallback');
              dispatch({ 
                type: 'SET_ACTIVIDADES', 
                payload: { actividades: parsedData.actividades, total: parsedData.total } 
              });
              return;
            }
          }
        } catch (e) {
          console.warn('Error cargando localStorage:', e);
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Error al cargar actividades' });
      
      // Programar reintento solo si no hay datos
      if (state.actividades.length === 0) {
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Reintentando cargar actividades...');
          obtenerActividades(true);
        }, 15000); // Reintentar en 15 segundos
      }
    }
  }, [state.initialized, state.actividades.length]);

  // 🔥 CONFIGURAR TIEMPO REAL (solo para nuevas actividades)
  const configurarRealtime = useCallback(async () => {
    try {
      // Verificar que la tabla existe
      const { error } = await supabase
        .from('actividad_museo')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log('⚠️ Tabla actividad_museo no existe, saltando tiempo real');
        return;
      }

      console.log('🔥 Configurando tiempo real...');

      // Limpiar canal anterior
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel('actividades_museo_global')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'actividad_museo',
            filter: 'es_publica=eq.true'
          },
          (payload) => {
            console.log('🔥 Nueva actividad tiempo real:', payload.new.titulo);
            
            const nuevaActividad: ActividadReciente = {
              id: payload.new.id,
              tipo: mapearTipoActividad(payload.new.tipo),
              titulo: payload.new.titulo,
              descripcion: payload.new.descripcion || '',
              timestamp: payload.new.timestamp,
              usuario: payload.new.datos_adicionales?.usuario_nombre,
              zona: payload.new.datos_adicionales?.zona_nombre,
              icono: payload.new.icono || mapearIconoPorTipo(payload.new.tipo),
              color: mapearColorPorTipo(payload.new.tipo),
              prioridad: payload.new.prioridad,
              categoria: payload.new.categoria,
              esReciente: true,
              tiempoTranscurrido: 'Ahora mismo',
              datosAdicionales: payload.new.datos_adicionales
            };

            dispatch({ type: 'ADD_ACTIVIDAD', payload: nuevaActividad });
          }
        )
        .subscribe((status) => {
          console.log(`📡 Tiempo real:`, status);
          dispatch({ type: 'SET_REALTIME', payload: status === 'SUBSCRIBED' });
          
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.log('🔄 Reconectando tiempo real en 5s...');
            setTimeout(configurarRealtime, 5000);
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.warn('⚠️ Error configurando tiempo real:', error);
    }
  }, []);

  // 🌐 MONITOREO DE CONEXIÓN (solo en cliente)
  useEffect(() => {
    // ✅ Verificar que estamos en el cliente
    if (typeof window === 'undefined') return;

    // Establecer estado inicial de conexión
    dispatch({ type: 'SET_ONLINE', payload: navigator.onLine });

    const handleOnline = () => {
      console.log('🌐 Conexión restaurada');
      dispatch({ type: 'SET_ONLINE', payload: true });
      obtenerActividades(true);
      configurarRealtime();
    };

    const handleOffline = () => {
      console.log('📡 Sin conexión');
      dispatch({ type: 'SET_ONLINE', payload: false });
      dispatch({ type: 'SET_REALTIME', payload: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [obtenerActividades, configurarRealtime]);

  // ⚡ INICIALIZACIÓN (solo una vez y solo en cliente)
  useEffect(() => {
    if (!state.initialized && state.isClient) {
      console.log('🚀 Inicializando ActividadesProvider...');
      
      // Cargar datos inmediatamente
      obtenerActividades(true);
      
      // Configurar tiempo real después de un breve delay
      const timer = setTimeout(configurarRealtime, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state.initialized, state.isClient, obtenerActividades, configurarRealtime]);

  // 🔄 AUTO-REFRESH inteligente (solo si está inicializado y en cliente)
  useEffect(() => {
    if (!state.initialized || !state.isClient) return;
    
    intervalRef.current = setInterval(() => {
      if (state.isOnline && !state.loading) {
        console.log('🔄 Auto-refresh actividades');
        obtenerActividades();
      }
    }, 60000); // Cada minuto

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isOnline, state.loading, state.initialized, state.isClient, obtenerActividades]);

  // 🧹 CLEANUP
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 🎯 FUNCIONES PÚBLICAS
  const refetch = useCallback(async () => {
    await obtenerActividades(true);
  }, [obtenerActividades]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const addActividad = useCallback((actividad: ActividadReciente) => {
    dispatch({ type: 'ADD_ACTIVIDAD', payload: actividad });
  }, []);

  return (
    <ActividadesContext.Provider
      value={{
        ...state,
        refetch,
        clearError,
        addActividad
      }}
    >
      {children}
    </ActividadesContext.Provider>
  );
};

// 🎯 HOOK PARA USAR EL CONTEXT
export const useActividades = () => {
  const context = useContext(ActividadesContext);
  if (!context) {
    throw new Error('useActividades debe usarse dentro de ActividadesProvider');
  }
  return context;
};

// 🛠️ FUNCIONES AUXILIARES (mismas que la API route)
const mapearTipoActividad = (tipo: string): ActividadReciente['tipo'] => {
  const mapeo: Record<string, ActividadReciente['tipo']> = {
    'visita': 'visita',
    'show': 'show',
    'noticia': 'noticia',
    'contenido': 'contenido',
    'zona': 'contenido',
    'usuario': 'contenido',
    'sistema': 'contenido'
  };
  return mapeo[tipo] || 'contenido';
};

const mapearIconoPorTipo = (tipo: string): string => {
  const iconos: Record<string, string> = {
    'visita': 'user',
    'show': 'play-circle',
    'noticia': 'file-text',
    'contenido': 'picture',
    'zona': 'home',
    'usuario': 'user-add',
    'sistema': 'setting'
  };
  return iconos[tipo] || 'info-circle';
};

const mapearColorPorTipo = (tipo: string): ActividadReciente['color'] => {
  const colores: Record<string, ActividadReciente['color']> = {
    'visita': 'green',
    'show': 'blue',
    'noticia': 'orange',
    'contenido': 'purple',
    'zona': 'blue',
    'usuario': 'green',
    'sistema': 'purple'
  };
  return colores[tipo] || 'blue';
};