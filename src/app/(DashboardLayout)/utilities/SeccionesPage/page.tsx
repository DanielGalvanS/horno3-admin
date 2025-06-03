"use client";

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;
const { Option } = Select;

// Interfaces TypeScript
interface Seccion {
  id: string;
  nombre: string;
  descripcion: string;
  categorias: string;
  nivel: number;
  duracion: number;
  actividad: string;
}

interface FormData {
  nombre: string;
  descripcion: string;
  categorias: string;
  nivel: number | null;
  duracion: number | null;
  actividad: string;
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  categorias?: string;
  nivel?: string;
  duracion?: string;
  actividad?: string;
}

// Datos de ejemplo (en producción vendrían de una API)
const initialData: Seccion[] = [
  {
    id: '1',
    nombre: 'Paleontología',
    descripcion: 'Sección dedicada a fósiles y evolución de especies prehistóricas',
    categorias: 'Ciencias Naturales',
    nivel: 1,
    duracion: 45,
    actividad: 'Recorrido Guiado'
  },
  {
    id: '2',
    nombre: 'Arte Contemporáneo',
    descripcion: 'Exposición de obras de arte moderno y contemporáneo',
    categorias: 'Arte y Cultura',
    nivel: 2,
    duracion: 60,
    actividad: 'Visita Libre'
  },
  {
    id: '3',
    nombre: 'Sala Interactiva Infantil',
    descripcion: 'Espacio diseñado para el aprendizaje lúdico de los niños',
    categorias: 'Educación',
    nivel: 1,
    duracion: 30,
    actividad: 'Actividad Interactiva'
  },
  {
    id: '4',
    nombre: 'Historia Antigua',
    descripcion: 'Artefactos y reliquias de civilizaciones antiguas',
    categorias: 'Historia',
    nivel: 2,
    duracion: 50,
    actividad: 'Recorrido Guiado'
  },
  {
    id: '5',
    nombre: 'Tecnología Moderna',
    descripcion: 'Innovaciones tecnológicas del siglo XXI',
    categorias: 'Tecnología',
    nivel: 3,
    duracion: 40,
    actividad: 'Actividad Interactiva'
  }
];

const SeccionesPage: React.FC = () => {
  const [data, setData] = useState<Seccion[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<Seccion | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<Seccion[]>(initialData);
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    categorias: '',
    nivel: null,
    duracion: null,
    actividad: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Opciones para los selects
  const categoriaOptions: string[] = [
    'Ciencias Naturales',
    'Arte y Cultura',
    'Historia',
    'Tecnología',
    'Educación',
    'Arqueología'
  ];

  const actividadOptions: string[] = [
    'Recorrido Guiado',
    'Visita Libre',
    'Actividad Interactiva',
    'Taller',
    'Conferencia',
    'Exposición Temporal'
  ];

  // Filtrar datos basado en búsqueda
  useEffect(() => {
    const filtered = data.filter(item =>
      item.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchText.toLowerCase()) ||
      item.categorias.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [data, searchText]);

  // Configuración de columnas de la tabla
  const columns: ColumnsType<Seccion> = [
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
      onFilter: (value, record) => record.categorias === value,
      render: (categorias: string) => (
        <Tag color="blue">{categorias}</Tag>
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
      title: 'Actividad',
      dataIndex: 'actividad',
      key: 'actividad',
      filters: actividadOptions.map(act => ({ text: act, value: act })),
      onFilter: (value, record) => record.actividad === value,
      render: (actividad: string) => (
        <Tag color="purple">{actividad}</Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record: Seccion) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Estás seguro de eliminar esta sección?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Validación del formulario
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.nombre || formData.nombre.length < 3) {
      errors.nombre = 'El nombre es obligatorio y debe tener al menos 3 caracteres';
    }
    
    if (!formData.descripcion || formData.descripcion.length < 10) {
      errors.descripcion = 'La descripción es obligatoria y debe tener al menos 10 caracteres';
    }
    
    if (!formData.categorias) {
      errors.categorias = 'Debe seleccionar una categoría';
    }
    
    if (!formData.nivel) {
      errors.nivel = 'Debe seleccionar un nivel';
    }
    
    if (!formData.duracion || formData.duracion < 5) {
      errors.duracion = 'La duración debe ser de al menos 5 minutos';
    }
    
    if (!formData.actividad) {
      errors.actividad = 'Debe seleccionar un tipo de actividad';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Funciones CRUD
  const handleCreate = (): void => {
    setEditingRecord(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categorias: '',
      nivel: null,
      duracion: null,
      actividad: ''
    });
    setFormErrors({});
    setIsModalVisible(true);
  };

  const handleEdit = (record: Seccion): void => {
    setEditingRecord(record);
    setFormData({
      nombre: record.nombre,
      descripcion: record.descripcion,
      categorias: record.categorias,
      nivel: record.nivel,
      duracion: record.duracion,
      actividad: record.actividad
    });
    setFormErrors({});
    setIsModalVisible(true);
  };

  const handleDelete = (id: string): void => {
    setData(data.filter(item => item.id !== id));
    message.success('Sección eliminada correctamente');
  };

  const handleModalOk = (): void => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    setTimeout(() => {
      if (editingRecord) {
        // Editar
        setData(data.map(item => 
          item.id === editingRecord.id 
            ? { 
                ...item, 
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                categorias: formData.categorias,
                nivel: formData.nivel!,
                duracion: formData.duracion!,
                actividad: formData.actividad
              }
            : item
        ));
        message.success('Sección actualizada correctamente');
      } else {
        // Crear
        const newRecord: Seccion = {
          id: Date.now().toString(),
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          categorias: formData.categorias,
          nivel: formData.nivel!,
          duracion: formData.duracion!,
          actividad: formData.actividad
        };
        setData([...data, newRecord]);
        message.success('Sección creada correctamente');
      }

      setIsModalVisible(false);
      setLoading(false);
    }, 500);
  };

  const handleModalCancel = (): void => {
    setIsModalVisible(false);
    setFormErrors({});
  };

  const handleRefresh = (): void => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Datos actualizados');
    }, 1000);
  };

  const handleInputChange = (field: keyof FormData, value: string | number | null): void => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo cuando el usuario comience a escribir
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
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
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                Actualizar
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Nueva Sección
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          onRow={() => ({
            style: {
              color: '#2C3E50',
            },
            onMouseEnter: (e) => {
              const row = e.currentTarget as HTMLElement;
              // Forzar color oscuro en todos los elementos de texto
              const textElements = row.querySelectorAll('td, td *, td span, td div');
              textElements.forEach((el) => {
                const element = el as HTMLElement;
                if (!element.classList.contains('ant-btn-primary') && 
                    !element.classList.contains('ant-btn-dangerous')) {
                  element.style.color = '#2C3E50';
                }
              });
            },
            onMouseLeave: (e) => {
              const row = e.currentTarget as HTMLElement;
              // Restaurar colores originales
              const textElements = row.querySelectorAll('td, td *, td span, td div');
              textElements.forEach((el) => {
                const element = el as HTMLElement;
                if (!element.classList.contains('ant-btn-primary') && 
                    !element.classList.contains('ant-btn-dangerous')) {
                  element.style.color = '#2C3E50';
                }
              });
            }
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} secciones`,
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? 'Editar Sección' : 'Nueva Sección'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={600}
        okText={editingRecord ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
        getContainer={() => document.body}
        zIndex={1050}
        styles={{
          mask: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
            backgroundColor: 'rgba(0, 0, 0, 0.45)'
          },
          wrapper: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }
        }}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Nombre de la Sección *
            </label>
            <Input
              placeholder="Ej. Paleontología"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              status={formErrors.nombre ? 'error' : ''}
            />
            {formErrors.nombre && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>
                {formErrors.nombre}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Descripción *
            </label>
            <TextArea
              rows={3}
              placeholder="Describe la sección del museo..."
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              status={formErrors.descripcion ? 'error' : ''}
            />
            {formErrors.descripcion && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>
                {formErrors.descripcion}
              </div>
            )}
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Categoría *
                </label>
                <Select
                  placeholder="Seleccionar categoría"
                  style={{ width: '100%' }}
                  value={formData.categorias || undefined}
                  onChange={(value: string) => handleInputChange('categorias', value)}
                  status={formErrors.categorias ? 'error' : ''}
                >
                  {categoriaOptions.map(categoria => (
                    <Option key={categoria} value={categoria}>
                      {categoria}
                    </Option>
                  ))}
                </Select>
                {formErrors.categorias && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>
                    {formErrors.categorias}
                  </div>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Tipo de Actividad *
                </label>
                <Select
                  placeholder="Seleccionar actividad"
                  style={{ width: '100%' }}
                  value={formData.actividad || undefined}
                  onChange={(value: string) => handleInputChange('actividad', value)}
                  status={formErrors.actividad ? 'error' : ''}
                >
                  {actividadOptions.map(actividad => (
                    <Option key={actividad} value={actividad}>
                      {actividad}
                    </Option>
                  ))}
                </Select>
                {formErrors.actividad && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>
                    {formErrors.actividad}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Nivel *
                </label>
                <Select
                  placeholder="Seleccionar nivel"
                  style={{ width: '100%' }}
                  value={formData.nivel || undefined}
                  onChange={(value: number) => handleInputChange('nivel', value)}
                  status={formErrors.nivel ? 'error' : ''}
                >
                  <Option value={1}>Nivel 1 - Planta Baja</Option>
                  <Option value={2}>Nivel 2 - Primer Piso</Option>
                  <Option value={3}>Nivel 3 - Segundo Piso</Option>
                </Select>
                {formErrors.nivel && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>
                    {formErrors.nivel}
                  </div>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                  Duración (minutos) *
                </label>
                <InputNumber
                  min={5}
                  max={180}
                  style={{ width: '100%' }}
                  placeholder="Ej. 45"
                  value={formData.duracion}
                  onChange={(value: number | null) => handleInputChange('duracion', value)}
                  status={formErrors.duracion ? 'error' : ''}
                />
                {formErrors.duracion && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: 4 }}>
                    {formErrors.duracion}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default SeccionesPage;