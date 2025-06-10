// src/components/dashboard/MainDashboard.tsx - CON DATOS REALES 🚀
'use client';

import React from 'react';
import { Row, Col, Card, List, Progress, Typography, Space, Tag, Alert, Button } from 'antd';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  WifiOutlined,
  BookOutlined,
  BgColorsOutlined,
  SettingOutlined,
  ReadOutlined,
  ExperimentOutlined,
  PictureOutlined,
  MessageOutlined,  // 🆕 AGREGADO
  StarOutlined      // 🆕 AGREGADO
} from '@ant-design/icons';

import { DashboardLayout } from './DashboardLayout';
import { KPICard } from './KPICard';
import { ActivityTimeline } from './ActivityTimeline';
import { VisitantesChart } from './VisitantesChart';
import { ReviewsCard } from './ReviewsCard';  // 🆕 AGREGADO
import { useActividades } from '@/hooks/useActividades';
import { useDashboardBasic } from '@/hooks/useDashboardBasic';
import { useReviews } from '@/hooks/useReviews';  // 🆕 AGREGADO
import type { DashboardStats,ShowProximo } from '@/types/dashboard';

const { Text, Title } = Typography;

export const MainDashboard: React.FC = () => {
  // 🔥 HOOKS EXISTENTES
  const {
    data: dashboardData,
    loading: loadingDashboard,
    error: errorDashboard,
    refetch: refetchDashboard,
    lastUpdated: lastUpdatedDashboard
  } = useDashboardBasic();

  const {
    actividades,
    loading: loadingActividades,
    error: errorActividades,
    refetch: refetchActividades,
    lastUpdated,
    isRealtime,
    totalActividades
  } = useActividades(12);

  // 🆕 NUEVO HOOK PARA REVIEWS
  const {
    reviews,
    stats: reviewsStats,
    loading: loadingReviews,
    error: errorReviews,
    refetch: refetchReviews,
    lastUpdated: lastUpdatedReviews,
    pagination
  } = useReviews({
    limit: 8,
    autoRefresh: false,
    refreshInterval: 60000
  });

  // 🎯 Datos reales o fallback - COMPLETO CON TODOS LOS CAMPOS
  const stats: DashboardStats = dashboardData?.kpis || {
    visitantesHoy: 0,
    visitantesMes: 0,
    visitantesAyer: 0,
    eventosHoy: 0,
    showsHoy: 0,
    laboratoriosHoy: 0,
    capacidadHoy: 0,
    zonasActivas: 0,
    totalZonas: 0,
    duracionPromedio: 85,
    crecimientoVisitantes: 0
  };

  const visitantesPorDia = dashboardData?.visitantesPorDia?.datos || [];
  const zonasPopulares = dashboardData?.zonasPopulares || [];
  const estadisticasVisitantes = dashboardData?.visitantesPorDia?.estadisticas;
  const insightVisitantes = dashboardData?.visitantesPorDia?.insight;

  // 🆕 HANDLERS PARA REVIEWS
  const handleViewAllReviews = () => {
    // Aquí puedes navegar a tu página de reviews completa
    // router.push('/admin/reviews');
    console.log('🔗 Ver todos los reviews');
  };

  const handleViewReview = (reviewId: string) => {
    // Aquí puedes navegar a un review específico
    // router.push(`/admin/reviews/${reviewId}`);
    console.log(`🔍 Ver review: ${reviewId}`);
  };

  // 🆕 HANDLER MODIFICADO PARA ACTUALIZAR TODO
  const handleRefreshAll = async () => {
    console.log('🔄 Actualizando todo el dashboard...');
    
    try {
      await Promise.all([
        refetchDashboard(),
        refetchActividades(),
        refetchReviews()  // 🆕 AGREGADO
      ]);
      
      console.log('✅ Dashboard completamente actualizado');
    } catch (error) {
      console.error('❌ Error actualizando dashboard:', error);
    }
  };

  return (
    <DashboardLayout
      acciones={
        <Space size="middle">
          {/* 🔥 Botón para actualizar dashboard completo */}
          <Button 
            icon={<DatabaseOutlined />}
            onClick={refetchDashboard}
            loading={loadingDashboard}
            style={{ borderRadius: '8px' }}
          >
            Actualizar Dashboard
          </Button>
          {/* 🆕 NUEVO BOTÓN PARA REVIEWS */}
          <Button 
            icon={<MessageOutlined />}
            onClick={refetchReviews}
            loading={loadingReviews}
            style={{ borderRadius: '8px' }}
          >
            Actualizar Reviews
          </Button>
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefreshAll}  // 🆕 MODIFICADO para incluir reviews
            loading={loadingDashboard || loadingActividades || loadingReviews}  // 🆕 MODIFICADO
            style={{ borderRadius: '8px' }}
          >
            Actualizar Todo
          </Button>
        </Space>
      }
    >
     

      {/* ⚠️ MOSTRAR ERRORES */}
      {errorDashboard && (
        <Alert
          message="Error de Conexión a Dashboard"
          description={`${errorDashboard} - Mostrando datos básicos`}
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
          closable
        />
      )}

      {errorActividades && (
        <Alert
          message="Error de Actividades"
          description={`${errorActividades} - Timeline en modo ejemplo`}
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
          closable
        />
      )}

      {/* 🆕 ERROR DE REVIEWS */}
      {errorReviews && (
        <Alert
          message="Error de Reviews API"
          description={`${errorReviews} - Reviews no disponibles temporalmente`}
          type="warning"
          showIcon
          style={{ marginBottom: '24px' }}
          closable
        />
      )}

      {/* 🔥 KPIs Row - CON DATOS REALES Y REVIEWS */}
      <Row gutter={[24, 24]} className="kpi-row">
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            titulo="Visitantes Hoy"
            valor={stats.visitantesHoy}
            cambio={stats.crecimientoVisitantes}
            icono={<UserOutlined />}
            loading={loadingDashboard}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {/* 🆕 MODIFICADO: Reemplazar "Eventos Hoy" con "Reviews Total" */}
          <KPICard
            titulo="Reviews Total"
            valor={reviewsStats?.total || 0}
            cambio={reviewsStats?.trends.percentageChange}
            icono={<MessageOutlined />}
            color="#1677ff"
            loading={loadingReviews}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          {/* 🆕 MODIFICADO: Reemplazar "Capacidad Hoy" con "Rating Promedio" */}
          <KPICard
            titulo="Rating Promedio"
            valor={reviewsStats?.avgRating || 0}
            sufijo="⭐"
            icono={<StarOutlined />}
            color="#faad14"
            loading={loadingReviews}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            titulo="Zonas Activas"
            valor={stats.zonasActivas}
            sufijo={`/ ${stats.totalZonas}`}
            icono={<EnvironmentOutlined />}
            loading={loadingDashboard}
          />
        </Col>
      </Row>

      {/* 🔥 Charts Row - CON DATOS REALES */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <VisitantesChart
            data={visitantesPorDia}
            loading={loadingDashboard}
            // 🔥 Props adicionales con datos reales
            estadisticas={estadisticasVisitantes}
            insight={insightVisitantes}
          />
        </Col>
        
        {/* 🔥 Zonas Más Populares - LAYOUT MEJORADO (MANTENIDO IGUAL) */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#FF6B35' }} />
                <span>Zonas Más Populares</span>
              </Space>
            }
            className="chart-card"
            loading={loadingDashboard}
          >
            {zonasPopulares.length === 0 && !loadingDashboard ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#999'
              }}>
                <EnvironmentOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>No hay zonas con eventos activos</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Agrega eventos a las zonas para ver el ranking
                </div>
              </div>
            ) : (
              <List
                dataSource={zonasPopulares}
                renderItem={(zona, index) => {
                  // Colores por ranking
                  const getRankingStyle = (index: number) => {
                    const styles = {
                      0: { color: '#FFD700', bgColor: '#FFF9E6' },
                      1: { color: '#C0C0C0', bgColor: '#F5F5F5' },
                      2: { color: '#CD7F32', bgColor: '#FFF4E6'},
                      default: { color: '#8C8C8C', bgColor: '#FAFAFA' }
                    };
                    return styles[index as keyof typeof styles] || styles.default;
                  };

                  // Iconos por categoría con Ant Design
                  const getCategoryIcon = (categoria: string) => {
                    const iconProps = { style: { fontSize: '16px', color: '#666' } };
                    
                    const icons: { [key: string]: React.ReactNode } = {
                      'Historia': <PictureOutlined {...iconProps} />,
                      'Arte y Cultura': <BgColorsOutlined {...iconProps} />, 
                      'Tecnología': <SettingOutlined {...iconProps} />,
                      'Educación': <ReadOutlined {...iconProps} />,
                      'Ciencias Naturales': <ExperimentOutlined {...iconProps} />,
                      'Arqueología': <ExperimentOutlined {...iconProps} />,
                      'General': <EnvironmentOutlined {...iconProps} />
                    };
                    
                    return icons[categoria] || <EnvironmentOutlined {...iconProps} />;
                  };

                  const rankStyle = getRankingStyle(index);

                  return (
                    <List.Item 
                      style={{ 
                        padding: '20px 0', 
                        borderBottom: index === zonasPopulares.length - 1 ? 'none' : '1px solid #f0f0f0'
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        {/* 🎯 HEADER: Ranking + Título + Score */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '16px'
                        }}>
                          {/* Left: Ranking Badge + Info */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                            {/* Ranking Badge */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: rankStyle.bgColor,
                              border: `2px solid ${rankStyle.color}`,
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: rankStyle.color,
                              flexShrink: 0
                            }}>
                              {zona.ranking}
                            </div>

                            {/* Zone Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              {/* Title Row */}
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '6px'
                              }}>
                                {getCategoryIcon(zona.categoria)}
                                <Text strong style={{ 
                                  fontSize: '15px',
                                  color: '#262626',
                                  lineHeight: 1.2,
                                  wordBreak: 'break-word'
                                }}>
                                  {zona.nombre}
                                </Text>
                              </div>
                              
                              {/* Subtitle Row */}
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  {zona.categoria}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  •
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Nivel {zona.nivel}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '12px' }}>

                                </Text>
                                
                              </div>
                                
                                {zona.clasificacion && (
                                  
                                    <>
                                    <div style={{ marginTop: '8px' }}>
                                      <Tag 
                                        color="blue" 
                                        style={{ 
                                          fontSize: '10px', 
                                          padding: '2px 6px',
                                          lineHeight: '16px',
                                          borderRadius: '8px'
                                        }}
                                      >
                                        {zona.clasificacion}
                                      </Tag>
                                      </div>
                                    </>
                                  )}
                                
                            </div>
                          </div>

                          {/* Right: Events Count */}
                          <div style={{ 
                            textAlign: 'center',
                            minWidth: '60px',
                            flexShrink: 0
                          }}>
                            <div style={{ 
                              fontSize: '20px', 
                              color: '#FF6B35', 
                              fontWeight: 700,
                              lineHeight: 1,
                              marginBottom: '2px'
                            }}>
                              {zona.visitas}
                            </div>
                            <Text type="secondary" style={{ 
                              fontSize: '11px',
                              lineHeight: 1,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              eventos
                            </Text>
                          </div>
                        </div>

                        {/* 📊 PROGRESS BAR */}
                        <div style={{ marginBottom: '14px' }}>
                          <Progress
                            percent={Math.min(100, zona.porcentaje)}
                            size="small"
                            strokeColor={{
                              '0%': '#FF6B35',
                              '100%': '#FF8A65',
                            }}
                            trailColor="#f5f5f5"
                            strokeWidth={8}
                            showInfo={false}
                            style={{ marginBottom: '4px' }}
                          />
                        </div>

                        {/* 🏷️ FOOTER: Duration + Activity + Score */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          {/* Left: Duration + Activity Tag */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              <ClockCircleOutlined style={{ fontSize: '12px' }} />
                              <span>{zona.duracion} min</span>
                            </div>
                            
                            {zona.actividad && (
                              <Tag 
                                color={
                                  zona.actividad === 'alta' ? 'red' :
                                  zona.actividad === 'media' ? 'orange' : 'green'
                                } 
                                style={{ 
                                  fontSize: '10px', 
                                  padding: '2px 6px',
                                  lineHeight: '16px',
                                  borderRadius: '6px',
                                  textTransform: 'capitalize'
                                }}
                              >
                                {zona.actividad}
                              </Tag>
                            )}
                          </div>

                          {/* Right: Score */}
                          <div style={{ 
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #f0f0f0',
                          }}>
                            Score: {Math.round(zona.porcentaje)}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
                split={false}
              />
            )}
            
          </Card>
        </Col>
      </Row>

      {/* 🔥 Activity and Reviews Row - ACTIVIDADES CON TIEMPO REAL Y REVIEWS */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <ActivityTimeline
            actividades={actividades}
            loading={loadingActividades}
            altura={500}
            isRealtime={isRealtime}
            lastUpdated={lastUpdated}
            totalActividades={totalActividades}
          />
        </Col>
        <Col xs={24} lg={12}>
          {/* 🚀 NUEVO COMPONENTE DE REVIEWS - REEMPLAZA LOS SHOWS */}
          <ReviewsCard
            reviews={reviews}
            loading={loadingReviews}
            onViewAll={handleViewAllReviews}
            onViewReview={handleViewReview}
          />
        </Col>
      </Row>

      {/* 🆕 SECCIÓN DE DEBUG (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Alert
              message="🛠️ Debug Info - Reviews (Solo en Desarrollo)"
              description={
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  <div><strong>Reviews:</strong> {reviews.length} cargados de {reviewsStats?.total || 0} total</div>
                  <div><strong>Paginación:</strong> {pagination ? `Página ${pagination.page}/${Math.ceil(pagination.total / pagination.limit)}` : 'N/A'}</div>
                  <div><strong>Last Update:</strong> {lastUpdatedReviews?.toISOString()}</div>
                  <div><strong>API Status:</strong> {errorReviews ? '❌ Error' : '✅ OK'}</div>
                  <div><strong>Rating Promedio:</strong> {reviewsStats?.avgRating || 0}</div>
                  <div><strong>Distribución:</strong> 5⭐({reviewsStats?.distribution[5] || 0}) 4⭐({reviewsStats?.distribution[4] || 0}) 3⭐({reviewsStats?.distribution[3] || 0}) 2⭐({reviewsStats?.distribution[2] || 0}) 1⭐({reviewsStats?.distribution[1] || 0})</div>
                </div>
              }
              type="info"
              showIcon={false}
              style={{ background: '#f6f6f6', border: '1px dashed #d9d9d9' }}
            />
          </Col>
        </Row>
      )}
      
    </DashboardLayout>
  );
};