// components/dashboard/ReviewsCard.tsx
'use client';

import React from 'react';
import { 
  Card, 
  List, 
  Rate, 
  Typography, 
  Space, 
  Tag, 
  Avatar, 
  Tooltip,
  Button,
  Empty,
  Spin
} from 'antd';
import { 
  StarOutlined, 
  UserOutlined, 
  ClockCircleOutlined,
  EyeOutlined,
  MessageOutlined 
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const { Text, Paragraph } = Typography;

// Tipos para los reviews
interface Review {
  id: string;
  contenido: string;
  calificacion: number;
  fecha_creacion: string;
  usuario_id?: string;
  visita_id?: string;
  // Datos del usuario (si están disponibles via join)
  usuario?: {
    nombre?: string;
    email?: string;
  };
}

interface ReviewsCardProps {
  reviews: Review[];
  loading?: boolean;
  onViewAll?: () => void;
  onViewReview?: (reviewId: string) => void;
}

export const ReviewsCard: React.FC<ReviewsCardProps> = ({
  reviews = [],
  loading = false,
  onViewAll,
  onViewReview
}) => {
  
  // Función para obtener el color del rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#52c41a'; // Verde
    if (rating >= 3) return '#faad14'; // Amarillo
    return '#ff4d4f'; // Rojo
  };

  // Función para obtener el texto del sentiment
  const getRatingSentiment = (rating: number) => {
    if (rating >= 4) return { text: 'Positivo', color: 'success' };
    if (rating >= 3) return { text: 'Neutral', color: 'warning' };
    return { text: 'Negativo', color: 'error' };
  };

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Calcular estadísticas rápidas
  const stats = React.useMemo(() => {
    if (reviews.length === 0) return null;
    
    const total = reviews.length;
    const avgRating = reviews.reduce((acc, review) => acc + review.calificacion, 0) / total;
    const positivos = reviews.filter(r => r.calificacion >= 4).length;
    const negativos = reviews.filter(r => r.calificacion <= 2).length;
    
    return {
      total,
      avgRating: Number(avgRating.toFixed(1)),
      positivos,
      negativos,
      positivosPercent: Math.round((positivos / total) * 100),
      negativosPercent: Math.round((negativos / total) * 100)
    };
  }, [reviews]);

  return (
    <Card 
      title={
        <Space size="middle">
          <MessageOutlined style={{ color: '#1677ff' }} />
          <span>Reviews Recientes</span>
          {stats && (
            <Tag color="blue">
              {stats.total} reviews
            </Tag>
          )}
        </Space>
      }
      className="chart-card"
      loading={loading}
      extra={
        onViewAll && (
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={onViewAll}
            size="small"
          >
            Ver todos
          </Button>
        )
      }
    >
      {/* Estadísticas rápidas */}
      {stats && (
        <div style={{ 
          display: 'flex',
          marginBottom: '20px', 
          padding: '16px', 
          background: '#fafafa', 
          borderRadius: '8px',
          border: '1px solid #f0f0f0',
          justifyContent: 'center',
          gap: '16px'
        }}>
          <Space size="large" wrap>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1677ff' }}>
                {stats.avgRating}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                <Rate 
                  disabled 
                  value={stats.avgRating} 
                  allowHalf 
                  style={{ fontSize: '12px' }}
                />
              </div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Promedio
              </Text>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                {stats.positivosPercent}%
              </div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Positivos
              </Text>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff4d4f' }}>
                {stats.negativosPercent}%
              </div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Negativos
              </Text>
            </div>
          </Space>
        </div>
      )}

      {/* Lista de reviews */}
      {reviews.length === 0 && !loading ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ color: '#999' }}>
              No hay reviews disponibles
            </span>
          }
        />
      ) : (
        <List
          dataSource={reviews}
          renderItem={(review) => {
            const sentiment = getRatingSentiment(review.calificacion);
            

            console.log(`Review ${review.contenido}: calificacion=${review.calificacion}, Number=${Number(review.calificacion)}`);
            return (
              <List.Item 
                style={{ 
                  padding: '20px 0',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: onViewReview ? 'pointer' : 'default'
                }}
                onClick={onViewReview ? () => onViewReview(review.id) : undefined}
              >
                <div style={{ width: '100%' }}>
                  {/* Header: Usuario + Rating + Fecha */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    {/* Usuario */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar 
                        size="small" 
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#1677ff' }}
                      >
                        {review.usuario?.nombre ? review.usuario.nombre.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <div>
                        <Text strong style={{ fontSize: '13px' }}>
                          {review.usuario?.nombre || 'Usuario Anónimo'}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          <ClockCircleOutlined style={{ fontSize: '10px', marginRight: '4px' }} />
                          {formatDistanceToNow(new Date(review.fecha_creacion), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </Text>
                      </div>
                    </div>

                    {/* Rating + Sentiment */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <Rate  
                          disabled
                          value={Number(review.calificacion)} 
                          style={{ fontSize: '14px' }}
                          key={`rate-${review.id}`}
                        />
                      </div>
                      <Tag 
                        color={sentiment.color}
                        style={{ 
                          fontSize: '10px',
                          lineHeight: '16px',
                          margin: 0
                        }}
                      >
                        {sentiment.text}
                      </Tag>
                    </div>
                  </div>

                  {/* Contenido del review */}
                  <div style={{ marginBottom: '8px' }}>
                    <Paragraph 
                      style={{ 
                        fontSize: '14px',
                        lineHeight: 1.5,
                        margin: 0,
                        color: '#262626'
                      }}
                    >
                      {truncateText(review.contenido)}
                    </Paragraph>
                  </div>

                  {/* Footer: IDs para debug (solo en desarrollo) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px',
                      marginTop: '8px'
                    }}>
                      <Text type="secondary" style={{ fontSize: '10px' }}>
                        ID: {review.id.substring(0, 8)}...
                      </Text>
                      {review.visita_id && (
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          Visita: {review.visita_id.substring(0, 8)}...
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              </List.Item>
            );
          }}
          split={false}
        />
      )}
      
      
      
    </Card>
  );
};