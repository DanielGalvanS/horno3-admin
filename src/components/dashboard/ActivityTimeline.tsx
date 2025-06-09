// src/components/dashboard/ActivityTimeline.tsx - VERSIÓN CON TABLA NUEVA 🚀
'use client';

import React from 'react';
import { Card, Timeline, Typography, Space, Tag, Avatar, Empty, Badge, Tooltip } from 'antd';
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

const { Text, Title } = Typography;

interface ActivityTimelineProps {
  actividades: ActividadReciente[];
  loading?: boolean;
  altura?: number;
  isRealtime?: boolean;
  lastUpdated?: Date | null;
  totalActividades?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  actividades,
  loading = false,
  altura = 450,
  isRealtime = false,
  lastUpdated,
  totalActividades = 0
}) => {
  
  // 🎨 Mapeo de iconos mejorado
  const getIcon = (icono: string, tipo: ActividadReciente['tipo']) => {
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
      'disconnect': <DisconnectOutlined />
    };
    
    return iconMap[icono] || iconMap[getDefaultIcon(tipo)];
  };

  const getDefaultIcon = (tipo: ActividadReciente['tipo']) => {
    const defaultIcons = {
      visita: 'user',
      show: 'play-circle',
      noticia: 'file-text',
      contenido: 'picture'
    };
    return defaultIcons[tipo] || 'info-circle';
  };

  // 🎨 Colores por prioridad y tipo
  const getColorByPrioridad = (prioridad?: string, colorOriginal?: string) => {
    if (prioridad) {
      const colorMap = {
        'critica': '#ff4d4f',
        'alta': '#fa8c16', 
        'media': '#1677ff',
        'baja': '#52c41a'
      };
      return colorMap[prioridad as keyof typeof colorMap] || '#1677ff';
    }
    
    // Fallback a colores originales
    const colorMap = {
      'green': '#52c41a',
      'blue': '#1677ff',
      'orange': '#fa8c16',
      'purple': '#722ed1'
    };
    return colorMap[colorOriginal as keyof typeof colorMap] || '#1677ff';
  };

  // 🏷️ Color del tag por tipo
  const getTagColor = (tipo: ActividadReciente['tipo']) => {
    const tagColorMap = {
      'visita': 'green',
      'show': 'blue',
      'noticia': 'orange', 
      'contenido': 'purple'
    };
    return tagColorMap[tipo] || 'default';
  };

  // 🏷️ Color del tag por prioridad
  const getPrioridadTag = (prioridad?: string) => {
    if (!prioridad) return null;
    
    const prioridadConfig = {
      'critica': { color: 'red', text: '🚨 CRÍTICA' },
      'alta': { color: 'orange', text: '⚠️ ALTA' },
      'media': { color: 'blue', text: 'ℹ️ MEDIA' },
      'baja': { color: 'green', text: '💡 BAJA' }
    };
    
    const config = prioridadConfig[prioridad as keyof typeof prioridadConfig];
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

  // ⏰ Formatear tiempo con mejor lógica
  const formatearTiempo = (actividad: ActividadReciente) => {
    // Usar el tiempo calculado por la vista de BD si está disponible
    if (actividad.tiempoTranscurrido) {
      return actividad.tiempoTranscurrido;
    }
    
    // Fallback al cálculo manual
    try {
      const fecha = new Date(actividad.timestamp);
      const ahora = new Date();
      const diferencia = ahora.getTime() - fecha.getTime();
      
      if (diferencia < 30000) {
        return 'Ahora mismo';
      } else if (diferencia < 60000) {
        return 'Hace menos de 1 min';
      } else if (diferencia < 3600000) {
        const minutos = Math.floor(diferencia / 60000);
        return `Hace ${minutos} min`;
      } else if (diferencia < 86400000) {
        const horas = Math.floor(diferencia / 3600000);
        return `Hace ${horas} h`;
      } else {
        return fecha.toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return 'Hace un momento';
    }
  };

  // 🆕 Detectar si es muy reciente
  const esActividadReciente = (actividad: ActividadReciente) => {
    // Usar el campo calculado de la BD si está disponible
    if (actividad.esReciente !== undefined) {
      return actividad.esReciente;
    }
    
    // Fallback al cálculo manual
    try {
      const fecha = new Date(actividad.timestamp);
      const ahora = new Date();
      return (ahora.getTime() - fecha.getTime()) < 30000; // 30 segundos
    } catch {
      return false;
    }
  };

  if (actividades.length === 0 && !loading) {
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
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {totalActividades} total
          </Text>
        }
      >
        <Empty 
          description="No hay actividad reciente"
          style={{ margin: '60px 0' }}
        />
      </Card>
    );
  }

  const timelineItems = actividades.map((actividad) => {
    const esReciente = esActividadReciente(actividad);
    const colorActividad = getColorByPrioridad(actividad.prioridad, actividad.color);
    
    return {
      dot: (
        <Tooltip title={`${actividad.categoria || actividad.tipo} - ${actividad.prioridad || 'media'} prioridad`}>
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
              icon={getIcon(actividad.icono || '', actividad.tipo)}
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
                    🔥 NUEVO
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

            {/* Info adicional con iconos */}
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
            {actividades.length} de {totalActividades}
          </Text>
          {lastUpdated && (
            <Text style={{ fontSize: '10px', color: '#999' }}>
              {formatearHoraSimple(lastUpdated)}
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
        
        {/* Footer con información adicional */}
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
                <>
                  ⚡ <strong>Tiempo real activo</strong> - Las actividades aparecen instantáneamente
                </>
              ) : (
                <>
                  📊 <strong>Modo histórico</strong> - Mostrando actividades guardadas
                </>
              )}
            </Text>
          </div>
        )}
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(82, 196, 26, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .timeline-card-new {
          animation: slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        .timeline-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </Card>
  );
};

// 🔥 Componente para indicador de tiempo real mejorado
const RealtimeIndicator: React.FC<{ isRealtime: boolean }> = ({ isRealtime }) => {
  return (
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
};

// 🕐 Función auxiliar para formatear hora simple
const formatearHoraSimple = (fecha: Date): string => {
  return fecha.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};