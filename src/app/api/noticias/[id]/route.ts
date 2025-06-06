// src/app/api/noticias/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { NoticiaService } from '@/services/noticia.service';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/noticias/[id] - Obtener noticia por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    console.log(`=== GET /api/noticias/${params.id} ===`);
    
    const noticia = await NoticiaService.getById(params.id);

    return NextResponse.json({
      success: true,
      data: noticia
    });

  } catch (error: any) {
    console.error(`Error en GET /api/noticias/${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Noticia no encontrada' 
      },
      { status: 404 }
    );
  }
}

// PUT /api/noticias/[id] - Actualizar noticia
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    console.log(`=== PUT /api/noticias/${params.id} ===`);
    
    const formData = await request.formData();
    
    const updateData: any = {};
    
    const titulo = formData.get('titulo') as string | null;
    const descripcion = formData.get('descripcion') as string | null;
    const zona_id = formData.get('zona_id') as string | null;
    const imagen = formData.get('imagen') as File | null;

    if (titulo) updateData.titulo = titulo;
    if (descripcion) updateData.descripcion = descripcion;
    if (zona_id !== null) updateData.zona_id = zona_id || null;
    if (imagen) updateData.imagen = imagen;

    console.log('Datos a actualizar:', updateData);

    const noticia = await NoticiaService.update(params.id, updateData);

    return NextResponse.json({
      success: true,
      data: noticia,
      message: 'Noticia actualizada exitosamente'
    });

  } catch (error: any) {
    console.error(`Error en PUT /api/noticias/${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al actualizar la noticia' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/noticias/[id] - Eliminar noticia
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    console.log(`=== DELETE /api/noticias/${params.id} ===`);
    
    await NoticiaService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Noticia eliminada exitosamente'
    });

  } catch (error: any) {
    console.error(`Error en DELETE /api/noticias/${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al eliminar la noticia' 
      },
      { status: 500 }
    );
  }
}