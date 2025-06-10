// app/api/reviews/stats/route.ts
// Versión sin autenticación para desarrollo (Next.js 15+ compatible)

import { NextRequest, NextResponse } from 'next/server';
import { ReviewsService } from '@/services/reviewsService';
import type { ReviewsStatsApiResponse } from '@/types/reviews';

// GET /api/reviews/stats - Sin autenticación para desarrollo
export async function GET(request: NextRequest): Promise<NextResponse<ReviewsStatsApiResponse>> {
  try {
    console.log('📊 API Reviews Stats: Calculando estadísticas sin autenticación...');

    const stats = await ReviewsService.calculateStats();

    const response: ReviewsStatsApiResponse = {
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        requestedBy: 'dev-mode-no-auth',
        cached: false
      }
    };

    console.log('✅ API Reviews Stats: Estadísticas calculadas exitosamente');
    
    // Headers de cache y CORS
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=300'); // 5 minutos
    headers.set('X-API-Version', '1.0');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('❌ API Reviews Stats Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error calculando estadísticas';
    
    const errorResponse: ReviewsStatsApiResponse = {
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}