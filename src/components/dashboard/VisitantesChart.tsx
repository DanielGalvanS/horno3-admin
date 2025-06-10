'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Select, Space, Tag, Tooltip } from 'antd';
import { Line } from '@ant-design/charts';
import { 
  CalendarOutlined, 
  LeftOutlined, 
  RightOutlined, 
  TrophyOutlined,
  FallOutlined,
  RiseOutlined,
  MinusOutlined 
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface VisitantesDataExtended {
  fecha: string;
  visitantes: number;
  dia_semana: string;
  duracion_promedio?: number;
  visitantes_dia_anterior?: number;
  crecimiento_diario?: number;
  nivel_actividad?: string;
  tipo_dia?: string;
  ranking_visitantes?: number;
  promedio_movil_3dias?: number;
  es_dia_pico?: boolean;
  es_dia_minimo?: boolean;
}

interface VisitantesChartProps {
  data: VisitantesDataExtended[];
  loading?: boolean;
  estadisticas?: {
    total: number;
    promedio: number;
    maximo: number;
    minimo: number;
  };
  insight?: string;
  onWeekChange?: (startDate: string, endDate: string) => void;
  estadisticasAgregadas?: {
    total_visitantes_semana: number;
    crecimiento_semanal: number;
    mejor_dia: string;
    peor_dia: string;
    tendencia_general: string;
  };
}

const getWeekOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = -8; i <= 2; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (today.getDay() || 7) + 1 + (i * 7));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    let label;
    if (i === 0) {
      label = "Esta semana";
    } else if (i === -1) {
      label = "Semana pasada";
    } else if (i > 0) {
      label = `En ${i} semana${i > 1 ? 's' : ''}`;
    } else {
      label = `Hace ${Math.abs(i)} semana${Math.abs(i) > 1 ? 's' : ''}`;
    }
    
    const dateRange = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
    
    options.push({
      value: `${startStr}|${endStr}`,
      label: label,
      dateRange: dateRange,
      isPast: i < 0,
      isCurrent: i === 0,
      isFuture: i > 0
    });
  }
  
  return options;
};

export const VisitantesChart: React.FC<VisitantesChartProps> = ({
  data,
  loading = false,
  estadisticas,
  insight,
  onWeekChange,
  estadisticasAgregadas
}) => {
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const weekOptions = getWeekOptions();

  useEffect(() => {
    if (weekOptions.length > 0 && !selectedWeek) {
      const currentWeek = weekOptions.find(option => option.isCurrent);
      if (currentWeek) {
        setSelectedWeek(currentWeek.value);
      }
    }
  }, [weekOptions, selectedWeek]);

  const handleWeekChange = (value: string) => {
    setSelectedWeek(value);
    if (onWeekChange) {
      const [startDate, endDate] = value.split('|');
      onWeekChange(startDate, endDate);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentIndex = weekOptions.findIndex(option => option.value === selectedWeek);
    const newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < weekOptions.length) {
      handleWeekChange(weekOptions[newIndex].value);
    }
  };

  if (loading) {
    return <Card title="Visitantes por Día" className="chart-card" loading={loading} />;
  }

  const stats = estadisticas || {
    total: data.reduce((sum, item) => sum + item.visitantes, 0),
    promedio: Math.round(data.reduce((sum, item) => sum + item.visitantes, 0) / Math.max(data.length, 1)),
    maximo: Math.max(...data.map(item => item.visitantes), 0),
    minimo: Math.min(...data.map(item => item.visitantes), 0)
  };

  const config = {
    data: data.map(item => ({
      ...item,
      nivel_actividad: item.nivel_actividad || 'Normal',
      es_especial: item.es_dia_pico || item.es_dia_minimo
    })),
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
      size: (datum: any) => datum.es_especial ? 8 : 5,
      shape: 'circle',
      style: (datum: any) => ({
        fill: datum.es_dia_pico ? '#52C41A' : datum.es_dia_minimo ? '#FF4D4F' : '#4A90E2',
        stroke: '#ffffff',
        lineWidth: 2,
        fillOpacity: 0.9,
      }),
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
      formatter: (datum: any) => {
        const items = [
          {
            name: `${datum.dia_semana}`,
            value: `${datum.visitantes || 0} visitante${datum.visitantes !== 1 ? 's' : ''}`
          }
        ];
        
        if (datum.nivel_actividad) {
          items.push({
            name: 'Nivel',
            value: datum.nivel_actividad
          });
        }
        
        if (datum.crecimiento_diario && Math.abs(datum.crecimiento_diario) > 0.1) {
          items.push({
            name: datum.crecimiento_diario > 0 ? 'Crecimiento' : 'Decrecimiento',
            value: `${datum.crecimiento_diario > 0 ? '+' : ''}${datum.crecimiento_diario}%`
          });
        }
        
        if (datum.duracion_promedio && datum.duracion_promedio > 0) {
          items.push({
            name: 'Duración promedio',
            value: `${datum.duracion_promedio} min`
          });
        }

        return items;
      },
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

  const selectedOption = weekOptions.find(option => option.value === selectedWeek);

  return (
    <Card 
      className="chart-card"
      loading={loading}
      // En el título del componente VisitantesChart, ajusta esta parte:

      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%',
          height: '80px',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            flex: 1,  // 🆕 Agregar flex para mejor distribución
            minWidth: 0  // 🆕 Permitir que se contraiga si es necesario
          }}>
            <span style={{
              color: '#1A1A1A',
              fontWeight: 600,
              fontSize: '18px',
              letterSpacing: '-0.3px',
            }}>
              Visitantes por Día
            </span>
            
            {estadisticasAgregadas?.tendencia_general && (
              <Tag 
                color={
                  estadisticasAgregadas.tendencia_general === 'Creciendo' ? 'green' :
                  estadisticasAgregadas.tendencia_general === 'Decreciendo' ? 'red' : 'blue'
                }
                icon={
                  estadisticasAgregadas.tendencia_general === 'Creciendo' ? <RiseOutlined /> :
                  estadisticasAgregadas.tendencia_general === 'Decreciendo' ? <FallOutlined /> : <MinusOutlined />
                }
              >
                {estadisticasAgregadas.tendencia_general}
              </Tag>
            )}
            
            
          </div>
          
          {/* 🔧 ARREGLADO: Más espacio para el dropdown */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            minWidth: '280px'  // 🆕 Ancho mínimo garantizado
          }}>
            <Space>
              <button
                onClick={() => navigateWeek('prev')}
                style={{
                  border: 'none',
                  background: '#F5F5F5',
                  borderRadius: '6px',
                  padding: '8px',  // 🆕 Más padding
                  cursor: 'pointer',
                  color: '#666',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LeftOutlined />
              </button>
              
              <Select
                value={selectedWeek}
                onChange={handleWeekChange}
                style={{ width: 220, height: 40, padding: '2px 4px' }}  // 🆕 Más ancho (era 200)
                size="small"
                suffixIcon={<CalendarOutlined style={{ color: '#8C8C8C' }} />}
              >
                {weekOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                    
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        {option.dateRange}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
              
              <button
                onClick={() => navigateWeek('next')}
                style={{
                  border: 'none',
                  background: '#F5F5F5',
                  borderRadius: '6px',
                  padding: '6px 10px',  // 🆕 Más padding
                  cursor: 'pointer',
                  color: '#666',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RightOutlined />
              </button>
            </Space>
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
      {data.length > 0 ? (
        <>
          <Row gutter={32} style={{ marginBottom: '16px' }}>
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
                  color: '#52C41A',
                  marginBottom: '4px',
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <TrophyOutlined style={{ fontSize: '20px' }} />
                  {stats.maximo.toLocaleString()}
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: '#8C8C8C',
                  fontWeight: 500,
                  marginLeft: '8px'
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
                  color: stats.minimo === 0 ? '#FF4D4F' : '#1A1A1A',
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

          <Row style={{ marginBottom: '24px' }}>
            <Col span={24}>
              <Space wrap>
                {data.filter(d => d.es_dia_pico).map(dia => (
                  <Tooltip key={`pico-${dia.fecha}`} title="Día con más visitantes">
                    <Tag color="green" icon={<TrophyOutlined />}>
                      {dia.dia_semana}: {dia.visitantes} visitantes
                    </Tag>
                  </Tooltip>
                ))}
                {data.filter(d => d.es_dia_minimo && d.visitantes > 0).map(dia => (
                  <Tooltip key={`minimo-${dia.fecha}`} title="Día con menos visitantes">
                    <Tag color="orange">
                      {dia.dia_semana}: {dia.visitantes} visitantes
                    </Tag>
                  </Tooltip>
                ))}
                {data.filter(d => d.visitantes === 0).length > 0 && (
                  <Tag color="red">
                    {data.filter(d => d.visitantes === 0).length} día{data.filter(d => d.visitantes === 0).length > 1 ? 's' : ''} sin visitantes
                  </Tag>
                )}
              </Space>
            </Col>
          </Row>

          <div style={{ 
            background: '#FFFFFF',
            borderRadius: '8px',
            margin: '0 -16px',
          }}>
            <Line {...config} />
          </div>

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
                insight || 
                (estadisticasAgregadas?.mejor_dia ? 
                  `El mejor día fue ${estadisticasAgregadas.mejor_dia} con ${stats.maximo} visitantes. Tendencia general: ${estadisticasAgregadas.tendencia_general?.toLowerCase()}.` :
                  `Máximo de visitantes: ${stats.maximo} en un día.`
                )
              }
              {selectedOption && (
                <span style={{ marginLeft: '8px', color: '#8C8C8C' }}>
                  ({selectedOption.dateRange})
                </span>
              )}
            </Text>
          </div>
        </>
      ) : (
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
            {selectedOption && (
              <div style={{ marginTop: '4px', color: '#8C8C8C' }}>
                Período: {selectedOption.dateRange}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};