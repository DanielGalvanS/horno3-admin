// src/components/dashboard/DashboardLayout.tsx
'use client';

import React from 'react';
import { Typography, Space, Breadcrumb, Button } from 'antd';
import { 
  SyncOutlined, 
  SettingOutlined, 
  DownloadOutlined,
  HomeOutlined,
  DashboardOutlined 
} from '@ant-design/icons';
import { DashboardLayoutProps } from '@/types/dashboard';

const { Title } = Typography;

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  titulo = "Dashboard",
  acciones
}) => {
  const handleRefresh = () => {
    // Aquí implementarías la lógica de refresh
    window.location.reload();
  };

  const handleExport = () => {
    // Aquí implementarías la lógica de exportación
    console.log('Exportando datos...');
  };

  const defaultAcciones = (
    <Space size="middle">
      <Button 
        icon={<DownloadOutlined />}
        onClick={handleExport}
        style={{ borderRadius: '8px' }}
      >
        Exportar
      </Button>
      <Button 
        icon={<SettingOutlined />}
        style={{ borderRadius: '8px' }}
      >
        Configuración
      </Button>
      <Button 
        type="primary"
        icon={<SyncOutlined />}
        onClick={handleRefresh}
        style={{ borderRadius: '8px' }}
      >
        Actualizar
      </Button>
    </Space>
  );

  return (
    <div className="dashboard-container">

      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div>
          <Title level={2} className="dashboard-title">
            {titulo}
          </Title>
          <Typography.Text 
            type="secondary" 
            style={{ fontSize: '14px', marginTop: '4px' }}
          >
            Resumen de actividad y estadísticas del museo
          </Typography.Text>
        </div>
        <div>
          {acciones || defaultAcciones}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="fade-in-up">
        {children}
      </div>
    </div>
  );
};