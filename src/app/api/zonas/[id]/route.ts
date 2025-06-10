// src/app/api/zonas/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ZonaService } from '@/services/zona.service';
import type { UpdateZonaData } from '@/types/zona';

interface Params {
  params: Promise<{ id: string }>; // ✅ Next.js 15 - params es Promise
}

// GET - Obtener zona por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await params; // ✅ Await params
    console.log(`=== GET /api/zonas/${resolvedParams.id} ===`);
    
    const zona = await ZonaService.getById(resolvedParams.id);
    
    if (!zona) {
      return NextResponse.json({
        success: false,
        error: 'Zona no encontrada'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: zona
    });

  } catch (error: any) {
    console.error('Error en GET zona:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

// PUT - Actualizar zona
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await params; // ✅ Await params
    console.log(`=== PUT /api/zonas/${resolvedParams.id} ===`);
    
    const formData = await request.formData();
    
    // Extraer datos del FormData
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;
    const categoriasStr = formData.get('categorias') as string;
    const nivel = parseInt(formData.get('nivel') as string);
    const duracion = parseInt(formData.get('duracion') as string);
    const actividad = formData.get('actividad') as 'baja' | 'media' | 'alta';
    const activo = formData.get('activo') === 'true';
    const imagen = formData.get('imagen') as File | null;
    const deleteImage = formData.get('deleteImage') as string | null;
    
    console.log('Datos recibidos para actualización:', {
      nombre,
      descripcion,
      categorias: categoriasStr,
      nivel: nivel.toString(),
      duracion: duracion.toString(),
      actividad,
      activo: activo.toString(),
      imagen: imagen ? `${imagen.name} (${imagen.size} bytes)` : null,
      deleteImage
    });

    // Validar datos requeridos
    if (!nombre?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'El nombre es obligatorio'
      }, { status: 400 });
    }

    if (!descripcion?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'La descripción es obligatoria'
      }, { status: 400 });
    }

    if (!actividad || !['baja', 'media', 'alta'].includes(actividad)) {
      return NextResponse.json({
        success: false,
        error: 'La intensidad de actividad debe ser: baja, media o alta'
      }, { status: 400 });
    }

    if (isNaN(nivel) || nivel < 1 || nivel > 3) {
      return NextResponse.json({
        success: false,
        error: 'El nivel debe ser un número entre 1 y 3'
      }, { status: 400 });
    }

    if (isNaN(duracion) || duracion < 5 || duracion > 180) {
      return NextResponse.json({
        success: false,
        error: 'La duración debe ser un número entre 5 y 180 minutos'
      }, { status: 400 });
    }

    // Parsear categorías
    let categorias: string[] = [];
    if (categoriasStr) {
      try {
        const parsed = JSON.parse(categoriasStr);
        categorias = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        categorias = [categoriasStr];
      }
    }

    // Validar que existe al menos una categoría
    if (categorias.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Debe especificar al menos una categoría'
      }, { status: 400 });
    }

    console.log('Datos validados, actualizando zona...');

    // Preparar datos de actualización
    const updateData: UpdateZonaData = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categorias,
      nivel,
      duracion,
      actividad,
      activo
    };

    // Actualizar zona con imagen
    const zona = await ZonaService.updateWithImage(
      resolvedParams.id, // ✅ Usar resolvedParams.id
      updateData,
      imagen && imagen.size > 0 ? imagen : undefined,
      deleteImage === 'true'
    );

    console.log('✅ Zona actualizada exitosamente:', zona.id);

    return NextResponse.json({
      success: true,
      data: zona,
      message: 'Zona actualizada exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error en PUT zona:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Agregar este método PATCH a tu src/app/api/zonas/[id]/route.ts
// (después del método PUT y antes del método DELETE)

// PATCH - Actualizar campos específicos (como estado activo)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await params;
    console.log(`=== PATCH /api/zonas/${resolvedParams.id} ===`);
    
    const body = await request.json();
    console.log('Datos recibidos para PATCH:', body);

    // Validar que el ID sea válido
    if (!resolvedParams.id) {
      return NextResponse.json({
        success: false,
        error: 'ID de zona inválido'
      }, { status: 400 });
    }

    // Verificar que la zona existe
    const zonaExistente = await ZonaService.getById(resolvedParams.id);
    if (!zonaExistente) {
      return NextResponse.json({
        success: false,
        error: 'Zona no encontrada'
      }, { status: 404 });
    }

    // Actualizar solo los campos proporcionados
    const zona = await ZonaService.update(resolvedParams.id, body);

    console.log('✅ Zona actualizada exitosamente (PATCH):', zona.id);

    return NextResponse.json({
      success: true,
      data: zona,
      message: 'Zona actualizada exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error en PATCH zona:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 });
  }
}

// DELETE - Eliminar zona con manejo de Foreign Key
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const resolvedParams = await params; 
    const zonaId = resolvedParams.id;
    
    console.log(`=== DELETE /api/zonas/${zonaId} ===`);
    
    // ✅ QUITAMOS la verificación previa - la BD maneja todo automáticamente
    // const isZonaInUse = await ZonaService.checkIfZonaIsInUse(zonaId); ❌ REMOVIDO
    
    await ZonaService.deleteWithImage(zonaId);

    return NextResponse.json({
      success: true,
      message: 'Zona eliminada exitosamente'
    });

  } catch (error: any) {
    const resolvedParams = await params;
    console.error(`Error en DELETE /api/zonas/${resolvedParams.id}:`, error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Error al eliminar la zona'
    }, { status: 500 });
  }
}