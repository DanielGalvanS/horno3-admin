// src/components/dashboard/VisitantesChart.tsx - CON DATOS REALES ✨
'use client';

import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { Line } from '@ant-design/charts';

const { Text } = Typography;

interface VisitantesChartProps {
  data: Array<{ fecha: string; visitantes: number; dia: string; duracionPromedio?: number }>;
  loading?: boolean;
  // 🔥 Props adicionales para datos reales
  estadisticas?: {
    total: number;
    promedio: number;
    maximo: number;
    minimo: number;
  };
  insight?: string;
}

export const VisitantesChart: React.FC<VisitantesChartProps> = ({
  data,
  loading = false,
  estadisticas,
  insight
}) => {
  if (loading) {
    return <Card title="Visitantes por Día" className="chart-card" loading={loading} />;
  }

  // 🎯 Usar estadísticas reales si están disponibles, sino calcular
  const stats = estadisticas || {
    total: data.reduce((sum, item) => sum + item.visitantes, 0),
    promedio: Math.round(data.reduce((sum, item) => sum + item.visitantes, 0) / Math.max(data.length, 1)),
    maximo: Math.max(...data.map(item => item.visitantes), 0),
    minimo: Math.min(...data.map(item => item.visitantes), 0)
  };

  // 🔥 Insight real o calculado
  const insightFinal = insight || (() => {
    if (data.length === 0) return 'No hay datos de visitantes disponibles';
    
    const maxVisitantes = stats.maximo;
    const diaMaxVisitantes = data.find(d => d.visitantes === maxVisitantes);
    
    return maxVisitantes === data[data.length - 1]?.visitantes 
      ? `El último día registró el mayor número de visitantes (${maxVisitantes} personas)`
      : `El día más popular fue ${diaMaxVisitantes?.dia || 'N/A'} con ${maxVisitantes} visitantes`;
  })();

  // 🎨 Configuración del gráfico (manteniendo tu estilo)
  const config = {
    data,
    height: 300,
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
            {/* 🔥 Mostrar si hay crecimiento calculado */}
            {data.length >= 2 && (() => {
              const ultimo = data[data.length - 1]?.visitantes || 0;
              const penultimo = data[data.length - 2]?.visitantes || 0;
              const crecimiento = penultimo > 0 ? ((ultimo - penultimo) / penultimo) * 100 : 0;
              
              if (Math.abs(crecimiento) > 0.1) {
                return (
                  <div style={{
                    color: crecimiento > 0 ? '#52C41A' : '#FF4D4F',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    {crecimiento > 0 ? '+' : ''}{crecimiento.toFixed(1)}%
                  </div>
                );
              }
              return null;
            })()}
          </div>
          <div style={{ 
            color: '#8C8C8C', 
            fontSize: '13px',
            fontWeight: 500,
          }}>
            {data.length > 0 ? 'Últimos 7 días' : 'Sin datos'}
          </div>
        </div>
      }
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0F0F0',
        boxShadow: 'none',
        borderRadius: '12px',
        height: '100%',
      }}
      styles={{
        body: {
          padding: '24px 32px 32px 32px',
        }
      }}
    >
      {/* 📊 ESTADÍSTICAS REALES */}
      {data.length > 0 ? (
        <>
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
                  {stats.total.toLocaleString()}
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
                  {stats.promedio.toLocaleString()}
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
                  {stats.maximo.toLocaleString()}
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
                  {stats.minimo.toLocaleString()}
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

          {/* 🎨 GRÁFICO */}
          <div style={{ 
            background: '#FFFFFF',
            borderRadius: '8px',
            margin: '0 -16px',
          }}>
            <Line {...config} />
          </div>

          {/* 💡 INSIGHT REAL */}
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
              💡 <strong style={{ color: '#1A1A1A' }}>Insight:</strong> {insightFinal}
            </Text>
          </div>
        </>
      ) : (
        // 🚫 Estado sin datos
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          color: '#999'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No hay datos de visitantes</div>
          <div style={{ fontSize: '14px', textAlign: 'center' }}>
            Los datos aparecerán cuando haya registros en la tabla 'visita'
          </div>
        </div>
      )}
    </Card>
  );
};