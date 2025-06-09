// src/app/(DashboardLayout)/utilities/SeccionesPage/SeccionesTable.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Tooltip, Popconfirm, Switch } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Zona } from '@/types/zona';

interface SeccionesTableProps {
  zonas: Zona[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onEditClick: (zona: Zona) => void;
  onToggleActive?: (id: string, activo: boolean) => Promise<boolean>; // 🆕 Nueva función
  searchText?: string;
}

export const SeccionesTable: React.FC<SeccionesTableProps> = ({
  zonas,
  loading,
  onDelete,
  onEditClick,
  onToggleActive, // 🆕 Nueva prop
  searchText = ''
}) => {
  const [filteredData, setFilteredData] = useState<Zona[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null); // 🆕 Para el switch

  // Opciones para los filtros
  const categoriaOptions = [
    'Ciencias Naturales',
    'Arte y Cultura',
    'Historia',
    'Tecnología',
    'Educación',
    'Arqueología'
  ];

  const actividadOptions = ['baja', 'media', 'alta'];

  // Función para obtener etiquetas amigables
  const getActividadLabel = (value: string): string => {
    const labels: { [key: string]: string } = {
      'baja': 'Baja Intensidad',
      'media': 'Media Intensidad',
      'alta': 'Alta Intensidad'
    };
    return labels[value] || value;
  };

  // ✅ Filtrar datos basado en búsqueda - Con verificaciones null
  useEffect(() => {
    const filtered = zonas.filter(item =>
      item.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ?? false) ||
      (item.categorias?.some(cat => 
        cat.toLowerCase().includes(searchText.toLowerCase())
      ) ?? false)
    );
    setFilteredData(filtered);
  }, [zonas, searchText]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting zona:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // 🆕 Función para cambiar estado activo
  const handleToggleActive = async (id: string, currentActivo: boolean) => {
    if (!onToggleActive) return;
    
    setTogglingId(id);
    try {
      await onToggleActive(id, !currentActivo);
    } catch (error) {
      console.error('Error toggling zona active state:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const columns: ColumnsType<Zona> = [
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 80,
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value, record) => record.activo === value,
      render: (activo: boolean, record: Zona) => (
        <Tooltip title={activo ? 'Activa - Click para desactivar' : 'Inactiva - Click para activar'}>
          <Switch
            checked={activo}
            loading={togglingId === record.id}
            onChange={() => handleToggleActive(record.id, activo)}
            disabled={!onToggleActive || togglingId === record.id}
            size="small"
          />
        </Tooltip>
      )
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (text: string, record: Zona) => (
        <span style={{ 
          fontWeight: 'bold',
          opacity: record.activo ? 1 : 0.6, // 🆕 Opacidad para inactivos
          textDecoration: record.activo ? 'none' : 'line-through' // 🆕 Tachado para inactivos
        }}>
          {text}
          {!record.activo && (
            <Tag color="default" style={{ marginLeft: 8 }}>
              Inactiva
            </Tag>
          )}
        </span>
      )
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string | null, record: Zona) => (
        <Tooltip placement="topLeft" title={text || 'Sin descripción'}>
          <span style={{ opacity: record.activo ? 1 : 0.6 }}>
            {text || 'Sin descripción'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'categorias',
      key: 'categorias',
      filters: categoriaOptions.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.categorias?.includes(value as string) ?? false,
      render: (categorias: string[] | null, record: Zona) => (
        <Tag 
          color={record.activo ? "blue" : "default"}
          style={{ opacity: record.activo ? 1 : 0.6 }}
        >
          {categorias?.[0] || 'Sin categoría'}
        </Tag>
      )
    },
    {
      title: 'Nivel',
      dataIndex: 'nivel',
      key: 'nivel',
      sorter: (a, b) => (a.nivel || 0) - (b.nivel || 0),
      filters: [
        { text: 'Nivel 1', value: 1 },
        { text: 'Nivel 2', value: 2 },
        { text: 'Nivel 3', value: 3 },
      ],
      onFilter: (value, record) => record.nivel === value,
      render: (nivel: number | null, record: Zona) => {
        if (!nivel) return <Tag color="default">Sin nivel</Tag>;
        const color = record.activo 
          ? (nivel === 1 ? 'green' : nivel === 2 ? 'orange' : 'red')
          : 'default';
        return (
          <Tag 
            color={color}
            style={{ opacity: record.activo ? 1 : 0.6 }}
          >
            Nivel {nivel}
          </Tag>
        );
      }
    },
    {
      title: 'Duración (min)',
      dataIndex: 'duracion',
      key: 'duracion',
      sorter: (a, b) => a.duracion - b.duracion,
      render: (duracion: number, record: Zona) => (
        <span style={{ opacity: record.activo ? 1 : 0.6 }}>
          {duracion} min
        </span>
      )
    },
    {
      title: 'Intensidad',
      dataIndex: 'actividad',
      key: 'actividad',
      filters: actividadOptions.map(act => ({ text: getActividadLabel(act), value: act })),
      onFilter: (value, record) => record.actividad === value,
      render: (actividad: string, record: Zona) => {
        const colorMap: { [key: string]: string } = {
          'baja': record.activo ? 'green' : 'default',
          'media': record.activo ? 'orange' : 'default', 
          'alta': record.activo ? 'red' : 'default'
        };
        return (
          <Tag 
            color={colorMap[actividad] || 'purple'}
            style={{ opacity: record.activo ? 1 : 0.6 }}
          >
            {getActividadLabel(actividad)}
          </Tag>
        );
      }
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      className: 'actions-column',
      render: (_, record: Zona) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type='text'
              icon={<EditOutlined />}
              onClick={() => onEditClick(record)}
              disabled={deletingId === record.id || togglingId === record.id}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
          <Popconfirm
          title="¿Estás seguro de eliminar esta sección?"
          description="Esta acción no se puede deshacer."
          onConfirm={() => handleDelete(record.id)}
          okText="Sí, eliminar"
          cancelText="Cancelar"
          okType="danger"
          disabled={deletingId === record.id || togglingId === record.id}
        >
              <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Eliminar"
              disabled={deletingId === record.id || togglingId === record.id}
            />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={filteredData}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} de ${total} secciones`,
      }}
      // 🆕 Estilo para filas inactivas
      rowClassName={(record) => record.activo ? '' : 'inactive-row'}
    />
  );
};