// src/app/api/actividades/route.ts - API ROUTE PARA ACTIVIDADES 🚀

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 🎯 GET - Obtener actividades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '20');
    const tipo = searchParams.get('tipo');
    const prioridad = searchParams.get('prioridad');
    
    console.log('🔄 API: Obteniendo actividades...', { limite, tipo, prioridad });

    // Construir query
    let query = supabase
      .from('vista_actividades_dashboard')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .limit(limite);

    // Aplicar filtros si existen
    if (tipo) {
      query = query.eq('tipo', tipo);
    }
    if (prioridad) {
      query = query.eq('prioridad', prioridad);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Error en API actividades:', error);
      return NextResponse.json(
        { error: 'Error al obtener actividades', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        actividades: [],
        total: 0,
        success: true
      });
    }

    // Mapear datos para el frontend
    const actividadesMapeadas = data.map((item: any) => ({
      id: item.id,
      tipo: mapearTipoActividad(item.tipo),
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      timestamp: item.timestamp,
      usuario: item.usuario_nombre,
      zona: item.zona_nombre,
      icono: item.icono || mapearIconoPorTipo(item.tipo),
      color: mapearColorPorTipo(item.tipo),
      prioridad: item.prioridad,
      categoria: item.categoria,
      esReciente: item.es_reciente,
      tiempoTranscurrido: item.tiempo_transcurrido,
      datosAdicionales: item.datos_adicionales
    }));

    console.log(`✅ API: ${actividadesMapeadas.length} actividades obtenidas`);

    return NextResponse.json({
      actividades: actividadesMapeadas,
      total: count || 0,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error inesperado en API actividades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

// 🎯 POST - Crear actividad manual (opcional)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tipo = 'sistema',
      accion = 'crear',
      titulo,
      descripcion,
      prioridad = 'media',
      categoria = 'Sistema',
      icono = 'info-circle',
      color = 'blue'
    } = body;

    if (!titulo) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      );
    }

    // Usar la función de Supabase para crear actividad
    const { data, error } = await supabase.rpc('crear_actividad_museo', {
      p_tipo: tipo,
      p_accion: accion,
      p_titulo: titulo,
      p_descripcion: descripcion,
      p_prioridad: prioridad,
      p_categoria: categoria,
      p_icono: icono,
      p_color: color,
      p_es_publica: true,
      p_es_admin: false
    });

    if (error) {
      console.error('❌ Error creando actividad:', error);
      return NextResponse.json(
        { error: 'Error al crear actividad', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      actividadId: data,
      message: 'Actividad creada exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error en POST actividades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}

// 🛠️ FUNCIONES AUXILIARES
function mapearTipoActividad(tipo: string): 'visita' | 'show' | 'noticia' | 'contenido' {
  const mapeo: Record<string, 'visita' | 'show' | 'noticia' | 'contenido'> = {
    'visita': 'visita',
    'show': 'show',
    'noticia': 'noticia',
    'contenido': 'contenido',
    'zona': 'contenido',
    'usuario': 'contenido',
    'sistema': 'contenido'
  };
  return mapeo[tipo] || 'contenido';
}

function mapearIconoPorTipo(tipo: string): string {
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
}

function mapearColorPorTipo(tipo: string): 'green' | 'blue' | 'orange' | 'purple' {
  const colores: Record<string, 'green' | 'blue' | 'orange' | 'purple'> = {
    'visita': 'green',
    'show': 'blue',
    'noticia': 'orange',
    'contenido': 'purple',
    'zona': 'blue',
    'usuario': 'green',
    'sistema': 'purple'
  };
  return colores[tipo] || 'blue';
}