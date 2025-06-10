import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Obteniendo visitantes con rango flexible...');
    
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const fechaInicio = startDate || new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fechaFin = endDate || new Date().toISOString().split('T')[0];
    
    console.log(`📅 Consultando desde ${fechaInicio} hasta ${fechaFin}`);

    const { data: visitantes, error } = await supabase
      .rpc('obtener_visitantes_rango', {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      });

    if (error) throw error;

    const datosGrafico = visitantes?.map((dia: any) => ({
      fecha: dia.fecha,
      visitantes: dia.visitantes || 0,
      dia_semana: dia.dia_semana,
      dia_numero: dia.dia_numero,
      duracion_promedio: dia.duracion_promedio || 0
    })) || [];

    const totalVisitantes = datosGrafico.reduce((sum: number, dia: any) => sum + dia.visitantes, 0);
    const promedioVisitantes = Math.round(totalVisitantes / Math.max(datosGrafico.length, 1));
    const visitantesArray = datosGrafico.map((d: any) => d.visitantes);
    const diaMasPopular = datosGrafico.reduce((max: any, dia: any) => 
      dia.visitantes > max.visitantes ? dia : max, 
      { dia_semana: 'N/A', visitantes: 0 }
    );

    const processingTime = Date.now() - startTime;

    const response = {
      success: true,
      data: {
        visitantesPorDia: {
          datos: datosGrafico,
          estadisticas: {
            total: totalVisitantes,
            promedio: promedioVisitantes,
            maximo: Math.max(...visitantesArray, 0),
            minimo: Math.min(...visitantesArray, 0)
          },
          insight: totalVisitantes > 0 ? 
            `El día más popular fue ${diaMasPopular.dia_semana} con ${diaMasPopular.visitantes} visitantes` :
            'No hay datos de visitantes para este período'
        },
        rangeFechas: {
          inicio: fechaInicio,
          fin: fechaFin,
          totalDias: calcularDiasEnRango(fechaInicio, fechaFin)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          processingTimeMs: processingTime
        }
      }
    };

    console.log(`✅ Visitantes obtenidos en ${processingTime}ms`);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Error obteniendo visitantes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos de visitantes',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function calcularDiasEnRango(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}