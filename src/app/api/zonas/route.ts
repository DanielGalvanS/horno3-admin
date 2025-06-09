// src/app/api/zonas/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ZonaService } from '@/services/zona.service';

// GET /api/zonas - Obtener todas las zonas
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/zonas ===');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const actividad = searchParams.get('actividad');
    const nivel = searchParams.get('nivel');

    let zonas;

    if (search) {
      // Si hay búsqueda, filtrar por nombre, descripción o categorías
      const todasLasZonas = await ZonaService.getAll();
      zonas = todasLasZonas.filter(zona => 
        zona.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (zona.descripcion?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (zona.categorias?.some(cat => cat.toLowerCase().includes(search.toLowerCase())) ?? false)
      );
    } else if (actividad) {
      // Filtrar por actividad
      const todasLasZonas = await ZonaService.getAll();
      zonas = todasLasZonas.filter(zona => zona.actividad === actividad);
    } else if (nivel) {
      // Filtrar por nivel
      const todasLasZonas = await ZonaService.getAll();
      zonas = todasLasZonas.filter(zona => zona.nivel === parseInt(nivel));
    } else {
      // Obtener todas las zonas
      zonas = await ZonaService.getAll();
    }

    console.log(`Zonas encontradas: ${zonas.length}`);

    return NextResponse.json({
      success: true,
      data: zonas,
      total: zonas.length
    });

  } catch (error: any) {
    console.error('Error en GET /api/zonas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

// POST /api/zonas - Crear nueva zona
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/zonas ===');
    
    const body = await request.json();
    
    const { nombre, descripcion, categorias, nivel, duracion, actividad } = body;

    console.log('Datos recibidos:', {
      nombre,
      descripcion,
      categorias,
      nivel,
      duracion,
      actividad
    });

    // Validaciones básicas
    if (!nombre || !duracion || !actividad) {
      console.error('Faltan campos obligatorios');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre, duración y actividad son obligatorios' 
        },
        { status: 400 }
      );
    }

    if (nombre.length < 3) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre debe tener al menos 3 caracteres' 
        },
        { status: 400 }
      );
    }

    if (duracion <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La duración debe ser mayor a 0' 
        },
        { status: 400 }
      );
    }

    if (!['baja', 'media', 'alta'].includes(actividad)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La actividad debe ser: baja, media o alta' 
        },
        { status: 400 }
      );
    }

    const zonaData = {
      nombre,
      descripcion: descripcion || null,
      categorias: categorias || null,
      nivel: nivel || null,
      duracion,
      actividad
    };

    console.log('Llamando a ZonaService.create...');
    const zona = await ZonaService.create(zonaData);
    console.log('Zona creada exitosamente:', zona.id);

    return NextResponse.json({
      success: true,
      data: zona,
      message: 'Zona creada exitosamente'
    });

  } catch (error: any) {
    console.error('Error en POST /api/zonas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al crear la zona' 
      },
      { status: 500 }
    );
  }
}