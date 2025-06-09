// src/app/(DashboardLayout)/utilities/SeccionesPage/ZonaModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Row, Col, InputNumber, Switch } from 'antd';
import type { CreateZonaData, Zona } from '@/types/zona';

const { TextArea } = Input;
const { Option } = Select;

// ✅ Definir ValidationErrors localmente para mantener compatibilidad
interface ValidationErrors {
  [key: string]: string | undefined;
}

// ✅ CreateZonaData local para mantener compatibilidad con el formulario actual
interface LocalCreateZonaData {
  nombre: string;
  descripcion: string;
  categorias: string; // String simple en lugar de array para el formulario
  nivel: number;
  duracion: number;
  actividad: 'baja' | 'media' | 'alta';
  activo: boolean; // 🆕 NUEVO CAMPO
}

interface ZonaModalProps {
  isVisible: boolean;
  editingZona: Zona | null;
  loading: boolean;
  onClose: () => void;
  setLoading: (loading: boolean) => void;
  onSave: (data: CreateZonaData) => Promise<boolean>;
  onUpdate: (id: string, data: CreateZonaData) => Promise<boolean>;
}

export const ZonaModal: React.FC<ZonaModalProps> = ({
  isVisible,
  editingZona,
  loading,
  onClose,
  setLoading,
  onSave,
  onUpdate
}) => {
  const [formData, setFormData] = useState<LocalCreateZonaData>({
    nombre: '',
    descripcion: '',
    categorias: '',
    nivel: 1,
    duracion: 30,
    actividad: 'baja',
    activo: true // 🆕 Por defecto activo
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  // Opciones para los selects
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

  // ✅ Validación local simple (reemplaza validateZonaForm)
  const validateZonaForm = (data: LocalCreateZonaData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!data.nombre || data.nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!data.descripcion || data.descripcion.trim().length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!data.categorias) {
      errors.categorias = 'La categoría es obligatoria';
    }

    if (!data.actividad) {
      errors.actividad = 'La intensidad de actividad es obligatoria';
    }

    if (!data.nivel || data.nivel < 1 || data.nivel > 3) {
      errors.nivel = 'El nivel debe ser entre 1 y 3';
    }

    if (!data.duracion || data.duracion < 5 || data.duracion > 180) {
      errors.duracion = 'La duración debe ser entre 5 y 180 minutos';
    }

    return errors;
  };

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isVisible) {
      if (editingZona) {
        // Modo edición - cargar datos existentes
        setFormData({
          nombre: editingZona.nombre,
          descripcion: editingZona.descripcion || '',
          categorias: editingZona.categorias?.[0] || '',
          nivel: editingZona.nivel || 1,
          duracion: editingZona.duracion,
          actividad: editingZona.actividad,
          activo: editingZona.activo ?? true // 🆕 Cargar estado activo
        });
      } else {
        // Modo creación - resetear formulario
        setFormData({
          nombre: '',
          descripcion: '',
          categorias: '',
          nivel: 1,
          duracion: 30,
          actividad: 'baja',
          activo: true // 🆕 Por defecto activo en nuevas secciones
        });
      }
      setFormErrors({});
    }
  }, [isVisible, editingZona]);

  const handleInputChange = (field: keyof LocalCreateZonaData, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo cuando el usuario comience a escribir
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  const handleOk = async () => {
    // Validar formulario
    const errors = validateZonaForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // ✅ Convertir datos del formulario al formato de la API
      const apiData: CreateZonaData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        categorias: formData.categorias ? [formData.categorias] : null,
        nivel: formData.nivel || null,
        duracion: formData.duracion,
        actividad: formData.actividad,
        activo: formData.activo // 🆕 Incluir estado activo
      };

      let success = false;
      
      if (editingZona) {
        success = await onUpdate(editingZona.id, apiData);
      } else {
        success = await onSave(apiData);
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingZona ? 'Editar Sección' : 'Nueva Sección'}
      open={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      width={600}
      okText={editingZona ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
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
    >
      <div style={{ padding: '8px 0' }}>
        {/* 🆕 CAMPO ESTADO ACTIVO */}
        <div style={{ 
          marginBottom: 24, 
          padding: '12px 16px', 
          background: formData.activo ? '#f6ffed' : '#fff2e8',
          border: `1px solid ${formData.activo ? '#b7eb8f' : '#ffbb96'}`,
          borderRadius: 6 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>
                Estado de la Sección
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {formData.activo 
                  ? 'La sección estará visible y disponible para visitantes'
                  : 'La sección estará oculta y no aparecerá en el museo'
                }
              </div>
            </div>
            <Switch
              checked={formData.activo}
              onChange={(checked) => handleInputChange('activo', checked)}
              checkedChildren="Activa"
              unCheckedChildren="Inactiva"
            />
          </div>
        </div>

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
                Intensidad de Actividad *
              </label>
              <Select
                placeholder="Seleccionar intensidad"
                style={{ width: '100%' }}
                value={formData.actividad || undefined}
                onChange={(value: 'baja' | 'media' | 'alta') => handleInputChange('actividad', value)}
                status={formErrors.actividad ? 'error' : ''}
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
                onChange={(value: number | null) => handleInputChange('duracion', value || 30)}
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
  );
};