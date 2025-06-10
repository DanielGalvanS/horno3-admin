// app/api/reviews/[id]/route.ts
// Versión sin autenticación para desarrollo (Next.js 15+ compatible)

import { NextRequest, NextResponse } from 'next/server';
import { ReviewsService } from '@/services/reviewsService';
import type { ReviewApiResponse } from '@/types/reviews';

interface Context {
  params: {
    id: string;
  };
}

// GET /api/reviews/[id] - Sin autenticación para desarrollo
export async function GET(
  request: NextRequest, 
  context: Context
): Promise<NextResponse<ReviewApiResponse>> {
  try {
    // Validar parámetros
    const { id } = context.params;
    
    if (!id || typeof id !== 'string') {
      console.error('❌ ID de review inválido:', id);
      return NextResponse.json(
        { 
          success: false,
          error: 'ID de review requerido y debe ser válido' 
        },
        { status: 400 }
      );
    }

    console.log(`🔍 API Reviews: Obteniendo review ${id} (sin autenticación)`);

    // Obtener review
    const review = await ReviewsService.getReviewById(id);

    if (!review) {
      console.log(`❌ Review no encontrado: ${id}`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Review no encontrado' 
        },
        { status: 404 }
      );
    }

    const response: ReviewApiResponse = {
      success: true,
      data: review,
      meta: {
        timestamp: new Date().toISOString(),
        requestedBy: 'dev-mode-no-auth',
        cached: false
      }
    };

    console.log(`✅ API Reviews: Review ${id} obtenido exitosamente`);
    
    // Headers CORS
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('❌ API Reviews [id] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    const errorResponse: ReviewApiResponse = {
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