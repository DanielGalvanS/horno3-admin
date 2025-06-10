import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Obteniendo datos básicos del dashboard...');
    
    const startTime = Date.now();

    // Ejecutar las 3 queries en paralelo
    const [
      kpisPrincipales,
      visitantes7Dias,
      zonasPopulares
    ] = await Promise.all([
      obtenerKPIsPrincipales(),
      obtenerVisitantes7Dias(),
      obtenerZonasPopulares()
    ]);

    const processingTime = Date.now() - startTime;

    const response = {
      success: true,
      data: {
        kpis: kpisPrincipales,
        visitantesPorDia: visitantes7Dias,
        zonasPopulares: zonasPopulares,
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: processingTime
        }
      }
    };

    console.log(`✅ Dashboard básico obtenido en ${processingTime}ms`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Error obteniendo dashboard básico:', error);
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

// 📊 KPIs Principales
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
      eventosHoy: 0,
      showsHoy: 0,
      laboratoriosHoy: 0,
      capacidadHoy: 0,
      zonasActivas: 0,
      crecimientoVisitantes: 0
    };
  }
}

// 📈 Visitantes últimos 7 días
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
      dia: dia.dia_semana,
      duracionPromedio: dia.duracion_promedio || 0
    })) || [];

    // Calcular estadísticas
    const totalVisitantes = datosGrafico.reduce((sum, dia) => sum + dia.visitantes, 0);
    const promedioVisitantes = Math.round(totalVisitantes / Math.max(datosGrafico.length, 1));
    const visitantesArray = datosGrafico.map(d => d.visitantes);
    const diaMasPopular = datosGrafico.reduce((max, dia) => 
      dia.visitantes > max.visitantes ? dia : max, 
      { dia: 'N/A', visitantes: 0 }
    );

    return {
      datos: datosGrafico,
      estadisticas: {
        total: totalVisitantes,
        promedio: promedioVisitantes,
        maximo: Math.max(...visitantesArray, 0),
        minimo: Math.min(...visitantesArray, 0)
      },
      insight: totalVisitantes > 0 ? 
      `El día más popular fue ${diaMasPopular.dia} con ${diaMasPopular.visitantes} visitantes` :
        'No hay datos de visitantes disponibles'
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

// 🏆 Zonas más populares
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
      visitas: zona.visitas, // eventos_activos
      porcentaje: zona.porcentaje, // score_real
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