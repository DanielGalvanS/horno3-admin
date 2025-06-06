// src/app/api/zonas/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ZonaService } from '@/services/zona.service';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/zonas/[id] - Obtener zona por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    console.log(`=== GET /api/zonas/${params.id} ===`);
    
    const zona = await ZonaService.getById(params.id);

    if (!zona) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: zona
    });

  } catch (error: any) {
    console.error(`Error en GET /api/zonas/${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Zona no encontrada' 
      },
      { status: 404 }
    );
  }
}

// PUT /api/zonas/[id] - Actualizar zona
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    console.log(`=== PUT /api/zonas/${params.id} ===`);
    
    const body = await request.json();
    
    const updateData: any = {};
    
    const { nombre, descripcion, categorias, nivel, duracion, actividad } = body;

    // Solo actualizar campos que se envían
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion || null;
    if (categorias !== undefined) updateData.categorias = categorias || null;
    if (nivel !== undefined) updateData.nivel = nivel || null;
    if (duracion !== undefined) updateData.duracion = duracion;
    if (actividad !== undefined) updateData.actividad = actividad;

    console.log('Datos a actualizar:', updateData);

    // Validaciones básicas
    if (updateData.nombre && updateData.nombre.length < 3) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre debe tener al menos 3 caracteres' 
        },
        { status: 400 }
      );
    }

    if (updateData.duracion && updateData.duracion <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La duración debe ser mayor a 0' 
        },
        { status: 400 }
      );
    }

    if (updateData.actividad && !['baja', 'media', 'alta'].includes(updateData.actividad)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La actividad debe ser: baja, media o alta' 
        },
        { status: 400 }
      );
    }

    const zona = await ZonaService.update(params.id, updateData);

    return NextResponse.json({
      success: true,
      data: zona,
      message: 'Zona actualizada exitosamente'
    });

  } catch (error: any) {
    console.error(`Error en PUT /api/zonas/${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al actualizar la zona' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/zonas/[id] - Eliminar zona
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    console.log(`=== DELETE /api/zonas/${params.id} ===`);
    
    // Verificar si la zona existe antes de eliminarla
    const zonaExistente = await ZonaService.getById(params.id);
    if (!zonaExistente) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Zona no encontrada' 
        },
        { status: 404 }
      );
    }

    await ZonaService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Zona eliminada exitosamente'
    });

  } catch (error: any) {
    console.error(`Error en DELETE /api/zonas/${params.id}:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al eliminar la zona' 
      },
      { status: 500 }
    );
  }
}