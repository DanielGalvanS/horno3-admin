// src/components/admin/CrearHorarioForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Select, 
  TimePicker, 
  Button, 
  Space, 
  message,
  Divider,
  Input,
  InputNumber,
  Switch,
  Row,
  Col
} from 'antd';
import { ClockCircleOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { HorarioShow, CreateHorarioShowData } from '@/types/horarioshow';
import { DIAS_SEMANA, TIPOS_SHOW, IDIOMAS } from '@/types/horarioshow';
import type { Zona } from '@/types/zona';

const { TextArea } = Input;

interface CrearHorarioFormProps {
  horario?: HorarioShow;
  onSuccess: () => void;
  onCancel: () => void;
}

const CrearHorarioForm: React.FC<CrearHorarioFormProps> = ({
  horario,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [zonas, setZonas] = useState<Zona[]>([]);

  // Cargar zonas
  useEffect(() => {
    const loadZonas = async () => {
      try {
        const response = await fetch('/api/zonas');
        const result = await response.json();
        if (result.success) {
          setZonas(result.data);
        }
      } catch (error) {
        console.error('Error al cargar zonas:', error);
      }
    };
    loadZonas();
  }, []);

  // Inicializar formulario con datos existentes
  useEffect(() => {
    if (horario) {
      form.setFieldsValue({
        dia: horario.dia,
        hora: dayjs(horario.hora, 'HH:mm'),
        nombre: horario.nombre,
        descripcion: horario.descripcion,
        tipo: horario.tipo,
        duracion: horario.duracion,
        idioma: horario.idioma,
        cupo_maximo: horario.cupo_maximo,
        zona_id: horario.zona_id,
        activo: horario.activo ?? true
      });
    } else {
      form.setFieldsValue({
        activo: true // Default activo = true
      });
    }
  }, [horario, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      console.log('Datos del formulario:', values);

      // Preparar datos
      const horarioData: CreateHorarioShowData = {
        dia: values.dia,
        hora: values.hora.format('HH:mm'),
        nombre: values.nombre,
        descripcion: values.descripcion,
        tipo: values.tipo,
        duracion: values.duracion,
        idioma: values.idioma,
        cupo_maximo: values.cupo_maximo,
        zona_id: values.zona_id,
        activo: values.activo
      };

      console.log('Datos a enviar:', horarioData);

      // Determinar si es creación o actualización
      const isEdit = !!horario;
      const url = isEdit ? `/api/horarios/${horario.id}` : '/api/horarios';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(horarioData),
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      if (result.success) {
        message.success(
          isEdit 
            ? 'Horario actualizado exitosamente' 
            : 'Horario creado exitosamente'
        );
        form.resetFields();
        onSuccess();
      } else {
        throw new Error(result.error || 'Error en la operación');
      }
    } catch (error: any) {
      console.error('Error:', error);
      message.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: 24, 
        gap: 8 
      }}>
        <ClockCircleOutlined style={{ color: '#FF6B35', fontSize: 20 }} />
        <span style={{ fontSize: 16, fontWeight: 600 }}>
          {horario ? 'Editar Horario' : 'Nuevo Horario'}
        </span>
      </div>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Día de la semana"
              name="dia"
              rules={[
                { required: true, message: 'Por favor selecciona un día' }
              ]}
            >
              <Select placeholder="Seleccionar día" size="large">
                {DIAS_SEMANA.map(dia => (
                  <Select.Option key={dia.value} value={dia.value}>
                    {dia.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Hora del show"
              name="hora"
              rules={[
                { required: true, message: 'Por favor selecciona una hora' }
              ]}
            >
              <TimePicker
                format="HH:mm"
                placeholder="Seleccionar hora"
                size="large"
                style={{ width: '100%' }}
                minuteStep={15}
                showNow={false}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Nombre del show"
          name="nombre"
        >
          <Input 
            placeholder="Ej: Show de Robótica" 
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Descripción"
          name="descripcion"
        >
          <TextArea 
            rows={3}
            placeholder="Descripción del show..."
            size="large"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tipo de show"
              name="tipo"
            >
              <Select placeholder="Seleccionar tipo" size="large">
                {TIPOS_SHOW.map(tipo => (
                  <Select.Option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Duración (minutos)"
              name="duracion"
            >
              <InputNumber
                min={5}
                max={180}
                placeholder="30"
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Cupo máximo"
              name="cupo_maximo"
            >
              <InputNumber
                min={1}
                max={500}
                placeholder="50"
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Idioma"
              name="idioma"
            >
              <Select placeholder="Seleccionar idioma" size="large">
                {IDIOMAS.map(idioma => (
                  <Select.Option key={idioma.value} value={idioma.value}>
                    {idioma.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Zona relacionada (opcional)"
              name="zona_id"
            >
              <Select 
                placeholder="Seleccionar zona" 
                size="large"
                allowClear
              >
                {zonas.map(zona => (
                  <Select.Option key={zona.id} value={zona.id}>
                    {zona.nombre}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Estado"
          name="activo"
          valuePropName="checked"
        >
          <Switch 
            checkedChildren="Activo" 
            unCheckedChildren="Inactivo"
          />
        </Form.Item>

        <Divider />

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button size="large" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              {horario ? 'Actualizar Horario' : 'Crear Horario'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export { CrearHorarioForm };
export default CrearHorarioForm;