// src/app/(DashboardLayout)/utilities/SeccionesPage/SeccionesTable.tsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Zona } from '@/types/zona';

interface SeccionesTableProps {
  zonas: Zona[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onEditClick: (zona: Zona) => void;
  searchText?: string;
}

export const SeccionesTable: React.FC<SeccionesTableProps> = ({
  zonas,
  loading,
  onDelete,
  onEditClick,
  searchText = ''
}) => {
  const [filteredData, setFilteredData] = useState<Zona[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const columns: ColumnsType<Zona> = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (text: string) => <span style={{ fontWeight: 'bold' }}>{text}</span>
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string | null) => (
        <Tooltip placement="topLeft" title={text || 'Sin descripción'}>
          {text || 'Sin descripción'}
        </Tooltip>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'categorias',
      key: 'categorias',
      filters: categoriaOptions.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.categorias?.includes(value as string) ?? false,
      render: (categorias: string[] | null) => (
        <Tag color="blue">{categorias?.[0] || 'Sin categoría'}</Tag>
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
      render: (nivel: number | null) => {
        if (!nivel) return <Tag color="default">Sin nivel</Tag>;
        const color = nivel === 1 ? 'green' : nivel === 2 ? 'orange' : 'red';
        return (
          <Tag color={color}>
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
      render: (duracion: number) => `${duracion} min`
    },
    {
      title: 'Intensidad',
      dataIndex: 'actividad',
      key: 'actividad',
      filters: actividadOptions.map(act => ({ text: getActividadLabel(act), value: act })),
      onFilter: (value, record) => record.actividad === value,
      render: (actividad: string) => {
        const colorMap: { [key: string]: string } = {
          'baja': 'green',
          'media': 'orange', 
          'alta': 'red'
        };
        return (
          <Tag color={colorMap[actividad] || 'purple'}>
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
              disabled={deletingId === record.id}
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
          disabled={deletingId === record.id}
        >
              <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Eliminar"
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
    />
  );
};