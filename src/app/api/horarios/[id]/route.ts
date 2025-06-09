// src/app/api/horarios/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { HorarioService } from '@/services/horario.service';

// GET - Obtener horario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🕐 GET /api/horarios/${id} - Obteniendo horario`);

    const data = await HorarioService.getById(id);

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Horario no encontrado'
      }, { status: 404 });
    }

    console.log('✅ Horario obtenido:', data);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error(`❌ Error en GET /api/horarios/${params.id}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    }, { status: 500 });
  }
}

// PUT - Actualizar horario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🕐 PUT /api/horarios/${id} - Actualizando horario`);

    const body = await request.json();
    console.log('📝 Datos recibidos:', body);

    const { dia, hora, nombre, descripcion, tipo, duracion, idioma, cupo_maximo, zona_id, activo } = body;

    // Validaciones básicas
    if (!dia || !hora) {
      return NextResponse.json({
        success: false,
        error: 'Día y hora son requeridos'
      }, { status: 400 });
    }

    const diasValidos = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    if (!diasValidos.includes(dia)) {
      return NextResponse.json({
        success: false,
        error: 'Día no válido'
      }, { status: 400 });
    }

    // Validación de duración si se proporciona
    if (duracion !== undefined && (duracion < 5 || duracion > 300)) {
      return NextResponse.json({
        success: false,
        error: 'La duración debe estar entre 5 y 300 minutos'
      }, { status: 400 });
    }

    // Validación de cupo máximo si se proporciona
    if (cupo_maximo !== undefined && (cupo_maximo < 1 || cupo_maximo > 1000)) {
      return NextResponse.json({
        success: false,
        error: 'El cupo máximo debe estar entre 1 y 1000 personas'
      }, { status: 400 });
    }

    // Verificar si ya existe otro horario con el mismo día y hora (excluyendo el actual)
    const exists = await HorarioService.existsHorario(dia, hora, id);
    if (exists) {
      return NextResponse.json({
        success: false,
        error: 'Ya existe otro horario para este día y hora'
      }, { status: 400 });
    }

    // Actualizar el horario
    const data = await HorarioService.update(id, { 
      dia, 
      hora, 
      nombre, 
      descripcion, 
      tipo, 
      duracion, 
      idioma, 
      cupo_maximo, 
      zona_id, 
      activo 
    });

    console.log('✅ Horario actualizado:', data);

    return NextResponse.json({
      success: true,
      data,
      message: 'Horario actualizado exitosamente'
    });

  } catch (error: any) {
    console.error(`❌ Error en PUT /api/horarios/${params.id}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    }, { status: 500 });
  }
}

// DELETE - Eliminar horario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`🕐 DELETE /api/horarios/${id} - Eliminando horario`);

    // Verificar si el horario existe
    const existingHorario = await HorarioService.getById(id);
    if (!existingHorario) {
      return NextResponse.json({
        success: false,
        error: 'Horario no encontrado'
      }, { status: 404 });
    }

    // Eliminar el horario
    await HorarioService.delete(id);

    console.log('✅ Horario eliminado exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Horario eliminado exitosamente'
    });

  } catch (error: any) {
    console.error(`❌ Error en DELETE /api/horarios/${params.id}:`, error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    }, { status: 500 });
  }
}