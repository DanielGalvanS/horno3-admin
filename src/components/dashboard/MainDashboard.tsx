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
  WifiOutlined
} from '@ant-design/icons';

import { DashboardLayout } from './DashboardLayout';
import { KPICard } from './KPICard';
import { ActivityTimeline } from './ActivityTimeline';
import { VisitantesChart } from './VisitantesChart';
import { useActividades } from '@/hooks/useActividades';
import { useDashboardBasic } from '@/hooks/useDashboardBasic'; // 🔥 HOOK REAL
import type { DashboardStats,ShowProximo } from '@/types/dashboard';

const { Text, Title } = Typography;

// ✅ Solo datos de shows que no están en la BD aún (ejemplo)
const showsProximosEjemplo: ShowProximo[] = [
  { id: '1', nombre: 'Forja en Vivo', hora: '14:30', zona: 'Hornos Tradicionales', ocupacion: 8, capacidadMaxima: 15, estado: 'programado' },
  { id: '2', nombre: 'Historia Interactiva', hora: '15:00', zona: 'Sala Principal', ocupacion: 12, capacidadMaxima: 20, estado: 'programado' },
  { id: '3', nombre: 'Taller de Metales', hora: '16:00', zona: 'Zona Educativa', ocupacion: 5, capacidadMaxima: 10, estado: 'programado' },
];

export const MainDashboard: React.FC = () => {
  // 🔥 HOOKS REALES
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

  // 🎯 Datos reales o fallback - COMPLETO CON TODOS LOS CAMPOS
  const stats: DashboardStats = dashboardData?.kpis || {
    visitantesHoy: 0,
    visitantesMes: 0,           // 🆕 Faltaba
    visitantesAyer: 0,          // 🆕 Faltaba
    eventosHoy: 0,
    showsHoy: 0,
    laboratoriosHoy: 0,
    capacidadHoy: 0,            // 🆕 Faltaba - ¡Este era el problema!
    zonasActivas: 0,
    totalZonas: 12,
    duracionPromedio: 85,
    crecimientoVisitantes: 0
  };

  const visitantesPorDia = dashboardData?.visitantesPorDia?.datos || [];
  const zonasPopulares = dashboardData?.zonasPopulares || [];
  const estadisticasVisitantes = dashboardData?.visitantesPorDia?.estadisticas;
  const insightVisitantes = dashboardData?.visitantesPorDia?.insight;

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
          {/* 🔥 Botón para actualizar actividades */}
          <Button 
            icon={<ReloadOutlined />}
            onClick={refetchActividades}
            loading={loadingActividades}
            style={{ borderRadius: '8px' }}
          >
            Actualizar Actividades
          </Button>
          <Button 
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              refetchDashboard();
              refetchActividades();
            }}
            loading={loadingDashboard || loadingActividades}
            style={{ borderRadius: '8px' }}
          >
            Actualizar Todo
          </Button>
        </Space>
      }
    >
      {/* 🔥 MOSTRAR ESTADO DE CONEXIÓN CON BD */}
      {!errorDashboard && dashboardData && (
        <Alert
          message="¡Conectado a Base de Datos Real!"
          description={`Datos actualizados desde Supabase • ${lastUpdatedDashboard?.toLocaleString('es-ES')}`}
          type="success"
          showIcon
          icon={<WifiOutlined />}
          style={{ marginBottom: '24px' }}
          banner
        />
      )}

      {/* 🔥 MOSTRAR ESTADO DEL TIEMPO REAL DE ACTIVIDADES */}
      {isRealtime && (
        <Alert
          message="¡Sistema en Tiempo Real Activo!"
          description="Las actividades del museo aparecen instantáneamente"
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
          banner
        />
      )}

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

      {/* 🔥 KPIs Row - CON DATOS REALES */}
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
          <KPICard
            titulo="Eventos Hoy"
            valor={stats.eventosHoy}
            sufijo={` (${stats.showsHoy}S/${stats.laboratoriosHoy}L)`}
            icono={<PlayCircleOutlined />}
            color="#52c41a"
            loading={loadingDashboard}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            titulo="Capacidad Hoy"
            valor={stats.capacidadHoy}
            sufijo=" personas"
            icono={<ClockCircleOutlined />}
            color="#1677ff"
            loading={loadingDashboard}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            titulo="Zonas Activas"
            valor={stats.zonasActivas}
            sufijo={`/ ${stats.totalZonas || 12}`}
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
        
        {/* 🔥 Zonas Más Populares - CON DATOS REALES */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#FF6B35' }} />
                <span>Zonas Más Populares</span>
                {!loadingDashboard && zonasPopulares.length > 0 && (
                  <Tag color="green" style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 6px' }}>
                    REAL DATA
                  </Tag>
                )}
              </Space>
            }
            className="chart-card"
            loading={loadingDashboard}
            extra={
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {zonasPopulares.length > 0 ? 'Datos Reales' : 'Sin datos'}
              </Text>
            }
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
                  // Colores y iconos por ranking
                  const getRankingStyle = (index: number) => {
                    const styles = {
                      0: { color: '#FFD700', bgColor: '#FFF9E6', icon: '🥇' },
                      1: { color: '#C0C0C0', bgColor: '#F5F5F5', icon: '🥈' },
                      2: { color: '#CD7F32', bgColor: '#FFF4E6', icon: '🥉' },
                      default: { color: '#8C8C8C', bgColor: '#FAFAFA', icon: '🏆' }
                    };
                    return styles[index as keyof typeof styles] || styles.default;
                  };

                  // Iconos por categoría
                  const getCategoryIcon = (categoria: string) => {
                    const icons = {
                      'Historia': '📚',
                      'Arte y Cultura': '🎨', 
                      'Tecnología': '⚙️',
                      'Educación': '🎓',
                      'General': '📍'
                    };
                    return icons[categoria as keyof typeof icons] || '📍';
                  };

                  const rankStyle = getRankingStyle(index);

                  return (
                    <List.Item style={{ 
                      padding: '16px 0', 
                      borderBottom: index === zonasPopulares.length - 1 ? 'none' : '1px solid #f0f0f0'
                    }}>
                      <div style={{ width: '100%' }}>
                        {/* Header con ranking y nombre */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          marginBottom: '12px',
                          gap: '12px'
                        }}>
                          {/* Ranking badge */}
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

                          {/* Información de la zona */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '4px'
                            }}>
                              <span style={{ fontSize: '14px' }}>
                                {getCategoryIcon(zona.categoria)}
                              </span>
                              <Text strong style={{ 
                                fontSize: '14px',
                                color: '#262626',
                                lineHeight: 1
                              }}>
                                {zona.nombre}
                              </Text>
                              {zona.clasificacion && (
                                <Tag color="blue" style={{ marginLeft: '4px', fontSize: '10px', padding: '1px 4px' }}>
                                  {zona.clasificacion.split(' ')[0]}
                                </Tag>
                              )}
                            </div>
                            
                            <Text type="secondary" style={{ 
                              fontSize: '12px',
                              lineHeight: 1
                            }}>
                              {zona.categoria} • Nivel {zona.nivel} • {zona.shows || 0}S/{zona.laboratorios || 0}L
                            </Text>
                          </div>

                          {/* Número de visitas/eventos */}
                          <div style={{ 
                            textAlign: 'right',
                            flexShrink: 0
                          }}>
                            <Text style={{ 
                              fontSize: '16px', 
                              color: '#FF6B35', 
                              fontWeight: 600,
                              lineHeight: 1,
                              display: 'block'
                            }}>
                              {zona.visitas}
                            </Text>
                            <Text type="secondary" style={{ 
                              fontSize: '11px',
                              lineHeight: 1
                            }}>
                              eventos
                            </Text>
                          </div>
                        </div>

                        {/* Barra de progreso con score */}
                        <div style={{ marginBottom: '8px' }}>
                          <Progress
                            percent={Math.min(100, zona.porcentaje)}
                            size="small"
                            strokeColor={{
                              '0%': '#FF6B35',
                              '100%': '#FF8A65',
                            }}
                            trailColor="#f5f5f5"
                            strokeWidth={6}
                            showInfo={false}
                            className="zone-progress"
                          />
                        </div>

                        {/* Footer con duración y score */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Space size={4}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              🕐 {zona.duracion} min
                            </Text>
                            {zona.actividad && (
                              <Tag color={
                                zona.actividad === 'alta' ? 'red' :
                                zona.actividad === 'media' ? 'orange' : 'green'
                              } style={{ fontSize: '10px', padding: '1px 4px' }}>
                                {zona.actividad}
                              </Tag>
                            )}
                          </Space>
                          <Text style={{ 
                            fontSize: '12px',
                            color: '#FF6B35',
                            fontWeight: 500
                          }}>
                            Score: {zona.porcentaje}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                  );
                }}
              />
            )}
            
            {/* Footer de la tarjeta */}
            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #f0f0f0',
              textAlign: 'center'
            }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {zonasPopulares.length > 0 
                  ? `Basado en preferencias reales • ${lastUpdatedDashboard?.toLocaleTimeString('es-ES')}`
                  : 'Esperando datos de zonas con eventos'
                }
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 🔥 Activity and Shows Row - ACTIVIDADES CON TIEMPO REAL */}
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
          {/* ✅ Próximos Shows - EJEMPLO (hasta tener vista real) */}
          <Card 
            title={
              <Space>
                <CalendarOutlined style={{ color: '#FF6B35' }} />
                <span>Próximos Shows</span>
                <Tag color="orange">EJEMPLO</Tag>
              </Space>
            }
            className="chart-card"
            loading={false}
          >
            <List
              dataSource={showsProximosEjemplo}
              renderItem={(show) => (
                <List.Item style={{ padding: '16px 0' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '8px' 
                    }}>
                      <div>
                        <Title level={5} style={{ margin: 0, fontSize: '16px' }}>
                          {show.nombre}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          {show.zona}
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: '16px', color: '#FF6B35' }}>
                          {show.hora}
                        </Text>
                        <br />
                        <Tag color="blue" style={{ margin: 0 }}>
                          {show.estado}
                        </Tag>
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <Text style={{ fontSize: '13px' }}>
                        Ocupación: {show.ocupacion}/{show.capacidadMaxima}
                      </Text>
                      <Progress
                        percent={(show.ocupacion / show.capacidadMaxima) * 100}
                        size="small"
                        style={{ width: '100px' }}
                        strokeColor="#52c41a"
                      />
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 🆕 FOOTER CON INFORMACIÓN DETALLADA */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#fafafa',
        borderRadius: '8px',
        textAlign: 'center',
        border: '1px solid #f0f0f0'
      }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              📊 <strong>Dashboard:</strong> {lastUpdatedDashboard?.toLocaleString('es-ES') || 'Cargando...'} 
              {errorDashboard ? ' (Error)' : ' (Conectado)'}
            </Text>
          </Col>
          <Col span={8}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              🔥 <strong>Actividades:</strong> {isRealtime ? 'Tiempo Real Activo' : 'Modo Histórico'} • 
              Total: {totalActividades}
            </Text>
          </Col>
          <Col span={8}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              💾 <strong>Fuente:</strong> Supabase PostgreSQL • 
              Zonas: {zonasPopulares.length} con eventos
            </Text>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};