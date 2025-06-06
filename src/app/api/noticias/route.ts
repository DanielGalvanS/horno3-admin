// src/app/api/noticias/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NoticiaService } from '@/services/noticia.service';

// GET /api/noticias - Obtener todas las noticias
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/noticias ===');
    
    const { searchParams } = new URL(request.url);
    const zona_id = searchParams.get('zona_id');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    let noticias;

    if (search) {
      noticias = await NoticiaService.search(search);
    } else if (zona_id) {
      noticias = await NoticiaService.getByZona(zona_id);
    } else if (limit) {
      noticias = await NoticiaService.getRecientes(parseInt(limit));
    } else {
      noticias = await NoticiaService.getAll();
    }

    console.log(`Noticias encontradas: ${noticias.length}`);

    return NextResponse.json({
      success: true,
      data: noticias,
      total: noticias.length
    });

  } catch (error: any) {
    console.error('Error en GET /api/noticias:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// POST /api/noticias - Crear nueva noticia
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/noticias ===');
    
    const formData = await request.formData();
    
    const titulo = formData.get('titulo') as string;
    const descripcion = formData.get('descripcion') as string;
    const zona_id = formData.get('zona_id') as string | null;
    const imagen = formData.get('imagen') as File | null;

    console.log('Datos recibidos:', {
      titulo,
      descripcion,
      zona_id,
      imagen: imagen ? `${imagen.name} (${imagen.size} bytes)` : 'No imagen'
    });

    // Validaciones básicas
    if (!titulo || !descripcion) {
      console.error('Faltan campos obligatorios');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Título y descripción son obligatorios' 
        },
        { status: 400 }
      );
    }

    if (titulo.length < 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El título debe tener al menos 5 caracteres' 
        },
        { status: 400 }
      );
    }

    if (descripcion.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La descripción debe tener al menos 10 caracteres' 
        },
        { status: 400 }
      );
    }

    const noticiaData = {
      titulo,
      descripcion,
      zona_id: zona_id || null,
      imagen: imagen || undefined
    };

    console.log('Llamando a NoticiaService.create...');
    const noticia = await NoticiaService.create(noticiaData);
    console.log('Noticia creada exitosamente:', noticia.id);

    return NextResponse.json({
      success: true,
      data: noticia,
      message: 'Noticia creada exitosamente'
    });

  } catch (error: any) {
    console.error('Error en POST /api/noticias:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al crear la noticia' 
      },
      { status: 500 }
    );
  }
}