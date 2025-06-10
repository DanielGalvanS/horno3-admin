// services/reviewsService.ts
// Servicio corregido con tipos adecuados para Supabase

import { supabase } from '@/lib/supabase';
import type { 
  Review, 
  ReviewsStats, 
  ReviewsServiceResponse,
  ReviewsFilter,
  SupabaseReviewRow
} from '@/types/reviews';

export class ReviewsService {
  
  /**
   * Obtener reviews recientes para el dashboard
   */
  static async getRecentReviews(limit: number = 10): Promise<ReviewsServiceResponse> {
    try {
      console.log(`🔍 ReviewsService: Obteniendo ${limit} reviews recientes`);

      // 1. Obtener reviews con información de usuario
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('review')
        .select(`
          id,
          contenido,
          calificacion,
          fecha_creacion,
          usuario_id,
          visita_id,
          usuario:usuario_id (
            nombre,
            email
          )
        `)
        .order('fecha_creacion', { ascending: false })
        .limit(limit);

      if (reviewsError) {
        throw new Error(`Error obteniendo reviews: ${reviewsError.message}`);
      }

      // 2. Obtener estadísticas completas
      const stats = await this.calculateStats();

      // 3. Procesar y formatear reviews sin casting forzado
      const processedReviews: Review[] = (reviewsData || []).map((review: any) => {
        // Manejar el usuario que puede venir como array o objeto
        let usuario = undefined;
        if (review.usuario) {
          if (Array.isArray(review.usuario) && review.usuario.length > 0) {
            usuario = {
              nombre: review.usuario[0]?.nombre || '',
              email: review.usuario[0]?.email || ''
            };
          } else if (typeof review.usuario === 'object') {
            usuario = {
              nombre: review.usuario?.nombre || '',
              email: review.usuario?.email || ''
            };
          }
        }

        return {
          id: String(review.id),
          contenido: String(review.contenido || ''),
          calificacion: Number(review.calificacion || 0),
          fecha_creacion: String(review.fecha_creacion),
          usuario_id: review.usuario_id ? String(review.usuario_id) : undefined,
          visita_id: review.visita_id ? String(review.visita_id) : undefined,
          usuario
        };
      });

      console.log(`✅ ReviewsService: ${processedReviews.length} reviews procesados`);

      return {
        reviews: processedReviews,
        stats,
        pagination: {
          page: 1,
          limit,
          total: stats.total,
          hasMore: stats.total > limit
        }
      };

    } catch (error) {
      console.error('❌ ReviewsService Error:', error);
      throw error instanceof Error ? error : new Error('Error desconocido en ReviewsService');
    }
  }

  /**
   * Calcular estadísticas completas de reviews
   */
  static async calculateStats(): Promise<ReviewsStats> {
    try {
      // Obtener todos los reviews para estadísticas
      const { data: allReviews, error } = await supabase
        .from('review')
        .select('calificacion, fecha_creacion');

      if (error) {
        throw new Error(`Error calculando stats: ${error.message}`);
      }

      if (!allReviews || allReviews.length === 0) {
        return {
          total: 0,
          avgRating: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recentCount: 0,
          trends: { thisWeek: 0, lastWeek: 0, percentageChange: 0 }
        };
      }

      const total = allReviews.length;
      const avgRating = allReviews.reduce((acc, r) => acc + r.calificacion, 0) / total;

      // Distribución por calificación con tipos seguros
      const distribution = allReviews.reduce((acc, r) => {
        const rating = r.calificacion as 1 | 2 | 3 | 4 | 5;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

      // Reviews recientes (últimos 7 días)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const thisWeek = allReviews.filter(r => 
        new Date(r.fecha_creacion) > sevenDaysAgo
      ).length;

      const lastWeek = allReviews.filter(r => {
        const reviewDate = new Date(r.fecha_creacion);
        return reviewDate > fourteenDaysAgo && reviewDate <= sevenDaysAgo;
      }).length;

      const percentageChange = lastWeek > 0 
        ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
        : thisWeek > 0 ? 100 : 0;

      return {
        total,
        avgRating: Number(avgRating.toFixed(1)),
        distribution,
        recentCount: thisWeek,
        trends: {
          thisWeek,
          lastWeek,
          percentageChange
        }
      };

    } catch (error) {
      console.error('❌ Error calculando estadísticas:', error);
      throw error instanceof Error ? error : new Error('Error desconocido calculando estadísticas');
    }
  }

  /**
   * Obtener reviews paginados (para vista completa)
   */
  static async getReviewsPaginated(
    page: number = 1, 
    limit: number = 20,
    filter?: ReviewsFilter
  ): Promise<ReviewsServiceResponse> {
    try {
      let query = supabase
        .from('review')
        .select(`
          id,
          contenido,
          calificacion,
          fecha_creacion,
          usuario_id,
          visita_id,
          usuario:usuario_id (
            nombre,
            email
          )
        `, { count: 'exact' });

      // Aplicar filtros si existen
      if (filter?.calificacion) {
        query = query.eq('calificacion', filter.calificacion);
      }
      
      if (filter?.fechaDesde) {
        query = query.gte('fecha_creacion', filter.fechaDesde);
      }
      
      if (filter?.fechaHasta) {
        query = query.lte('fecha_creacion', filter.fechaHasta);
      }

      if (filter?.usuario_id) {
        query = query.eq('usuario_id', filter.usuario_id);
      }

      if (filter?.visita_id) {
        query = query.eq('visita_id', filter.visita_id);
      }

      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query
        .order('fecha_creacion', { ascending: false })
        .range(from, to);

      if (error) {
        throw new Error(`Error en paginación: ${error.message}`);
      }

      // Procesar reviews sin casting forzado
      const processedReviews: Review[] = (data || []).map((review: any) => {
        // Manejar el usuario que puede venir como array o objeto
        let usuario = undefined;
        if (review.usuario) {
          if (Array.isArray(review.usuario) && review.usuario.length > 0) {
            usuario = {
              nombre: review.usuario[0]?.nombre || '',
              email: review.usuario[0]?.email || ''
            };
          } else if (typeof review.usuario === 'object') {
            usuario = {
              nombre: review.usuario?.nombre || '',
              email: review.usuario?.email || ''
            };
          }
        }

        return {
          id: String(review.id),
          contenido: String(review.contenido || ''),
          calificacion: Number(review.calificacion || 0),
          fecha_creacion: String(review.fecha_creacion),
          usuario_id: review.usuario_id ? String(review.usuario_id) : undefined,
          visita_id: review.visita_id ? String(review.visita_id) : undefined,
          usuario
        };
      });

      const stats = await this.calculateStats();

      return {
        reviews: processedReviews,
        stats,
        pagination: {
          page,
          limit,
          total: count || 0,
          hasMore: (count || 0) > (page * limit)
        }
      };

    } catch (error) {
      console.error('❌ Error en paginación:', error);
      throw error instanceof Error ? error : new Error('Error desconocido en paginación');
    }
  }

  /**
   * Obtener un review específico por ID
   */
  static async getReviewById(id: string): Promise<Review | null> {
    try {
      const { data, error } = await supabase
        .from('review')
        .select(`
          id,
          contenido,
          calificacion,
          fecha_creacion,
          usuario_id,
          visita_id,
          usuario:usuario_id (
            nombre,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error obteniendo review: ${error.message}`);
      }

      // Procesar review sin casting forzado
      const reviewData = data as any;
      
      // Manejar el usuario que puede venir como array o objeto
      let usuario = undefined;
      if (reviewData.usuario) {
        if (Array.isArray(reviewData.usuario) && reviewData.usuario.length > 0) {
          usuario = {
            nombre: reviewData.usuario[0]?.nombre || '',
            email: reviewData.usuario[0]?.email || ''
          };
        } else if (typeof reviewData.usuario === 'object') {
          usuario = {
            nombre: reviewData.usuario?.nombre || '',
            email: reviewData.usuario?.email || ''
          };
        }
      }

      return {
        id: String(reviewData.id),
        contenido: String(reviewData.contenido || ''),
        calificacion: Number(reviewData.calificacion || 0),
        fecha_creacion: String(reviewData.fecha_creacion),
        usuario_id: reviewData.usuario_id ? String(reviewData.usuario_id) : undefined,
        visita_id: reviewData.visita_id ? String(reviewData.visita_id) : undefined,
        usuario
      };

    } catch (error) {
      console.error('❌ Error obteniendo review por ID:', error);
      throw error instanceof Error ? error : new Error('Error desconocido obteniendo review');
    }
  }

  /**
   * Crear un nuevo review (para futuras funcionalidades)
   */
  static async createReview(reviewData: {
    contenido: string;
    calificacion: number;
    usuario_id: string;
    visita_id?: string;
  }): Promise<Review> {
    try {
      const { data, error } = await supabase
        .from('review')
        .insert({
          contenido: reviewData.contenido,
          calificacion: reviewData.calificacion,
          usuario_id: reviewData.usuario_id,
          visita_id: reviewData.visita_id || null,
          fecha_creacion: new Date().toISOString()
        })
        .select(`
          id,
          contenido,
          calificacion,
          fecha_creacion,
          usuario_id,
          visita_id,
          usuario:usuario_id (
            nombre,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(`Error creando review: ${error.message}`);
      }

      // Procesar review creado sin casting forzado
      const createdReview = data as any;
      
      // Manejar el usuario que puede venir como array o objeto
      let usuario = undefined;
      if (createdReview.usuario) {
        if (Array.isArray(createdReview.usuario) && createdReview.usuario.length > 0) {
          usuario = {
            nombre: createdReview.usuario[0]?.nombre || '',
            email: createdReview.usuario[0]?.email || ''
          };
        } else if (typeof createdReview.usuario === 'object') {
          usuario = {
            nombre: createdReview.usuario?.nombre || '',
            email: createdReview.usuario?.email || ''
          };
        }
      }

      return {
        id: String(createdReview.id),
        contenido: String(createdReview.contenido || ''),
        calificacion: Number(createdReview.calificacion || 0),
        fecha_creacion: String(createdReview.fecha_creacion),
        usuario_id: createdReview.usuario_id ? String(createdReview.usuario_id) : undefined,
        visita_id: createdReview.visita_id ? String(createdReview.visita_id) : undefined,
        usuario
      };

    } catch (error) {
      console.error('❌ Error creando review:', error);
      throw error instanceof Error ? error : new Error('Error desconocido creando review');
    }
  }
}