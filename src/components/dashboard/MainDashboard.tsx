// src/components/dashboard/MainDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, List, Progress, Typography, Space, Tag } from 'antd';
import { 
  UserOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  CalendarOutlined 
} from '@ant-design/icons';

import { DashboardLayout } from './DashboardLayout';
import { KPICard } from './KPICard';
import { ActivityTimeline } from './ActivityTimeline';
import { VisitantesChart } from './VisitantesChart';
import { gradients } from '@/lib/theme/antd-theme';
import type { 
  DashboardStats, 
  VisitantesPorDia, 
  ZonaPopular, 
  ActividadReciente,
  ShowProximo 
} from '@/types/dashboard';

const { Text, Title } = Typography;

// Datos de ejemplo
const statsEjemplo: DashboardStats = {
  visitantesHoy: 342,
  visitantesMes: 8750,
  zonasActivas: 8,
  totalZonas: 12,
  duracionPromedio: 85,
  showsHoy: 6,
  crecimientoVisitantes: 12.5
};

const visitantesPorDiaEjemplo: VisitantesPorDia[] = [
  { fecha: '2024-03-01', visitantes: 245, dia: 'Lun' },
  { fecha: '2024-03-02', visitantes: 310, dia: 'Mar' },
  { fecha: '2024-03-03', visitantes: 180, dia: 'Mié' },
  { fecha: '2024-03-04', visitantes: 420, dia: 'Jue' },
  { fecha: '2024-03-05', visitantes: 385, dia: 'Vie' },
  { fecha: '2024-03-06', visitantes: 480, dia: 'Sáb' },
  { fecha: '2024-03-07', visitantes: 445, dia: 'Dom' },
];

const zonasPopularesEjemplo: ZonaPopular[] = [
  { id: '1', nombre: 'Historia del Acero', visitas: 156, porcentaje: 85, nivel: 1, categoria: 'Historia', duracion: 25 },
  { id: '2', nombre: 'Hornos Tradicionales', visitas: 134, porcentaje: 72, nivel: 2, categoria: 'Arte y Cultura', duracion: 30 },
  { id: '3', nombre: 'Innovación Industrial', visitas: 98, porcentaje: 53, nivel: 1, categoria: 'Tecnología', duracion: 20 },
  { id: '4', nombre: 'Sala Interactiva', visitas: 87, porcentaje: 47, nivel: 3, categoria: 'Educación', duracion: 40 },
];

const actividadesEjemplo: ActividadReciente[] = [
  {
    id: '1',
    tipo: 'visita',
    titulo: 'Nueva visita registrada',
    descripcion: 'Familia con niños inició recorrido en Zona 1',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    usuario: 'María García',
    zona: 'Historia del Acero',
    icono: 'user',
    color: 'green'
  },
  {
    id: '2',
    tipo: 'show',
    titulo: 'Show iniciado',
    descripcion: 'Demostración de forja tradicional',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    zona: 'Hornos Tradicionales',
    icono: 'play-circle',
    color: 'blue'
  },
  {
    id: '3',
    tipo: 'contenido',
    titulo: 'Contenido multimedia actualizado',
    descripcion: 'Nuevos videos en audio-guía zona 3',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    usuario: 'Admin',
    zona: 'Innovación Industrial',
    icono: 'picture',
    color: 'purple'
  },
  {
    id: '4',
    tipo: 'noticia',
    titulo: 'Nueva noticia publicada',
    descripcion: 'Exposición temporal sobre metalurgia',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    usuario: 'Editor',
    icono: 'file-text',
    color: 'orange'
  }
];

const showsProximosEjemplo: ShowProximo[] = [
  { id: '1', nombre: 'Forja en Vivo', hora: '14:30', zona: 'Hornos Tradicionales', ocupacion: 8, capacidadMaxima: 15, estado: 'programado' },
  { id: '2', nombre: 'Historia Interactiva', hora: '15:00', zona: 'Sala Principal', ocupacion: 12, capacidadMaxima: 20, estado: 'programado' },
  { id: '3', nombre: 'Taller de Metales', hora: '16:00', zona: 'Zona Educativa', ocupacion: 5, capacidadMaxima: 10, estado: 'programado' },
];

export const MainDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(statsEjemplo);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      {/* KPIs Row - CON TUS COLORES */}
      <Row gutter={[24, 24]} className="kpi-row">
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            titulo="Visitantes Hoy"
            valor={stats.visitantesHoy}
            cambio={12.5}
            icono={<UserOutlined />}// ✅ Naranja principal
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            titulo="Zonas Activas"
            valor={stats.zonasActivas}
            sufijo={`/ ${stats.totalZonas}`}
            icono={<EnvironmentOutlined />}
            color="#52c41a"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            titulo="Duración Promedio"
            valor={stats.duracionPromedio}
            sufijo=" min"
            icono={<ClockCircleOutlined />}
            color="#1677ff"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            titulo="Shows Hoy"
            valor={stats.showsHoy}
            icono={<PlayCircleOutlined />} // ✅ Gradiente naranja secundario
            loading={loading}
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <VisitantesChart
            data={visitantesPorDiaEjemplo}
            loading={loading}
          />
        </Col>
        {/* Versión mejorada de la tarjeta Zonas Más Populares */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#FF6B35' }} />
                <span>Zonas Más Populares</span>
              </Space>
            }
            className="chart-card"
            loading={loading}
            extra={
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Hoy
              </Text>
            }
          >
            <List
              dataSource={zonasPopularesEjemplo}
              renderItem={(zona, index) => {
                // Definir colores y iconos por ranking
                const getRankingStyle = (index: number) => {
                  const styles = {
                    0: { color: '#FFD700', bgColor: '#FFF9E6', icon: '🥇' }, // Oro
                    1: { color: '#C0C0C0', bgColor: '#F5F5F5', icon: '🥈' }, // Plata
                    2: { color: '#CD7F32', bgColor: '#FFF4E6', icon: '🥉' }, // Bronce
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
                    'Educación': '🎓'
                  };
                  return icons[categoria as keyof typeof icons] || '📍';
                };

                const rankStyle = getRankingStyle(index);

                return (
                  <List.Item style={{ 
                    padding: '16px 0', 
                    borderBottom: index === zonasPopularesEjemplo.length - 1 ? 'none' : '1px solid #f0f0f0'
                  }}>
                    <div style={{ width: '100%' }}>
                      {/* Header con ranking y nombre */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '12px',
                        gap: '12px'
                      }}>
                        {/* Ranking badge mejorado */}
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
                          {index + 1}
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
                          </div>
                          
                          <Text type="secondary" style={{ 
                            fontSize: '12px',
                            lineHeight: 1
                          }}>
                            {zona.categoria} • Nivel {zona.nivel}
                          </Text>
                        </div>

                        {/* Número de visitas destacado */}
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
                            visitas
                          </Text>
                        </div>
                      </div>

                      {/* Barra de progreso mejorada */}
                      <div style={{ marginBottom: '8px' }}>
                        <Progress
                          percent={zona.porcentaje}
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

                      {/* Footer con duración y porcentaje */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Space size={4}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            🕐 {zona.duracion} min
                          </Text>
                        </Space>
                        <Text style={{ 
                          fontSize: '12px',
                          color: '#FF6B35',
                          fontWeight: 500
                        }}>
                          {zona.porcentaje}% ocupación
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
            
            {/* Footer de la tarjeta */}
            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #f0f0f0',
              textAlign: 'center'
            }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Basado en visitas de hoy • Actualizado hace 5 min
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Activity and Shows Row */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <ActivityTimeline
            actividades={actividadesEjemplo}
            loading={loading}
            altura={400}
          />
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CalendarOutlined style={{ color: '#FF6B35' }} />
                <span>Próximos Shows</span>
              </Space>
            }
            className="chart-card"
            loading={loading}
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
    </DashboardLayout>
  );
};