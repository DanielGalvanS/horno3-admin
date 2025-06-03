// src/app/(DashboardLayout)/utilities/SeccionesPage/ZonaModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Row, Col, InputNumber } from 'antd';
import type { CreateZonaData, ValidationErrors, Zona } from '@/types/zona';
import { validateZonaForm } from '@/utils/validation';

const { TextArea } = Input;
const { Option } = Select;

interface ZonaModalProps {
  isVisible: boolean; // ✅ Recibir estado como prop
  editingZona: Zona | null; // ✅ Recibir zona en edición como prop
  loading: boolean; // ✅ Recibir loading como prop
  onClose: () => void; // ✅ Recibir función de cerrar como prop
  setLoading: (loading: boolean) => void; // ✅ Recibir función de loading como prop
  onSave: (data: CreateZonaData) => Promise<boolean>;
  onUpdate: (id: string, data: CreateZonaData) => Promise<boolean>;
}

export const ZonaModal: React.FC<ZonaModalProps> = ({
  isVisible, // ✅ Usar props en lugar de hook local
  editingZona, // ✅ Usar props en lugar de hook local
  loading, // ✅ Usar props en lugar de hook local
  onClose, // ✅ Usar props en lugar de hook local
  setLoading, // ✅ Usar props en lugar de hook local
  onSave,
  onUpdate
}) => {
  const [formData, setFormData] = useState<CreateZonaData>({
    nombre: '',
    descripcion: '',
    categorias: '',
    nivel: 1,
    duracion: 30,
    actividad: 'baja'
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

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isVisible) { // ✅ Usar prop en lugar de modal.isVisible
      if (editingZona) { // ✅ Usar prop en lugar de modal.editingZona
        // Modo edición - cargar datos existentes
        setFormData({
          nombre: editingZona.nombre,
          descripcion: editingZona.descripcion,
          categorias: editingZona.categorias[0] || '',
          nivel: editingZona.nivel,
          duracion: editingZona.duracion,
          actividad: editingZona.actividad
        });
      } else {
        // Modo creación - resetear formulario
        setFormData({
          nombre: '',
          descripcion: '',
          categorias: '',
          nivel: 1,
          duracion: 30,
          actividad: 'baja'
        });
      }
      setFormErrors({});
    }
  }, [isVisible, editingZona]); // ✅ Usar props en lugar de modal states

  const handleInputChange = (field: keyof CreateZonaData, value: string | number) => {
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

    setLoading(true); // ✅ Usar prop en lugar de modal.setLoading

    try {
      let success = false;
      
      if (editingZona) { // ✅ Usar prop en lugar de modal.editingZona
        success = await onUpdate(editingZona.id, formData);
      } else {
        success = await onSave(formData);
      }

      if (success) {
        onClose(); // ✅ Usar prop en lugar de modal.closeModal
      }
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setLoading(false); // ✅ Usar prop en lugar de modal.setLoading
    }
  };

  return (
    <Modal
      title={editingZona ? 'Editar Sección' : 'Nueva Sección'} // ✅ Usar prop
      open={isVisible} // ✅ Usar prop en lugar de modal.isVisible
      onOk={handleOk}
      onCancel={onClose} // ✅ Usar prop en lugar de modal.closeModal
      confirmLoading={loading} // ✅ Usar prop en lugar de modal.loading
      width={600}
      okText={editingZona ? 'Actualizar' : 'Crear'} // ✅ Usar prop
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
                onChange={(value: string) => handleInputChange('actividad', value)}
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