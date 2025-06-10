import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Obteniendo datos del dashboard con vista dinámica...');
    
    const startTime = Date.now();

    const [
      kpisPrincipales,
      visitantes7Dias,
      estadisticasAgregadas,
      zonasPopulares
    ] = await Promise.all([
      obtenerKPIsPrincipales(),
      obtenerVisitantes7Dias(),
      obtenerEstadisticasAgregadas(),
      obtenerZonasPopulares()
    ]);

    const processingTime = Date.now() - startTime;

    const response = {
      success: true,
      data: {
        kpis: kpisPrincipales,
        visitantesPorDia: {
          datos: visitantes7Dias.datos,
          estadisticas: visitantes7Dias.estadisticas,
          estadisticasAgregadas: estadisticasAgregadas,
          insight: visitantes7Dias.insight
        },
        zonasPopulares: zonasPopulares,
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: processingTime
        }
      }
    };

    console.log(`✅ Dashboard obtenido en ${processingTime}ms`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Error obteniendo dashboard:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos del dashboard',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function obtenerKPIsPrincipales() {
  try {
    const { data, error } = await supabase
      .from('vista_kpis_principales')
      .select('*')
      .single();

    if (error) throw error;

    return {
      visitantesHoy: data?.visitantes_hoy || 0,
      visitantesAyer: data?.visitantes_ayer || 0,
      eventosHoy: data?.eventos_hoy || 0,
      showsHoy: data?.shows_hoy || 0,
      laboratoriosHoy: data?.laboratorios_hoy || 0,
      capacidadHoy: data?.capacidad_hoy || 0,
      zonasActivas: data?.zonas_activas || 0,
      totalZonas: data?.total_zonas || 0,
      crecimientoVisitantes: data?.crecimiento_visitantes || 0
    };
  } catch (error) {
    console.error('❌ Error obteniendo KPIs:', error);
    return {
      visitantesHoy: 0,
      visitantesAyer: 0,
      eventosHoy: 0,
      showsHoy: 0,
      laboratoriosHoy: 0,
      capacidadHoy: 0,
      zonasActivas: 0,
      totalZonas: 0,
      crecimientoVisitantes: 0
    };
  }
}

async function obtenerVisitantes7Dias() {
  try {
    const { data: visitantes, error } = await supabase
      .from('vista_visitantes_7_dias')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) throw error;

    const datosGrafico = visitantes?.map(dia => ({
      fecha: dia.fecha,
      visitantes: dia.visitantes || 0,
      dia_semana: dia.dia_semana,
      dia_numero: dia.dia_numero,
      duracion_promedio: dia.duracion_promedio || 0,
      visitantes_dia_anterior: dia.visitantes_dia_anterior || 0,
      crecimiento_diario: dia.crecimiento_diario || 0,
      nivel_actividad: dia.nivel_actividad || 'Sin actividad',
      tipo_dia: dia.tipo_dia || 'Entre semana',
      ranking_visitantes: dia.ranking_visitantes || 0,
      promedio_movil_3dias: dia.promedio_movil_3dias || 0,
      es_dia_pico: dia.es_dia_pico || false,
      es_dia_minimo: dia.es_dia_minimo || false
    })) || [];

    const totalVisitantes = datosGrafico.reduce((sum, dia) => sum + dia.visitantes, 0);
    const promedioVisitantes = Math.round(totalVisitantes / Math.max(datosGrafico.length, 1));
    const visitantesArray = datosGrafico.map(d => d.visitantes);
    
    const diaPico = datosGrafico.find(d => d.es_dia_pico);
    const diasSinActividad = datosGrafico.filter(d => d.visitantes === 0).length;
    
    let insight = 'No hay datos de visitantes disponibles';
    if (totalVisitantes > 0) {
      if (diaPico) {
        insight = `El día más popular fue ${diaPico.dia_semana} con ${diaPico.visitantes} visitantes`;
        if (diasSinActividad > 0) {
          insight += `. ${diasSinActividad} día${diasSinActividad > 1 ? 's' : ''} sin actividad`;
        }
      } else {
        insight = `Total de ${totalVisitantes} visitantes en la semana`;
      }
    }

    return {
      datos: datosGrafico,
      estadisticas: {
        total: totalVisitantes,
        promedio: promedioVisitantes,
        maximo: Math.max(...visitantesArray, 0),
        minimo: Math.min(...visitantesArray, 0)
      },
      insight: insight
    };

  } catch (error) {
    console.error('❌ Error obteniendo visitantes 7 días:', error);
    return {
      datos: [],
      estadisticas: { total: 0, promedio: 0, maximo: 0, minimo: 0 },
      insight: 'Error al cargar datos de visitantes'
    };
  }
}

async function obtenerEstadisticasAgregadas() {
  try {
    const { data: stats, error } = await supabase
      .from('vista_estadisticas_visitantes')
      .select('*')
      .single();

    if (error) {
      console.warn('⚠️ Vista de estadísticas no disponible');
      return null;
    }

    return {
      total_visitantes_semana: stats?.total_visitantes_semana || 0,
      promedio_diario: parseFloat(stats?.promedio_diario || '0'),
      maximo_dia: stats?.maximo_dia || 0,
      minimo_dia: stats?.minimo_dia || 0,
      duracion_promedio_semana: stats?.duracion_promedio_semana || 0,
      total_visitantes_semana_pasada: stats?.total_visitantes_semana_pasada || 0,
      crecimiento_semanal: parseFloat(stats?.crecimiento_semanal || '0'),
      dias_con_actividad: stats?.dias_con_actividad || 0,
      dias_sin_actividad: stats?.dias_sin_actividad || 0,
      mejor_dia: stats?.mejor_dia || 'N/A',
      peor_dia: stats?.peor_dia || 'N/A',
      tendencia_general: stats?.tendencia_general || 'Estable'
    };
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas agregadas:', error);
    return null;
  }
}

async function obtenerZonasPopulares() {
  try {
    const { data: zonas, error } = await supabase
      .from('vista_zonas_populares_top10')
      .select('*')
      .order('ranking', { ascending: true });

    if (error) throw error;

    return zonas?.map(zona => ({
      id: zona.id,
      nombre: zona.nombre,
      ranking: zona.ranking,
      visitas: zona.visitas,
      porcentaje: zona.porcentaje,
      nivel: zona.nivel,
      categoria: zona.categoria,
      duracion: zona.duracion,
      actividad: zona.actividad,
      shows: zona.shows || 0,
      laboratorios: zona.laboratorios || 0,
      clasificacion: zona.clasificacion
    })) || [];
  } catch (error) {
    console.error('❌ Error obteniendo zonas populares:', error);
    return [];
  }
}