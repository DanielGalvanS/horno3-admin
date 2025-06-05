// src/components/dashboard/KPICard.tsx
'use client';

import React from 'react';
import { Card, Statistic, Space, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { KPICardProps } from '@/types/dashboard';

const { Text } = Typography;

export const KPICard: React.FC<KPICardProps> = ({
  titulo,
  valor,
  sufijo,
  prefijo,
  cambio,
  icono,
  color = '#1677ff',
  gradient,
  loading = false
}) => {
  const isPositiveChange = cambio !== undefined && cambio > 0;
  const isNegativeChange = cambio !== undefined && cambio < 0;

  const cardStyle: React.CSSProperties = gradient
    ? {
        background: gradient,
        border: 'none',
        color: 'white',
      }
    : {
        background: 'var(--gradient-card)',
        border: '1px solid rgba(139, 69, 19, 0.1)',
      };

  const iconStyle = gradient
    ? { color: 'rgba(255, 255, 255, 0.9)', fontSize: '24px' }
    : { color, fontSize: '24px' };

  const titleStyle = gradient
    ? { color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: 500 }
    : { color: '#666', fontSize: '14px', fontWeight: 500 };

  const valueStyle = gradient
    ? { color: 'white', fontSize: '32px', fontWeight: 700 }
    : { color: '#262626', fontSize: '32px', fontWeight: 700 };

  return (
    <Card
      className="kpi-card gradient-card"
      style={cardStyle}
      loading={loading}
      hoverable
    >
      <Space direction="vertical" size={0} style={{ width: '100%' }}>
        {/* Header con ícono y título */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <Text style={titleStyle}>{titulo}</Text>
          <div style={iconStyle}>
            {icono}
          </div>
        </div>

        {/* Valor principal */}
        <Statistic
          value={valor}
          suffix={sufijo}
          prefix={prefijo}
          valueStyle={valueStyle}
        />

        {/* Indicador de cambio */}
        {cambio !== undefined && (
          <Space 
            size={4} 
            style={{ 
              marginTop: '12px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: gradient 
                ? 'rgba(255, 255, 255, 0.1)' 
                : isPositiveChange 
                  ? 'rgba(82, 196, 26, 0.1)' 
                  : 'rgba(255, 77, 79, 0.1)'
            }}
          >
            {isPositiveChange ? (
              <ArrowUpOutlined 
                style={{ 
                  color: gradient ? 'rgba(255, 255, 255, 0.9)' : '#52c41a',
                  fontSize: '12px'
                }} 
              />
            ) : isNegativeChange ? (
              <ArrowDownOutlined 
                style={{ 
                  color: gradient ? 'rgba(255, 255, 255, 0.9)' : '#ff4d4f',
                  fontSize: '12px'
                }} 
              />
            ) : null}
            <Text
              style={{
                color: gradient 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : isPositiveChange 
                    ? '#52c41a' 
                    : isNegativeChange 
                      ? '#ff4d4f' 
                      : '#666',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              {Math.abs(cambio)}% vs mes anterior
            </Text>
          </Space>
        )}
      </Space>
    </Card>
  );
};