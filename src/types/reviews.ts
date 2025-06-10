// types/reviews.ts
// Tipos centralizados para el sistema de reviews

// Tipos base de la base de datos
export interface Review {
    id: string;
    contenido: string;
    calificacion: number;
    fecha_creacion: string;
    usuario_id?: string;
    visita_id?: string;
    // Datos del usuario via join
    usuario?: {
      nombre?: string;
      email?: string;
    };
  }
  
  // Tipos específicos para respuestas de Supabase
  export interface SupabaseReviewRow {
    id: any;
    contenido: any;
    calificacion: any;
    fecha_creacion: any;
    usuario_id: any;
    visita_id: any;
    usuario?: any; // Más flexible para manejar las respuestas de Supabase
  }
  
  export interface ReviewsStats {
    total: number;
    avgRating: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    recentCount: number;
    trends: {
      thisWeek: number;
      lastWeek: number;
      percentageChange: number;
    };
  }
  
  export interface ReviewsServiceResponse {
    reviews: Review[];
    stats: ReviewsStats;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }
  
  // Tipos para los hooks
  export interface UseReviewsOptions {
    limit?: number;
    autoRefresh?: boolean;
    refreshInterval?: number; // en milisegundos
  }
  
  export interface UseReviewsReturn {
    reviews: Review[];
    stats: ReviewsStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    lastUpdated: Date | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    } | null;
  }
  
  export interface UseReviewsPaginatedOptions {
    page?: number;
    limit?: number;
    filters?: {
      calificacion?: number;
      fechaDesde?: string;
      fechaHasta?: string;
    };
  }
  
  export interface UseReviewsPaginatedReturn extends UseReviewsReturn {
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
    canGoNext: boolean;
    canGoPrev: boolean;
    currentPage: number;
  }
  
  export interface UseReviewsStatsReturn {
    stats: ReviewsStats | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    lastUpdated: Date | null;
  }
  
  // Tipos para componentes
  export interface ReviewsCardProps {
    reviews: Review[];
    loading?: boolean;
    onViewAll?: () => void;
    onViewReview?: (reviewId: string) => void;
  }
  
  export interface CompactReviewsCardProps {
    reviews: Review[];
    loading?: boolean;
    onViewAll?: () => void;
  }
  
  // Tipos para filtros y parámetros de API
  export interface ReviewsFilter {
    calificacion?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    usuario_id?: string;
    visita_id?: string;
  }
  
  export interface ReviewsApiParams {
    page?: number;
    limit?: number;
    filter?: ReviewsFilter;
  }
  
  // Tipos para respuestas de API
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
      timestamp: string;
      requestedBy?: string;
      cached?: boolean;
    };
  }
  
  export type ReviewsApiResponse = ApiResponse<ReviewsServiceResponse>;
  export type ReviewApiResponse = ApiResponse<Review>;
  export type ReviewsStatsApiResponse = ApiResponse<ReviewsStats>;
  
  // Enums para constantes
  export enum ReviewRating {
    UNO = 1,
    DOS = 2,
    TRES = 3,
    CUATRO = 4,
    CINCO = 5
  }
  
  export enum ReviewSentiment {
    NEGATIVO = 'negativo',
    NEUTRAL = 'neutral', 
    POSITIVO = 'positivo'
  }
  
  // Funciones de utilidad para tipos
  export const getReviewSentiment = (rating: number): ReviewSentiment => {
    if (rating >= 4) return ReviewSentiment.POSITIVO;
    if (rating >= 3) return ReviewSentiment.NEUTRAL;
    return ReviewSentiment.NEGATIVO;
  };
  
  export const isValidRating = (rating: number): boolean => {
    return rating >= 1 && rating <= 5 && Number.isInteger(rating);
  };