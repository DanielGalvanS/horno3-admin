// src/app/(DashboardLayout)/utilities/SeccionesPage/SeccionesHeader.tsx
import React, { useState } from 'react';
import { Row, Col, Space, Input, Button } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

interface SeccionesHeaderProps {
  onRefresh: () => void;
  loading: boolean;
  onSearch?: (searchText: string) => void;
  onCreateClick: () => void; // ✅ Nueva prop para crear
}

export const SeccionesHeader: React.FC<SeccionesHeaderProps> = ({
  onRefresh,
  loading,
  onSearch,
  onCreateClick // ✅ Recibir función como prop
}) => {
  const [searchText, setSearchText] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch?.(value);
  };

  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <h2 style={{ margin: 0 }}>Gestión de Secciones del Museo</h2>
      </Col>
      <Col>
        <Space>
          <Input
            placeholder="Buscar secciones..."
            allowClear
            value={searchText}
            onChange={handleSearchChange}
            style={{ 
              width: 250, 
              height: 40,
              alignContent: 'center', 
              alignItems: 'center' 
            }}
            prefix={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateClick} // ✅ Usar prop en lugar de hook local
          >
            Nueva Sección
          </Button>
        </Space>
      </Col>
    </Row>
  );
};