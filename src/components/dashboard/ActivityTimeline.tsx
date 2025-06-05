// src/components/dashboard/ActivityTimeline.tsx
'use client';

import React from 'react';
import { Card, Timeline, Typography, Space, Tag, Avatar, Empty } from 'antd';
import { 
  UserOutlined, 
  PlayCircleOutlined, 
  FileTextOutlined, 
  PictureOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import { ActividadReciente } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const { Text, Title } = Typography;

interface ActivityTimelineProps {
  actividades: ActividadReciente[];
  loading?: boolean;
  altura?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  actividades,
  loading = false,
  altura = 400
}) => {
  const getIcon = (tipo: ActividadReciente['tipo']) => {
    const iconMap = {
      visita: <UserOutlined />,
      show: <PlayCircleOutlined />,
      noticia: <FileTextOutlined />,
      contenido: <PictureOutlined />,
    };
    return iconMap[tipo] || <ClockCircleOutlined />;
  };

  const getColorByTipo = (tipo: ActividadReciente['tipo']) => {
    const colorMap = {
      visita: '#52c41a',
      show: '#1677ff', 
      noticia: '#faad14',
      contenido: '#722ed1',
    };
    return colorMap[tipo] || '#8c8c8c';
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

  const formatearTiempo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'Hace un momento';
    }
  };

  if (actividades.length === 0) {
    return (
      <Card title="Actividad Reciente" className="activity-card">
        <Empty 
          description="No hay actividad reciente"
          style={{ margin: '60px 0' }}
        />
      </Card>
    );
  }

  const timelineItems = actividades.map((actividad) => ({
    dot: (
      <Avatar
        size="small"
        style={{ 
          backgroundColor: getColorByTipo(actividad.tipo),
          border: '2px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
        icon={getIcon(actividad.tipo)}
      />
    ),
    children: (
      <Card 
        size="small" 
        className="timeline-card"
        style={{ 
          marginLeft: '8px',
          borderLeft: `3px solid ${getColorByTipo(actividad.tipo)}`,
          borderRadius: '8px'
        }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {/* Header con tipo y tiempo */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
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
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '11px',
                fontWeight: 400
              }}
            >
              {formatearTiempo(actividad.timestamp)}
            </Text>
          </div>

          {/* Título principal */}
          <Title 
            level={5} 
            style={{ 
              margin: 0, 
              fontSize: '14px',
              fontWeight: 600,
              color: '#262626'
            }}
          >
            {actividad.titulo}
          </Title>

          {/* Descripción */}
          <Text 
            style={{ 
              fontSize: '13px', 
              color: '#595959',
              lineHeight: '1.4'
            }}
          >
            {actividad.descripcion}
          </Text>

          {/* Info adicional */}
          {(actividad.usuario || actividad.zona) && (
            <Space size={16} style={{ marginTop: '8px' }}>
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
                  <PictureOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                  <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {actividad.zona}
                  </Text>
                </Space>
              )}
            </Space>
          )}
        </Space>
      </Card>
    ),
  }));

  return (
    <Card 
      title="Actividad Reciente" 
      className="activity-card"
      extra={
        <Text style={{ fontSize: '12px', color: '#8B4513' }}>
          Últimas {actividades.length} actividades
        </Text>
      }
      loading={loading}
    >
      <div 
        className="custom-scrollbar"
        style={{ 
          height: altura, 
          overflowY: 'auto',
          padding: '16px'
        }}
      >
        <Timeline
          mode="left"
          items={timelineItems}
          style={{ paddingTop: '16px' }}
        />
      </div>
    </Card>
  );
};