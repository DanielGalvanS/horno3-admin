// src/components/dashboard/ActivityTimeline.tsx - TIEMPO REAL COMPLETO 🔥

'use client';

import React from 'react';
import { 
  Card, 
  Timeline, 
  Typography, 
  Space, 
  Tag, 
  Avatar, 
  Empty, 
  Badge, 
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  PlayCircleOutlined, 
  FileTextOutlined, 
  PictureOutlined,
  ClockCircleOutlined,
  WifiOutlined,
  DisconnectOutlined,
  EnvironmentOutlined,
  RocketOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  TeamOutlined,
  ExperimentOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { ActividadReciente } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const { Text, Title } = Typography;

interface ActivityTimelineProps {
  actividades: ActividadReciente[];
  loading?: boolean;
  altura?: number;
  // 🆕 Props para tiempo real
  isRealtime?: boolean;
  lastUpdated?: Date | null;
  totalActividades?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  actividades,
  loading = false,
  altura = 400,
  isRealtime = false,
  lastUpdated,
  totalActividades
}) => {
  
  // 🎨 Iconos mejorados (compatibles + nuevos)
  const getIcon = (icono?: string, tipo?: ActividadReciente['tipo']) => {
    // Si tiene icono específico del sistema nuevo
    if (icono) {
      const iconMap: Record<string, React.ReactNode> = {
        'user': <UserOutlined />,
        'play-circle': <PlayCircleOutlined />,
        'file-text': <FileTextOutlined />,
        'picture': <PictureOutlined />,
        'clock-circle': <ClockCircleOutlined />,
        'environment': <EnvironmentOutlined />,
        'rocket': <RocketOutlined />,
        'edit': <EditOutlined />,
        'delete': <DeleteOutlined />,
        'stop': <StopOutlined />,
        'team': <TeamOutlined />,
        'experiment': <ExperimentOutlined />,
        'info-circle': <InfoCircleOutlined />,
        'play': <PlayCircleOutlined />,
        'news': <FileTextOutlined />
      };
      
      if (iconMap[icono]) return iconMap[icono];
    }
    
    // Fallback a iconos por tipo (tu sistema original)
    const iconMapTipo = {
      visita: <UserOutlined />,
      show: <PlayCircleOutlined />,
      noticia: <FileTextOutlined />,
      contenido: <PictureOutlined />,
    };
    return iconMapTipo[tipo as keyof typeof iconMapTipo] || <ClockCircleOutlined />;
  };

  // 🎨 Colores (tu sistema + mejoras)
  const getColorByTipo = (color?: string, tipo?: ActividadReciente['tipo']) => {
    // Si tiene color específico
    if (color) {
      const colorMap = {
        'green': '#52c41a',
        'blue': '#1677ff',
        'orange': '#fa8c16',
        'purple': '#722ed1'
      };
      
      if (colorMap[color as keyof typeof colorMap]) {
        return colorMap[color as keyof typeof colorMap];
      }
    }
    
    // Fallback a tu sistema original
    const colorMapTipo = {
      visita: '#52c41a',
      show: '#1677ff', 
      noticia: '#faad14',
      contenido: '#722ed1',
    };
    return colorMapTipo[tipo as keyof typeof colorMapTipo] || '#8c8c8c';
  };

  const getTagColor = (tipo: ActividadReciente['tipo']) => {
    const tagColorMap = {
      visita: 'green',
      show: 'blue',
      noticia: 'orange', 
      contenido: 'purple',
    };
    return tagColorMap[tipo] || 'default';
  };

  // 🏷️ Tag de prioridad (nuevo)
  const getPrioridadTag = (prioridad?: string) => {
    if (!prioridad) return null;
    
    const prioridadConfig: Record<string, { color: string; text: string }> = {
      'critica': { color: 'red', text: 'CRÍTICA' },
      'alta': { color: 'orange', text: 'ALTA' },
      'media': { color: 'blue', text: 'MEDIA' },
      'baja': { color: 'green', text: 'BAJA' }
    };
    
    const config = prioridadConfig[prioridad];
    if (!config) return null;
    
    return (
      <Tag 
        color={config.color} 
        style={{ 
          margin: 0,
          fontSize: '10px',
          fontWeight: 500
        }}
      >
        {config.text}
      </Tag>
    );
  };

  // ⏰ Formatear tiempo (mejorado)
  const formatearTiempo = (actividad: ActividadReciente) => {
    // Usar tiempo calculado del sistema nuevo si está disponible
    if (actividad.tiempoTranscurrido) {
      return actividad.tiempoTranscurrido;
    }
    
    // Fallback a date-fns (tu sistema original)
    try {
      return formatDistanceToNow(new Date(actividad.timestamp), { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'Hace un momento';
    }
  };

  // 🆕 Detectar si es reciente
  const esActividadReciente = (actividad: ActividadReciente) => {
    // Usar campo del sistema nuevo si está disponible
    if (actividad.esReciente !== undefined) {
      return actividad.esReciente;
    }
    
    // Calcular manualmente
    try {
      const fecha = new Date(actividad.timestamp);
      const ahora = new Date();
      return (ahora.getTime() - fecha.getTime()) < 30000; // 30 segundos
    } catch {
      return false;
    }
  };

  // 🎯 Componente vacío
  if (actividades.length === 0) {
    return (
      <Card 
        title={
          <Space>
            <span>Actividad Reciente</span>
            <RealtimeIndicator isRealtime={isRealtime} />
          </Space>
        } 
        className="activity-card"
        extra={
          totalActividades !== undefined && (
            <Text style={{ fontSize: '12px', color: '#8B4513', fontWeight: 500 }}>
              {totalActividades} total
            </Text>
          )
        }
      >
        <Empty 
          description="No hay actividad reciente"
          style={{ margin: '60px 0' }}
        />
      </Card>
    );
  }

  // 🔥 Timeline items con todas las mejoras
  const timelineItems = actividades.map((actividad) => {
    const esReciente = esActividadReciente(actividad);
    const colorActividad = getColorByTipo(actividad.color, actividad.tipo);
    
    return {
      dot: (
        <Tooltip title={`${actividad.tipo} - ${actividad.prioridad || 'media'} prioridad`}>
          <Badge dot={esReciente} offset={[-2, 2]}>
            <Avatar
              size="small"
              style={{ 
                backgroundColor: colorActividad,
                border: '2px solid white',
                boxShadow: esReciente 
                  ? `0 0 12px ${colorActividad}60` 
                  : '0 2px 8px rgba(0,0,0,0.15)',
                animation: esReciente ? 'pulse 2s infinite' : 'none',
                transition: 'all 0.3s ease'
              }}
              icon={getIcon(actividad.icono, actividad.tipo)}
            />
          </Badge>
        </Tooltip>
      ),
      children: (
        <Card 
          size="small" 
          className={`timeline-card ${esReciente ? 'timeline-card-new' : ''}`}
          style={{ 
            marginLeft: '8px',
            borderLeft: `3px solid ${colorActividad}`,
            borderRadius: '8px',
            backgroundColor: esReciente ? '#f6ffed' : 'white',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          bodyStyle={{ padding: '12px 16px' }}
          hoverable
        >
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            {/* Header con tipo, prioridad y tiempo */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '4px'
            }}>
              <Space size={4} wrap>
                <Tag 
                  color={getTagColor(actividad.tipo)}
                  style={{ 
                    margin: 0,
                    borderRadius: '4px',
                    fontWeight: 500,
                    fontSize: '11px'
                  }}
                >
                  {actividad.tipo.toUpperCase()}
                </Tag>
                
                {getPrioridadTag(actividad.prioridad)}
                
                {esReciente && (
                  <Tag 
                    color="green" 
                    style={{ 
                      margin: 0,
                      fontSize: '10px',
                      animation: 'fadeIn 0.5s ease-in'
                    }}
                  >
                     NUEVO
                  </Tag>
                )}
              </Space>
              
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '11px',
                  fontWeight: 400,
                  color: esReciente ? '#52c41a' : '#8c8c8c',
                  whiteSpace: 'nowrap'
                }}
              >
                {formatearTiempo(actividad)}
              </Text>
            </div>

            {/* Título principal */}
            <Title 
              level={5} 
              style={{ 
                margin: 0, 
                fontSize: '14px',
                fontWeight: 600,
                color: esReciente ? '#1890ff' : '#262626',
                lineHeight: '1.3'
              }}
            >
              {actividad.titulo}
            </Title>

            {/* Descripción */}
            <Text 
              style={{ 
                fontSize: '13px', 
                color: '#595959',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {actividad.descripcion}
            </Text>

            {/* Info adicional */}
            {(actividad.usuario || actividad.zona || actividad.categoria) && (
              <Space size={12} style={{ marginTop: '4px' }} wrap>
                {actividad.usuario && (
                  <Space size={4}>
                    <UserOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {actividad.usuario}
                    </Text>
                  </Space>
                )}
                {actividad.zona && (
                  <Space size={4}>
                    <EnvironmentOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {actividad.zona}
                    </Text>
                  </Space>
                )}
                {actividad.categoria && actividad.categoria !== actividad.tipo && (
                  <Space size={4}>
                    <InfoCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                    <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                      {actividad.categoria}
                    </Text>
                  </Space>
                )}
              </Space>
            )}
          </Space>
        </Card>
      ),
    };
  });

  return (
    <Card 
      title={
        <Space>
          <span>Actividad Reciente</span>
          <RealtimeIndicator isRealtime={isRealtime} />
        </Space>
      }
      className="activity-card"
      extra={
        <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: '12px', color: '#8B4513', fontWeight: 500 }}>
            {totalActividades !== undefined 
              ? `${actividades.length} de ${totalActividades}`
              : `Últimas ${actividades.length} actividades`
            }
          </Text>
          {lastUpdated && (
            <Text style={{ fontSize: '10px', color: '#999' }}>
              {lastUpdated.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
        </Space>
      }
      loading={loading}
    >
      <div 
        className="custom-scrollbar"
        style={{ 
          height: altura, 
          overflowY: 'auto',
          paddingRight: '8px'
        }}
      >
        <Timeline
          mode="left"
          items={timelineItems}
          style={{ paddingTop: '16px' }}
        />
        
        {/* Footer informativo */}
        {actividades.length > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#fafafa',
            borderRadius: '6px',
            textAlign: 'center',
            border: '1px solid #f0f0f0'
          }}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              {isRealtime ? (
                <>⚡ <strong>Tiempo real activo</strong> - Las actividades aparecen instantáneamente</>
              ) : (
                <>📊 <strong>Modo histórico</strong> - Mostrando actividades guardadas</>
              )}
            </Text>
          </div>
        )}
      </div>

      {/* 🎨 Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(82, 196, 26, 0); }
          100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .timeline-card-new {
          animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        
        .timeline-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </Card>
  );
};

// 🔥 Indicador de tiempo real
const RealtimeIndicator: React.FC<{ isRealtime: boolean }> = ({ isRealtime }) => (
  <Tooltip title={isRealtime ? 'Conectado en tiempo real' : 'Modo histórico'}>
    <Space size={4}>
      {isRealtime ? (
        <>
          <WifiOutlined 
            style={{ 
              color: '#52c41a', 
              fontSize: '12px',
              animation: 'pulse 2s infinite'
            }} 
          />
          <Text style={{ fontSize: '11px', color: '#52c41a', fontWeight: 600 }}>
            EN VIVO
          </Text>
        </>
      ) : (
        <>
          <DisconnectOutlined style={{ color: '#faad14', fontSize: '12px' }} />
          <Text style={{ fontSize: '11px', color: '#faad14', fontWeight: 500 }}>
            HISTÓRICO
          </Text>
        </>
      )}
    </Space>
  </Tooltip>
);