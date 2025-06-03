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
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const { TextArea } = Input;
const { Option } = Select;

// Interfaces TypeScript
interface Zona {
  id: string;
  nombre: string;
  descripcion: string;
  categorias: string[]; // Array en la BD
  nivel: number;
  duracion: number;
  actividad: string;
}

interface FormData {
  nombre: string;
  descripcion: string;
  categorias: string; // String en el form
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

const SeccionesPage: React.FC = () => {
  const { user } = useAuth(); // Verificar autenticación
  const [messageApi, contextHolder] = message.useMessage(); // Hook correcto para mensajes
  const [data, setData] = useState<Zona[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false); // Loading específico para el modal
  const [deletingId, setDeletingId] = useState<string | null>(null); // Loading específico para eliminar
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<Zona | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<Zona[]>([]);
  
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

  // VALORES CORRECTOS según la restricción CHECK de la base de datos
  const actividadOptions: string[] = [
    'baja',
    'media', 
    'alta'
  ];

  // Función para obtener etiquetas amigables para mostrar
  const getActividadLabel = (value: string): string => {
    const labels: { [key: string]: string } = {
      'baja': 'Baja Intensidad',
      'media': 'Media Intensidad',
      'alta': 'Alta Intensidad'
    };
    return labels[value] || value;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user) {
      fetchZonas();
    }
  }, [user]);

  // Filtrar datos basado en búsqueda
  useEffect(() => {
    const filtered = data.filter(item =>
      item.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchText.toLowerCase()) ||
      item.categorias.some(cat => 
        cat.toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [data, searchText]);

  // No mostrar nada si no hay usuario autenticado
  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3>Acceso no autorizado</h3>
        <p>Debes iniciar sesión para acceder a esta página.</p>
      </div>
    );
  }

  // 🗄️ FUNCIONES DE BASE DE DATOS

  // Obtener todas las zonas
  const fetchZonas = async () => {
    try {
      setLoading(true);
      setDeletingId(null); // Resetear estado de eliminación
      
      const { data: zonas, error } = await supabase
        .from('zona')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Error desconocido al obtener zonas');
      }

      setData(zonas || []);
    } catch (error: any) {
      console.error('Error fetching zonas:', error);
      messageApi.error('Error al cargar las secciones: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva zona
  const createZona = async (zonaData: FormData) => {
    setModalLoading(true);
    try {
      console.log('Creando zona con datos:', zonaData);
      
      const newZonaData = {
        // id se genera automáticamente en la base de datos
        nombre: zonaData.nombre.trim(),
        descripcion: zonaData.descripcion.trim(),
        categorias: [zonaData.categorias], // Convertir string a array
        nivel: zonaData.nivel,
        duracion: zonaData.duracion,
        actividad: zonaData.actividad.trim()
      };
      
      console.log('Datos a insertar:', newZonaData);

      const { data: newZona, error } = await supabase
        .from('zona')
        .insert([newZonaData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error en create:', error);
        console.log('Datos que se intentaron insertar:', newZonaData);
        
        // Manejar errores específicos
        if (error.message.includes('zona_actividad_check')) {
          throw new Error(`El tipo de actividad "${zonaData.actividad}" no es válido. Solo se permiten: baja, media, alta.`);
        }
        
        if (error.message.includes('duplicate key')) {
          throw new Error('Ya existe una sección con ese nombre.');
        }
        
        throw new Error(error.message || 'Error desconocido al crear zona');
      }

      console.log('Zona creada exitosamente:', newZona);
      
      // Actualizar la lista local
      setData(prev => [...prev, newZona]);
      messageApi.success('Sección creada correctamente');
      return true;
    } catch (error: any) {
      console.error('Error creating zona:', error);
      messageApi.error('Error al crear la sección: ' + (error.message || 'Error desconocido'));
      return false;
    } finally {
      setModalLoading(false);
    }
  };

  // Actualizar zona existente
  const updateZona = async (id: string, zonaData: FormData) => {
    setModalLoading(true);
    try {
      const updateData = {
        nombre: zonaData.nombre.trim(),
        descripcion: zonaData.descripcion.trim(),
        categorias: [zonaData.categorias], // Convertir string a array
        nivel: zonaData.nivel,
        duracion: zonaData.duracion,
        actividad: zonaData.actividad.trim()
      };

      console.log('Actualizando zona con ID:', id, 'Datos:', updateData);

      const { data: updatedZona, error } = await supabase
        .from('zona')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error en update:', error);
        console.log('Datos que se intentaron actualizar:', updateData);
        
        if (error.message.includes('zona_actividad_check')) {
          throw new Error(`El tipo de actividad "${zonaData.actividad}" no es válido. Solo se permiten: baja, media, alta.`);
        }
        
        throw new Error(error.message || 'Error desconocido al actualizar zona');
      }

      console.log('Zona actualizada exitosamente:', updatedZona);

      // Actualizar la lista local
      setData(prev => prev.map(item => 
        item.id === id ? updatedZona : item
      ));
      messageApi.success('Sección actualizada correctamente');
      return true;
    } catch (error: any) {
      console.error('Error updating zona:', error);
      messageApi.error('Error al actualizar la sección: ' + (error.message || 'Error desconocido'));
      return false;
    } finally {
      setModalLoading(false);
    }
  };

  // Eliminar zona
  const deleteZona = async (id: string) => {
    setDeletingId(id); 
    try {
      console.log('Eliminando zona con ID:', id);
      
      const { error } = await supabase
        .from('zona')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error en delete:', error);
        throw new Error(error.message || 'Error desconocido al eliminar zona');
      }

      console.log('Zona eliminada exitosamente');

      // Actualizar la lista local
      setData(prev => prev.filter(item => item.id !== id));
      messageApi.success('Sección eliminada correctamente');
      return true;
    } catch (error: any) {
      console.error('Error deleting zona:', error);
      messageApi.error('Error al eliminar la sección: ' + (error.message || 'Error desconocido'));
      return false;
    } finally {
      setDeletingId(null); // Resetear loading de eliminación
    }
  };

  // Configuración de columnas de la tabla
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
              onClick={() => handleEdit(record)}
              disabled={deletingId === record.id} // Deshabilitar si se está eliminando
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Popconfirm
              title="¿Estás seguro de eliminar esta sección?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
              disabled={deletingId === record.id} // Deshabilitar popconfirm si se está eliminando
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                loading={deletingId === record.id} // Mostrar loading solo para este elemento
                disabled={deletingId !== null && deletingId !== record.id} // Deshabilitar otros mientras uno se elimina
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Validación del formulario mejorada
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      errors.nombre = 'El nombre es obligatorio y debe tener al menos 3 caracteres';
    }
    
    if (!formData.descripcion || formData.descripcion.trim().length < 10) {
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
      errors.actividad = 'Debe seleccionar una intensidad de actividad';
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

  const handleEdit = (record: Zona): void => {
    setEditingRecord(record);
    setFormData({
      nombre: record.nombre,
      descripcion: record.descripcion,
      categorias: record.categorias[0] || '', // Convertir array a string
      nivel: record.nivel,
      duracion: record.duracion,
      actividad: record.actividad
    });
    setFormErrors({});
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteZona(id);
    } catch (error) {
      console.error('Error in handleDelete:', error);
      // El error ya se maneja en deleteZona, no necesitamos hacer nada más aquí
    }
  };

  const handleModalOk = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }
    
    // No usar setLoading aquí para evitar conflictos
    try {
      let success = false;
      
      if (editingRecord) {
        success = await updateZona(editingRecord.id, formData);
      } else {
        success = await createZona(formData);
      }

      // Cerrar modal solo si fue exitoso
      if (success) {
        setIsModalVisible(false);
        setFormErrors({});
      }
    } catch (error) {
      console.error('Error in handleModalOk:', error);
      messageApi.error('Error inesperado. Por favor, intenta de nuevo.');
    }
  };

  const handleModalCancel = (): void => {
    setIsModalVisible(false);
    setFormErrors({});
    setModalLoading(false); // Resetear loading del modal
    setDeletingId(null); // Resetear loading de eliminación
  };

  const handleRefresh = async (): Promise<void> => {
    setLoading(true);
    setDeletingId(null); // Resetear estado de eliminación al refrescar
    
    try {
      // Simular mínimo 1 segundo de loading para mejor UX
      const startTime = Date.now();
      
      const { data: zonas, error } = await supabase
        .from('zona')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Supabase error en refresh:', error);
        throw new Error(error.message || 'Error desconocido al actualizar');
      }

      // Asegurar que el loading dure al menos 1 segundo
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(1000 - elapsedTime, 0);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      // Actualizar datos
      setData(zonas || []);
      
      // Mensajes según el resultado
      if (!zonas || zonas.length === 0) {
        messageApi.info('No se encontraron secciones en la base de datos');
      } else {
        messageApi.success(`Datos actualizados - ${zonas.length} sección${zonas.length === 1 ? '' : 'es'} encontrada${zonas.length === 1 ? '' : 's'}`);
      }
      
    } catch (error: any) {
      console.error('Error refreshing zonas:', error);
      messageApi.error('Error al actualizar los datos: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | null): void => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo cuando el usuario comience a escribir
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  return (
    <>
      {contextHolder}
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
                  style={{ width: 250, height: 40, alignContent: 'center', alignItems: 'center' }}
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
          confirmLoading={modalLoading}
          width={600}
          okText={editingRecord ? 'Actualizar' : 'Crear'}
          cancelText="Cancelar"
          getContainer={() => document.body}
          zIndex={1050}
          okButtonProps={{
            style: { 
              minWidth: 100, 
              width: 100,    
            }
          }}
          cancelButtonProps={{
            style: { 
              minWidth: 100, 
              width: 100,    
            }
          }}
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
                    getPopupContainer={(trigger) => trigger.parentElement || document.body}
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
                    Intensidad de Actividad *
                  </label>
                  <Select
                    placeholder="Seleccionar intensidad"
                    style={{ width: '100%' }}
                    value={formData.actividad || undefined}
                    onChange={(value: string) => handleInputChange('actividad', value)}
                    status={formErrors.actividad ? 'error' : ''}
                    getPopupContainer={(trigger) => trigger.parentElement || document.body}
                  >
                    {actividadOptions.map(actividad => (
                      <Option key={actividad} value={actividad}>
                        {getActividadLabel(actividad)}
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
                    getPopupContainer={(trigger) => trigger.parentElement || document.body}
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
    </>
  );
};

export default SeccionesPage;