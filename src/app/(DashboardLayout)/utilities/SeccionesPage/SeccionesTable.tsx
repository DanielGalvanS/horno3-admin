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
  onEditClick: (zona: Zona) => void; // ✅ Nueva prop para editar
  searchText?: string;
}

export const SeccionesTable: React.FC<SeccionesTableProps> = ({
  zonas,
  loading,
  onDelete,
  onEditClick, // ✅ Recibir función como prop
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

  // Filtrar datos basado en búsqueda
  useEffect(() => {
    const filtered = zonas.filter(item =>
      item.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchText.toLowerCase()) ||
      item.categorias.some(cat => 
        cat.toLowerCase().includes(searchText.toLowerCase())
      )
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
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'categorias',
      key: 'categorias',
      filters: categoriaOptions.map(cat => ({ text: cat, value: cat })),
      onFilter: (value, record) => record.categorias.includes(value as string),
      render: (categorias: string[]) => (
        <Tag color="blue">{categorias?.[0] || 'Sin categoría'}</Tag>
      )
    },
    {
      title: 'Nivel',
      dataIndex: 'nivel',
      key: 'nivel',
      sorter: (a, b) => a.nivel - b.nivel,
      filters: [
        { text: 'Nivel 1', value: 1 },
        { text: 'Nivel 2', value: 2 },
        { text: 'Nivel 3', value: 3 },
      ],
      onFilter: (value, record) => record.nivel === value,
      render: (nivel: number) => (
        <Tag color={nivel === 1 ? 'green' : nivel === 2 ? 'orange' : 'red'}>
          Nivel {nivel}
        </Tag>
      )
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
      fixed: 'right',
      width: 120,
      render: (_, record: Zona) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEditClick(record)} // ✅ Usar prop en lugar de hook local
              disabled={deletingId === record.id}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Estás seguro de eliminar esta sección?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
              disabled={deletingId === record.id}
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                loading={deletingId === record.id}
                disabled={deletingId !== null && deletingId !== record.id}
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