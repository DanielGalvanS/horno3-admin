// src/components/admin/CrearNoticiaForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Upload, 
  Button, 
  Card, 
  message, 
  Space,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  SaveOutlined, 
  PictureOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
// ✅ Import corregido - con punto
import { ZonaService } from '@/services/zona.service';
import type { Noticia, CreateNoticiaData } from '@/types/noticia';
import type { Zona } from '@/types/zona';

interface CrearNoticiaFormProps {
  noticia?: Noticia; // Para modo edición
  onSuccess?: (noticia: Noticia) => void;
  onCancel?: () => void;
}

export const CrearNoticiaForm: React.FC<CrearNoticiaFormProps> = ({
  noticia,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(noticia?.imagen_url || undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const isEditing = !!noticia;

  // Cargar zonas al montar el componente
  useEffect(() => {
    const loadZonas = async () => {
      try {
        const zonasData = await ZonaService.getAll();
        setZonas(zonasData);
      } catch (error) {
        console.error('Error al cargar zonas:', error);
        message.error('Error al cargar las zonas');
      }
    };

    loadZonas();
  }, []);

  // Configurar formulario en modo edición
  useEffect(() => {
    if (isEditing && noticia) {
      form.setFieldsValue({
        titulo: noticia.titulo,
        descripcion: noticia.descripcion,
        zona_id: noticia.zona_id
      });
      
      if (noticia.imagen_url) {
        setImageUrl(noticia.imagen_url);
      }
    }
  }, [isEditing, noticia, form]);

  // Manejar cambio de imagen
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

  // Validar archivo antes de subir
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

  // Remover imagen
  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setFileList([]);
    form.setFieldValue('imagen', undefined);
  };

  // ✅ Enviar formulario usando API
  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      console.log('=== Enviando formulario ===');
      console.log('Values:', values);
      console.log('FileList:', fileList);

      // Crear FormData
      const formData = new FormData();
      formData.append('titulo', values.titulo);
      formData.append('descripcion', values.descripcion);
      
      if (values.zona_id) {
        formData.append('zona_id', values.zona_id);
      }
      
      if (fileList[0]?.originFileObj) {
        formData.append('imagen', fileList[0].originFileObj);
      }

      // Enviar a API
      const url = isEditing ? `/api/noticias/${noticia!.id}` : '/api/noticias';
      const method = isEditing ? 'PUT' : 'POST';

      console.log(`Enviando ${method} a ${url}`);

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const result = await response.json();
      console.log('Respuesta de API:', result);

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      if (result.success) {
        message.success(isEditing ? 'Noticia actualizada exitosamente' : 'Noticia creada exitosamente');
        
        // Limpiar formulario
        form.resetFields();
        setImageUrl(undefined);
        setFileList([]);

        // Llamar callback de éxito
        onSuccess?.(result.data);
      } else {
        throw new Error(result.error || 'Error desconocido');
      }

    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      message.error(error.message || 'Error al procesar la noticia');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div style={{ textAlign: 'center' }}>
      <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
      <div style={{ marginTop: 8, color: '#999' }}>
        Subir imagen
      </div>
    </div>
  );

  return (
    <Card 
      title={
        <Space>
          <PictureOutlined style={{ color: '#FF6B35' }} />
          <span>{isEditing ? 'Editar Noticia' : 'Crear Nueva Noticia'}</span>
        </Space>
      }
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="titulo"
          label="Título de la noticia"
          rules={[
            { required: true, message: 'El título es obligatorio' },
            { min: 5, message: 'El título debe tener al menos 5 caracteres' },
            { max: 200, message: 'El título no puede exceder 200 caracteres' }
          ]}
        >
          <Input 
            placeholder="Ej: Nueva exposición de metalurgia medieval"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="descripcion"
          label="Descripción"
          rules={[
            { required: true, message: 'La descripción es obligatoria' },
            { min: 10, message: 'La descripción debe tener al menos 10 caracteres' },
            { max: 2000, message: 'La descripción no puede exceder 2000 caracteres' }
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Describe la noticia en detalle..."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        <Form.Item
          name="zona_id"
          label="Zona relacionada (opcional)"
        >
          <Select 
            placeholder="Selecciona una zona"
            size="large"
            allowClear
            loading={zonas.length === 0}
          >
            {zonas.map(zona => (
              <Select.Option key={zona.id} value={zona.id}>
                {zona.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="imagen"
          label="Imagen de la noticia"
          extra="Formatos admitidos: JPG, PNG, WebP. Tamaño máximo: 5MB"
        >
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
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleRemoveImage}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }}
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
        </Form.Item>

        <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              icon={<SaveOutlined />}
            >
              {isEditing ? 'Actualizar Noticia' : 'Crear Noticia'}
            </Button>
            
            {onCancel && (
              <Button 
                size="large" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};