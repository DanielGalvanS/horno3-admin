// app/api/reviews/route.ts
// Versión sin autenticación para desarrollo (Next.js 15+ compatible)

import { NextRequest, NextResponse } from 'next/server';
import { ReviewsService } from '@/services/reviewsService';
import type { ReviewsApiResponse, ReviewsFilter } from '@/types/reviews';

// GET /api/reviews - Sin autenticación para desarrollo
export async function GET(request: NextRequest): Promise<NextResponse<ReviewsApiResponse>> {
  try {
    console.log('📊 API Reviews: Iniciando sin autenticación...');

    // Parsear query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const page = parseInt(searchParams.get('page') || '1');
    const calificacion = searchParams.get('calificacion');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    console.log(`📊 API Reviews: Parámetros - limit: ${limit}, page: ${page}`);

    // Construir filtros
    const filter: ReviewsFilter = {};
    if (calificacion) filter.calificacion = parseInt(calificacion);
    if (fechaDesde) filter.fechaDesde = fechaDesde;
    if (fechaHasta) filter.fechaHasta = fechaHasta;

    // Obtener datos
    let result;
    if (page > 1 || Object.keys(filter).length > 0) {
      console.log('📊 Obteniendo reviews paginados...');
      result = await ReviewsService.getReviewsPaginated(page, limit, filter);
    } else {
      console.log('📊 Obteniendo reviews recientes...');
      result = await ReviewsService.getRecentReviews(limit);
    }

    // Respuesta exitosa
    const response: ReviewsApiResponse = {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        requestedBy: 'dev-mode-no-auth',
        cached: false
      }
    };

    console.log(`✅ API Reviews: Éxito - ${result.reviews.length} reviews devueltos`);
    
    // Headers CORS para desarrollo
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('❌ API Reviews Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    console.error('❌ Error detallado:', errorMessage);
    
    const errorResponse: ReviewsApiResponse = {
      success: false,
      error: errorMessage,
      meta: {
        timestamp: new Date().toISOString(),
        cached: false
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// POST /api/reviews - Sin autenticación
export async function POST(request: NextRequest): Promise<NextResponse<ReviewsApiResponse>> {
  try {
    console.log('📝 API Reviews POST: No implementado aún');

    const notImplementedResponse: ReviewsApiResponse = {
      success: false,
      error: 'Método POST no implementado en esta versión',
      meta: {
        timestamp: new Date().toISOString(),
        cached: false
      }
    };

    return NextResponse.json(notImplementedResponse, { status: 501 });

  } catch (error) {
    console.error('❌ API Reviews POST Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    const errorResponse: ReviewsApiResponse = {
      success: false,
      error: errorMessage,
      meta: {
        timestamp: new Date().toISOString(),
        cached: false
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}