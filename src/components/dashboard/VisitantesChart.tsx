// src/components/dashboard/VisitantesChart.tsx - VERSIÓN QUE FUNCIONABA BIEN ✨
'use client';

import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { Line } from '@ant-design/charts';

const { Text } = Typography;

interface VisitantesChartProps {
  data: Array<{ fecha: string; visitantes: number; dia: string }>;
  loading?: boolean;
}

export const VisitantesChart: React.FC<VisitantesChartProps> = ({
  data,
  loading = false
}) => {
  if (loading) {
    return <Card title="Visitantes por Día" className="chart-card" loading={loading} />;
  }

  const totalVisitantes = data.reduce((sum, item) => sum + item.visitantes, 0);
  const promedioVisitantes = Math.round(totalVisitantes / data.length);
  const maxVisitantes = Math.max(...data.map(item => item.visitantes));
  const minVisitantes = Math.min(...data.map(item => item.visitantes));

  // 🎨 CONFIGURACIÓN QUE FUNCIONABA BIEN
  const config = {
    data,
    height: 300, // ✅ Altura original que funcionaba
    xField: 'fecha',
    yField: 'visitantes',
    smooth: true,
    
    color: '#4A90E2',
    
    lineStyle: {
      lineWidth: 3,
      stroke: '#4A90E2',
      strokeOpacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round',
    },
    
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: '#4A90E2',
        stroke: '#ffffff',
        lineWidth: 2,
        fillOpacity: 0.9,
      },
    },
    
    xAxis: {
      label: {
        style: {
          fill: '#8C8C8C',
          fontSize: 12,
          fontWeight: 400,
        },
      },
      line: false,
      tickLine: false,
    },
    
    yAxis: {
      label: {
        style: {
          fill: '#8C8C8C',
          fontSize: 12,
          fontWeight: 400,
        },
      },
      grid: {
        line: {
          style: {
            stroke: '#F0F0F0',
            lineWidth: 1,
            lineDash: false,
          },
        },
      },
      line: false,
    },
    
    tooltip: {
      showTitle: false,
      formatter: (datum: any) => ({
        name: datum.dia,
        value: `${datum.visitantes.toLocaleString()} visitantes`,
      }),
      domStyles: {
        'g2-tooltip': {
          background: 'rgba(26, 26, 26, 0.9)',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '12px',
          fontWeight: 500,
          padding: '8px 12px',
        },
      },
    },
    
    
    
  };

  return (
    <Card 
      className="chart-card"
      loading={loading}
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px'
          }}>
            <span style={{
              color: '#1A1A1A',
              fontWeight: 600,
              fontSize: '18px',
              letterSpacing: '-0.3px',
            }}>
              Visitantes por Día
            </span>
            <div style={{
              color: '#52C41A',
              fontSize: '14px',
              fontWeight: 600,
            }}>
              +12.5%
            </div>
          </div>
          <div style={{ 
            color: '#8C8C8C', 
            fontSize: '13px',
            fontWeight: 500,
          }}>
            Última semana
          </div>
        </div>
      }
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0F0F0',
        boxShadow: 'none',
        borderRadius: '12px',
        height: '100%', // ✅ Mantiene altura completa
      }}
      styles={{
        body: { // ✅ Corregido: styles.body en lugar de bodyStyle
          padding: '24px 32px 32px 32px',
        }
      }}
    >
      {/* 📊 ESTADÍSTICAS COMO ESTABAN ANTES */}
      <Row gutter={32} style={{ marginBottom: '32px' }}>
        <Col span={6}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#1A1A1A',
              marginBottom: '4px',
              letterSpacing: '-0.5px'
            }}>
              {totalVisitantes.toLocaleString()}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#8C8C8C',
              fontWeight: 500,
            }}>
              Total visitantes
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#1A1A1A',
              marginBottom: '4px',
              letterSpacing: '-0.5px'
            }}>
              {promedioVisitantes}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#8C8C8C',
              fontWeight: 500,
            }}>
              Promedio/día
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#1A1A1A',
              marginBottom: '4px',
              letterSpacing: '-0.5px'
            }}>
              {maxVisitantes}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#8C8C8C',
              fontWeight: 500,
            }}>
              Máximo
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#1A1A1A',
              marginBottom: '4px',
              letterSpacing: '-0.5px'
            }}>
              {minVisitantes}
            </div>
            <div style={{ 
              fontSize: '13px', 
              color: '#8C8C8C',
              fontWeight: 500,
            }}>
              Mínimo
            </div>
          </div>
        </Col>
      </Row>

      {/* 🎨 GRÁFICO COMO ESTABA ANTES */}
      <div style={{ 
        background: '#FFFFFF',
        borderRadius: '8px',
        margin: '0 -16px',
      }}>
        <Line {...config} />
      </div>

      {/* 💡 INSIGHT CON ESPACIADO NORMAL */}
      <div style={{ 
        marginTop: '24px',
        padding: '16px 20px',
        background: '#F8F9FA',
        borderRadius: '8px',
        border: '1px solid #F0F0F0',
      }}>
        <Text style={{ 
          fontSize: '14px', 
          color: '#5A5A5A',
          fontWeight: 500,
          lineHeight: '1.5'
        }}>
          💡 <strong style={{ color: '#1A1A1A' }}>Insight:</strong> {
            maxVisitantes === data[data.length - 1]?.visitantes 
              ? `El último día registró el mayor número de visitantes (${maxVisitantes} personas)`
              : `El día más popular fue ${data.find(d => d.visitantes === maxVisitantes)?.dia} con ${maxVisitantes} visitantes`
          }
        </Text>
      </div>
    </Card>
  );
};