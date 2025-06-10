// hooks/useReviews.ts
// Hook que consume las API routes - ACTUALIZADO CON TIPOS CENTRALIZADOS

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { 
  Review, 
  ReviewsStats, 
  ReviewsServiceResponse,
  UseReviewsOptions,
  UseReviewsReturn,
  UseReviewsPaginatedOptions,
  UseReviewsPaginatedReturn,
  UseReviewsStatsReturn,
  ReviewsApiResponse
} from '@/types/reviews';

// Hook principal para reviews del dashboard
export const useReviews = (options: UseReviewsOptions = {}): UseReviewsReturn => {
  const {
    limit = 10,
    autoRefresh = false,
    refreshInterval = 30000 // 30 segundos
  } = options;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pagination, setPagination] = useState<UseReviewsReturn['pagination']>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 useReviews: Fetching ${limit} reviews from API...`);

      // Llamar a la API route
      const response = await fetch(`/api/reviews?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies para auth
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Si no se puede parsear el JSON, usar el status
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error desconocido');
      }

      const data: ReviewsServiceResponse = result.data;

      // Actualizar estado
      setReviews(data.reviews);
      setStats(data.stats);
      setPagination(data.pagination || null);
      setLastUpdated(new Date());

      console.log(`✅ useReviews: ${data.reviews.length} reviews cargados`, {
        stats: data.stats,
        pagination: data.pagination
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ useReviews Error:', errorMessage);
      setError(errorMessage);
      
      // En caso de error, limpiar datos
      setReviews([]);
      setStats(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Fetch inicial
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Auto-refresh opcional
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      console.log('🔄 useReviews: Auto-refresh triggered');
      fetchReviews();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchReviews]);

  // Función para refetch manual
  const refetch = useCallback(async () => {
    await fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    stats,
    loading,
    error,
    refetch,
    lastUpdated,
    pagination
  };
};

// ===================================================================
// Hook para reviews paginados (para vista completa)

export const useReviewsPaginated = (
  options: UseReviewsPaginatedOptions = {}
): UseReviewsPaginatedReturn => {
  const {
    page: initialPage = 1,
    limit = 20,
    filters = {}
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pagination, setPagination] = useState<UseReviewsReturn['pagination']>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Agregar filtros si existen
      if (filters.calificacion) {
        params.append('calificacion', filters.calificacion.toString());
      }
      if (filters.fechaDesde) {
        params.append('fechaDesde', filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        params.append('fechaHasta', filters.fechaHasta);
      }

      console.log(`🔍 useReviewsPaginated: Fetching page ${currentPage}...`);

      const response = await fetch(`/api/reviews?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Si no se puede parsear el JSON, usar el status
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error desconocido');
      }

      const data: ReviewsServiceResponse = result.data;

      setReviews(data.reviews);
      setStats(data.stats);
      setPagination(data.pagination || null);
      setLastUpdated(new Date());

      console.log(`✅ useReviewsPaginated: Page ${currentPage} loaded`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ useReviewsPaginated Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  // Fetch cuando cambian dependencias
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Funciones de navegación
  const nextPage = useCallback(() => {
    if (pagination?.hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination?.hasMore]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page > 0 && pagination && page <= Math.ceil(pagination.total / pagination.limit)) {
      setCurrentPage(page);
    }
  }, [pagination]);

  const refetch = useCallback(async () => {
    await fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    stats,
    loading,
    error,
    refetch,
    lastUpdated,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    canGoNext: pagination?.hasMore || false,
    canGoPrev: currentPage > 1,
    currentPage
  };
};

// ===================================================================
// Hook para estadísticas solamente

export const useReviewsStats = (): UseReviewsStatsReturn => {
  const [stats, setStats] = useState<ReviewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 useReviewsStats: Fetching stats...');

      const response = await fetch('/api/reviews/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      setStats(result.data);
      setLastUpdated(new Date());

      console.log('✅ useReviewsStats: Stats loaded');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ useReviewsStats Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
    lastUpdated
  };
};