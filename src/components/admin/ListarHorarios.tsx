// src/components/admin/ListarHorarios.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Tag, 
  Modal,
  Input,
  Select,
  Typography,
  Switch,
  Tooltip
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  UserOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { HorarioShow } from '@/types/horarioshow';
import { DIAS_SEMANA, TIPOS_SHOW, IDIOMAS } from '@/types/horarioshow';
import { CrearHorarioForm } from './CrearHorarioForm';

const { Text } = Typography;

export const ListarHorarios: React.FC = () => {
  const [horarios, setHorarios] = useState<HorarioShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedHorario, setSelectedHorario] = useState<HorarioShow | undefined>();
  const [searchText, setSearchText] = useState('');
  const [filtroDia, setFiltroDia] = useState<string | undefined>();
  const [filtroTipo, setFiltroTipo] = useState<string | undefined>();
  const [filtroActivo, setFiltroActivo] = useState<boolean | undefined>();

  // Cargar datos iniciales
  useEffect(() => {
    loadHorarios();
  }, [searchText, filtroDia, filtroTipo, filtroActivo]);

  // Cargar horarios usando API
  const loadHorarios = async () => {
    setLoading(true);
    try {
      console.log('Cargando horarios desde API...');
      
      // Construir parámetros de consulta
      const params = new URLSearchParams();
      if (searchText.trim()) {
        params.append('search', searchText.trim());
      }
      if (filtroDia) {
        params.append('dia', filtroDia);
      }
      if (filtroTipo) {
        params.append('tipo', filtroTipo);
      }
      if (filtroActivo !== undefined) {
        params.append('activo', filtroActivo.toString());
      }
      
      const url = `/api/horarios${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('Respuesta de horarios:', result);

      if (result.success) {
        setHorarios(result.data);
      } else {
        throw new Error(result.error || 'Error al cargar horarios');
      }
    } catch (error: any) {
      console.error('Error al cargar horarios:', error);
      message.error('Error al cargar horarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación usando API
  const handleDelete = async (id: string) => {
    try {
      console.log(`Eliminando horario ${id}...`);
      
      const response = await fetch(`/api/horarios/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        message.success('Horario eliminado exitosamente');
        loadHorarios(); // Recargar lista
      } else {
        throw new Error(result.error || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Error al eliminar horario:', error);
      message.error('Error al eliminar horario: ' + error.message);
    }
  };

  // Abrir modal
  const openModal = (mode: 'create' | 'edit', horario?: HorarioShow) => {
    setModalMode(mode);
    setSelectedHorario(horario);
    setModalVisible(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedHorario(undefined);
  };

  // Manejar éxito del formulario
  const handleFormSuccess = () => {
    closeModal();
    loadHorarios(); // Recargar lista
  };

  // Formatear hora
  const formatHora = (hora: string) => {
    return hora; // Ya viene en formato HH:MM
  };

  // Obtener color del tag según el día
  const getDiaColor = (dia: string): string => {
    const colors: { [key: string]: string } = {
      'lunes': 'blue',
      'martes': 'green',
      'miércoles': 'orange',
      'jueves': 'purple',
      'viernes': 'red',
      'sábado': 'cyan',
      'domingo': 'magenta'
    };
    return colors[dia] || 'default';
  };

  // Obtener color del tag según el tipo
  const getTipoColor = (tipo: string): string => {
    const colors: { [key: string]: string } = {
      'principal': 'blue',
      'especial': 'purple',
      'presentacion': 'green',
      'demostracion': 'orange',
      'taller': 'cyan'
    };
    return colors[tipo] || 'default';
  };

  // Capitalizar primera letra
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Columnas de la tabla
  const columns: ColumnsType<HorarioShow> = [
    {
      title: 'Día',
      dataIndex: 'dia',
      key: 'dia',
      width: 100,
      sorter: (a, b) => {
        const order = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
        return order.indexOf(a.dia) - order.indexOf(b.dia);
      },
      render: (dia: string) => (
        <Tag color={getDiaColor(dia)}>
          {capitalize(dia)}
        </Tag>
      ),
    },
    {
      title: 'Hora',
      dataIndex: 'hora',
      key: 'hora',
      width: 100,
      sorter: (a, b) => a.hora.localeCompare(b.hora),
      render: (hora: string) => (
        <Text style={{ fontWeight: 500, fontFamily: 'monospace' }}>
          {formatHora(hora)}
        </Text>
      ),
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (nombre: string | null) => (
        <Text style={{ fontWeight: 500 }}>
          {nombre || 'Sin nombre'}
        </Text>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 120,
      render: (tipo: string | null) => (
        tipo ? (
          <Tag color={getTipoColor(tipo)}>
            {TIPOS_SHOW.find(t => t.value === tipo)?.label || tipo}
          </Tag>
        ) : (
          <Tag color="default">Sin tipo</Tag>
        )
      ),
    },
    {
      title: 'Duración',
      dataIndex: 'duracion',
      key: 'duracion',
      width: 90,
      sorter: (a, b) => (a.duracion || 0) - (b.duracion || 0),
      render: (duracion: number | null) => (
        duracion ? (
          <Text>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {duracion} min
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Cupo',
      dataIndex: 'cupo_maximo',
      key: 'cupo_maximo',
      width: 80,
      sorter: (a, b) => (a.cupo_maximo || 0) - (b.cupo_maximo || 0),
      render: (cupo: number | null) => (
        cupo ? (
          <Text>
            <UserOutlined style={{ marginRight: 4 }} />
            {cupo}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Idioma',
      dataIndex: 'idioma',
      key: 'idioma',
      width: 80,
      render: (idioma: string | null) => (
        idioma ? (
          <Tooltip title={IDIOMAS.find(i => i.value === idioma)?.label}>
            <Tag color="geekblue">
              <GlobalOutlined style={{ marginRight: 4 }} />
              {idioma.toUpperCase()}
            </Tag>
          </Tooltip>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 80,
      render: (activo: boolean | null) => (
        <Tag color={activo ? 'success' : 'error'}>
          {activo ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record: HorarioShow) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal('edit', record)}
            title="Editar"
          />
          <Popconfirm
            title="¿Estás seguro de eliminar este horario?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okType="danger"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Eliminar"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <ClockCircleOutlined style={{ color: '#FF6B35' }} />
            <span>Gestión de Horarios Shows</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openModal('create')}
            size="large"
          >
            Nuevo Horario
          </Button>
        }
      >
        {/* Filtros */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Buscar horarios..."
              allowClear
              style={{ width: 250, height: 40, alignContent: 'center' , alignItems: 'center' }} 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
                
            <Select
              placeholder="Filtrar por día"
              style={{ width: 150 }}
              allowClear
              value={filtroDia}
              onChange={setFiltroDia}
            >
              {DIAS_SEMANA.map(dia => (
                <Select.Option key={dia.value} value={dia.value}>
                  {dia.label}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Filtrar por tipo"
              style={{ width: 150 }}
              allowClear
              value={filtroTipo}
              onChange={setFiltroTipo}
            >
              {TIPOS_SHOW.map(tipo => (
                <Select.Option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Estado"
              style={{ width: 120 }}
              allowClear
              value={filtroActivo}
              onChange={setFiltroActivo}
            >
              <Select.Option value={true}>Activo</Select.Option>
              <Select.Option value={false}>Inactivo</Select.Option>
            </Select>
          </Space>
        </div>

        {/* Tabla */}
        <Table
          columns={columns}
          dataSource={horarios}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} horarios`,
          }}
        />
      </Card>

      {/* Modal para crear/editar */}
      <Modal
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CrearHorarioForm
          horario={modalMode === 'edit' ? selectedHorario : undefined}
          onSuccess={handleFormSuccess}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};