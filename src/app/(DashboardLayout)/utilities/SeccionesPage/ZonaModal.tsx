// src/app/(DashboardLayout)/utilities/SeccionesPage/ZonaModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  Select, 
  Row, 
  Col, 
  InputNumber, 
  Switch, 
  Upload, 
  message, 
  Image,
  Button,
  Space
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  PictureOutlined 
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { Zona } from '@/types/zona';

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
  activo: boolean;
}

interface ZonaModalProps {
  isVisible: boolean;
  editingZona: Zona | null;
  loading: boolean;
  onClose: () => void;
  setLoading: (loading: boolean) => void;
  onSave: (formData: FormData) => Promise<boolean>;
  onUpdate: (id: string, formData: FormData) => Promise<boolean>;
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
    activo: true
  });
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  
  // 🖼️ ESTADOS PARA IMAGEN - Estilo idéntico a NoticiaForm
  const [imageUrl, setImageUrl] = useState<string | undefined>(editingZona?.imagen_url || undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const isEditing = !!editingZona;

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

  // ✅ Validación local simple
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

  // 🖼️ MANEJAR CAMBIO DE IMAGEN - Estilo idéntico a NoticiaForm
  const handleImageChange: UploadProps['onChange'] = (info) => {
    const { file, fileList } = info;
    
    setFileList(fileList.slice(-1)); // Solo mantener el último archivo

    if (file.status === 'done' || file.originFileObj) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      if (file.originFileObj) {
        reader.readAsDataURL(file.originFileObj);
      }
    }
  };

  // 🖼️ VALIDAR ARCHIVO ANTES DE SUBIR - Estilo idéntico a NoticiaForm
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo puedes subir archivos de imagen');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('La imagen debe ser menor a 5MB');
      return false;
    }

    return false; // Evitar upload automático
  };

  // 🖼️ REMOVER IMAGEN - Estilo idéntico a NoticiaForm
  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setFileList([]);
  };

  // Configurar formulario en modo edición
  useEffect(() => {
    if (isVisible) {
      if (isEditing && editingZona) {
        // Modo edición - cargar datos existentes
        setFormData({
          nombre: editingZona.nombre,
          descripcion: editingZona.descripcion || '',
          categorias: editingZona.categorias?.[0] || '',
          nivel: editingZona.nivel || 1,
          duracion: editingZona.duracion,
          actividad: editingZona.actividad,
          activo: editingZona.activo ?? true
        });
        
        // 🖼️ Cargar imagen existente
        setImageUrl(editingZona.imagen_url || undefined);
        
      } else {
        // Modo creación - resetear formulario
        setFormData({
          nombre: '',
          descripcion: '',
          categorias: '',
          nivel: 1,
          duracion: 30,
          actividad: 'baja',
          activo: true
        });
        // 🖼️ Resetear imagen
        setImageUrl(undefined);
      }
      
      // Resetear estados
      setFileList([]);
      setFormErrors({});
    }
  }, [isVisible, editingZona, isEditing]);

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
      console.log('=== Enviando formulario de zona ===');
      console.log('Values:', formData);
      console.log('FileList:', fileList);

      // 🖼️ Crear FormData - Estilo idéntico a NoticiaForm
      const submitFormData = new FormData();
      
      // Agregar campos del formulario
      submitFormData.append('nombre', formData.nombre);
      submitFormData.append('descripcion', formData.descripcion || '');
      submitFormData.append('categorias', JSON.stringify(formData.categorias ? [formData.categorias] : []));
      submitFormData.append('nivel', formData.nivel.toString());
      submitFormData.append('duracion', formData.duracion.toString());
      submitFormData.append('actividad', formData.actividad);
      submitFormData.append('activo', formData.activo.toString());

      // 🖼️ Agregar imagen si hay una nueva
      if (fileList[0]?.originFileObj) {
        submitFormData.append('imagen', fileList[0].originFileObj);
      }

      let success = false;
      
      if (isEditing && editingZona) {
        console.log(`Actualizando zona ${editingZona.id}`);
        success = await onUpdate(editingZona.id, submitFormData);
      } else {
        console.log('Creando nueva zona');
        success = await onSave(submitFormData);
      }

      if (success) {
        // Limpiar formulario
        setFormData({
          nombre: '',
          descripcion: '',
          categorias: '',
          nivel: 1,
          duracion: 30,
          actividad: 'baja',
          activo: true
        });
        setImageUrl(undefined);
        setFileList([]);
        onClose();
      }
    } catch (error) {
      console.error('Error in modal submit:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🖼️ BOTÓN DE UPLOAD - Estilo idéntico a NoticiaForm
  const uploadButton = (
    <div style={{ textAlign: 'center' }}>
      <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
      <div style={{ marginTop: 8, color: '#999' }}>
        Subir imagen
      </div>
    </div>
  );

  return (
    <Modal
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8 
        }}>
          <PictureOutlined style={{ color: '#FF6B35', fontSize: 20 }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            {isEditing ? 'Editar Sección' : 'Nueva Sección'}
          </span>
        </div>
      }
      open={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      width={800}
      okText={isEditing ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
      okButtonProps={{
        style: { 
          minWidth: 100
        }
      }}
      cancelButtonProps={{
        style: { 
          minWidth: 100
        }
      }}
    >
      <div style={{ padding: '8px 0' }}>
        
        {/* 🆕 CAMPO ESTADO ACTIVO - Mejorado */}
        <div style={{ 
          marginBottom: 24, 
          padding: '16px 20px', 
          background: formData.activo 
            ? 'linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)' 
            : 'linear-gradient(135deg, #fff7e6 0%, #fef3e2 100%)',
          border: `2px solid ${formData.activo ? '#52c41a' : '#fa8c16'}`,
          borderRadius: 12,
          boxShadow: formData.activo 
            ? '0 4px 12px rgba(82, 196, 26, 0.15)' 
            : '0 4px 12px rgba(250, 140, 22, 0.15)',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: 6 
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: formData.activo ? '#52c41a' : '#fa8c16',
                  boxShadow: `0 0 0 2px ${formData.activo ? '#52c41a20' : '#fa8c1620'}`
                }} />
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: '15px',
                  color: formData.activo ? '#389e0d' : '#d46b08'
                }}>
                  Estado de la Sección
                </span>
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#666',
                lineHeight: '1.4'
              }}>
                {formData.activo 
                  ? 'La sección estará visible y disponible para todos los visitantes del museo'
                  : 'La sección estará oculta y no aparecerá en el recorrido del museo'
                }
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '4px'
            }}>
              <Switch
                checked={formData.activo}
                onChange={(checked) => handleInputChange('activo', checked)}
                size="default"
                style={{
                  backgroundColor: !formData.activo ? '#fa8c16' : undefined
                }}
              />
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 500,
                color: formData.activo ? '#52c41a' : '#fa8c16'
              }}>
                {formData.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>
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
            size="large"
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
            rows={4}
            placeholder="Describe la sección del museo en detalle..."
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            status={formErrors.descripcion ? 'error' : ''}
            showCount
            maxLength={2000}
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
                size="large"
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
                size="large"
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
                size="large"
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
                size="large"
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

        {/* 🖼️ SECCIÓN DE IMAGEN - Estilo idéntico a NoticiaForm */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Imagen de la Sección
          </label>
          <div>
            {imageUrl ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Image
                  width={200}
                  height={150}
                  src={imageUrl}
                  alt="Preview"
                  style={{ 
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9'
                  }}
                  preview={{
                    zIndex: 99999,
                    maskStyle: { 
                      zIndex: 99998 
                    },
                    getContainer: () => document.body
                  }}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveImage}
                  size="small"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(255, 77, 79, 0.2)',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px'
                  }}
                  title="Eliminar imagen"
                />
              </div>
            ) : (
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleImageChange}
                beforeUpload={beforeUpload}
                maxCount={1}
                accept="image/*"
              >
                {uploadButton}
              </Upload>
            )}
          </div>
          <div style={{ 
            paddingTop: '8px', 
            color: '#666',
            fontSize: '14px'
          }}>
            Formatos admitidos: JPG, PNG, WebP. Tamaño máximo: 5MB
          </div>
        </div>
      </div>
    </Modal>
  );
};