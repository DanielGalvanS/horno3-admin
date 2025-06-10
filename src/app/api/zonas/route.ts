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
    const activo = searchParams.get('activo');

    let zonas;

    if (search) {
      const todasLasZonas = await ZonaService.getAll();
      zonas = todasLasZonas.filter(zona => 
        zona.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (zona.descripcion?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (zona.categorias?.some(cat => cat.toLowerCase().includes(search.toLowerCase())) ?? false)
      );
    } else if (actividad) {
      const todasLasZonas = await ZonaService.getAll();
      zonas = todasLasZonas.filter(zona => zona.actividad === actividad);
    } else if (nivel) {
      const todasLasZonas = await ZonaService.getAll();
      zonas = todasLasZonas.filter(zona => zona.nivel === parseInt(nivel));
    } else if (activo !== null) {
      const todasLasZonas = await ZonaService.getAll();
      zonas = todasLasZonas.filter(zona => zona.activo === (activo === 'true'));
    } else {
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

// POST /api/zonas - Crear nueva zona (con soporte para imágenes)
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/zonas ===');
    
    const formData = await request.formData();
    
    // Extraer datos del form
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;
    const categorias = formData.get('categorias') as string;
    const nivel = formData.get('nivel') as string;
    const duracion = formData.get('duracion') as string;
    const actividad = formData.get('actividad') as string;
    const activo = formData.get('activo') as string;
    const imagen = formData.get('imagen') as File | null;

    console.log('Datos recibidos:', {
      nombre,
      descripcion,
      categorias,
      nivel,
      duracion,
      actividad,
      activo,
      imagen: imagen ? `${imagen.name} (${imagen.size} bytes)` : 'Sin imagen'
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

    const duracionNum = parseInt(duracion);
    if (duracionNum <= 0) {
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

    // Validar imagen si se proporciona
    if (imagen && imagen.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imagen.type)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Tipo de archivo no válido. Use JPG, PNG, WebP o GIF' 
          },
          { status: 400 }
        );
      }

      // Límite de 5MB
      if (imagen.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'La imagen no debe superar los 5MB' 
          },
          { status: 400 }
        );
      }
    }

    const actividadValida = ['baja', 'media', 'alta'].includes(actividad) 
  ? actividad as 'baja' | 'media' | 'alta' 
  : 'media'; // valor por defecto

    // Preparar datos de la zona
    const zonaData = {
      nombre,
      descripcion: descripcion || null,
      categorias: categorias ? JSON.parse(categorias) : null,
      nivel: nivel ? parseInt(nivel) : null,
      duracion: duracionNum,
      actividad: actividadValida,
      activo: activo ? activo === 'true' : true
    };

    console.log('Llamando a ZonaService.createWithImage...');
    
    // Crear zona con imagen
    const zona = await ZonaService.createWithImage(
      zonaData, 
      imagen && imagen.size > 0 ? imagen : undefined
    );
    
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