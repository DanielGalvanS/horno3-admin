// src/app/api/horarios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { HorarioService } from '@/services/horario.service';

// GET - Obtener todos los horarios con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    console.log('🕐 GET /api/horarios - Obteniendo horarios');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const dia = searchParams.get('dia');
    const tipo = searchParams.get('tipo');
    const activoParam = searchParams.get('activo');

    const params = {
      ...(search && { search }),
      ...(dia && { dia }),
      ...(tipo && { tipo }),
      ...(activoParam !== null && { activo: activoParam === 'true' })
    };

    const data = await HorarioService.getAll(params);

    console.log(`✅ Horarios obtenidos: ${data?.length || 0}`);

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error: any) {
    console.error('❌ Error en GET /api/horarios:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    }, { status: 500 });
  }
}

// POST - Crear nuevo horario
export async function POST(request: NextRequest) {
  try {
    console.log('🕐 POST /api/horarios - Creando horario');

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

    // Verificar si ya existe un horario con el mismo día y hora
    const exists = await HorarioService.existsHorario(dia, hora);
    if (exists) {
      return NextResponse.json({
        success: false,
        error: 'Ya existe un horario para este día y hora'
      }, { status: 400 });
    }

    // Crear el horario
    const data = await HorarioService.create({ 
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

    console.log('✅ Horario creado:', data);

    return NextResponse.json({
      success: true,
      data,
      message: 'Horario creado exitosamente'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error en POST /api/horarios:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    }, { status: 500 });
  }
}