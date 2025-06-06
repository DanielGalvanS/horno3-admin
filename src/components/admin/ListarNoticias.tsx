// src/components/admin/ListarNoticias.tsx

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
  Image,
  Modal,
  Input,
  Select,
  Typography
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  EyeOutlined,
  SearchOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { ZonaService } from '@/services/zona.service';
import { CrearNoticiaForm } from './CrearNoticiaForm';
import type { Noticia } from '@/types/noticia';
import type { Zona } from '@/types/zona';

const { Search } = Input;
const { Text } = Typography;

// Tipo local para las columnas de la tabla
interface ColumnType {
  title: string;
  dataIndex?: string;
  key: string;
  width?: number;
  render?: (value: any, record: Noticia) => React.ReactNode;
  sorter?: (a: Noticia, b: Noticia) => number;
}

export const ListarNoticias: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | undefined>();
  const [searchText, setSearchText] = useState('');
  const [filtroZona, setFiltroZona] = useState<string | undefined>();

  // Cargar datos iniciales
  useEffect(() => {
    loadNoticias();
    loadZonas();
  }, []);

  // Cargar noticias usando API
  const loadNoticias = async () => {
    setLoading(true);
    try {
      console.log('Cargando noticias desde API...');
      
      const response = await fetch('/api/noticias');
      const result = await response.json();
      
      console.log('Respuesta de noticias:', result);

      if (result.success) {
        setNoticias(result.data);
      } else {
        throw new Error(result.error || 'Error al cargar noticias');
      }
    } catch (error: any) {
      console.error('Error al cargar noticias:', error);
      message.error('Error al cargar noticias: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadZonas = async () => {
    try {
      const data = await ZonaService.getAll();
      setZonas(data);
    } catch (error: any) {
      console.error('Error al cargar zonas:', error);
      message.error('Error al cargar zonas: ' + error.message);
    }
  };

  // Filtrar noticias - ✅ Arreglado con verificaciones null
  const noticiasFilteredFull = noticias.filter(noticia => {
    const matchesSearch = searchText === '' || 
      (noticia.titulo?.toLowerCase().includes(searchText.toLowerCase()) ?? false) ||
      (noticia.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ?? false);
    
    const matchesZona = !filtroZona || noticia.zona_id === filtroZona;
    
    return matchesSearch && matchesZona;
  });

  // Manejar eliminación usando API
  const handleDelete = async (id: string) => {
    try {
      console.log(`Eliminando noticia ${id}...`);
      
      const response = await fetch(`/api/noticias/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        message.success('Noticia eliminada exitosamente');
        loadNoticias(); // Recargar lista
      } else {
        throw new Error(result.error || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Error al eliminar noticia:', error);
      message.error('Error al eliminar noticia: ' + error.message);
    }
  };

  // Abrir modal
  const openModal = (mode: 'create' | 'edit' | 'view', noticia?: Noticia) => {
    setModalMode(mode);
    setSelectedNoticia(noticia);
    setModalVisible(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedNoticia(undefined);
  };

  // Manejar éxito del formulario
  const handleFormSuccess = () => {
    closeModal();
    loadNoticias(); // Recargar lista
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Columnas de la tabla
  const columns: ColumnType[] = [
    {
      title: 'Imagen',
      dataIndex: 'imagen_url',
      key: 'imagen',
      width: 80,
      render: (imagen_url: string) => (
        imagen_url ? (
          <Image
            width={50}
            height={40}
            src={imagen_url}
            alt="Noticia"
            style={{ objectFit: 'cover', borderRadius: '4px' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div style={{ 
            width: 50, 
            height: 40, 
            background: '#f5f5f5', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Sin imagen</Text>
          </div>
        )
      ),
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (text: string | null) => (
        <Text style={{ fontWeight: 500 }}>{text || 'Sin título'}</Text>
      ),
    },
    {
      title: 'Zona',
      dataIndex: 'zona',
      key: 'zona',
      width: 150,
      render: (zona: any) => (
        zona ? (
          <Tag color="blue">{zona.nombre}</Tag>
        ) : (
          <Tag color="default">Sin zona</Tag>
        )
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_publicacion',
      key: 'fecha',
      width: 150,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.fecha_publicacion).getTime() - new Date(b.fecha_publicacion).getTime(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 150,
      render: (_, record: Noticia) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openModal('view', record)}
            title="Ver detalles"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openModal('edit', record)}
            title="Editar"
          />
          <Popconfirm
            title="¿Estás seguro de eliminar esta noticia?"
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
            <ReadOutlined style={{ color: '#FF6B35' }} />
            <span>Gestión de Noticias</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openModal('create')}
            size="large"
          >
            Nueva Noticia
          </Button>
        }
      >
        {/* Filtros */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Search
              placeholder="Buscar noticias..."
              allowClear
              style={{ width: 300 }}
              onSearch={setSearchText}
              onChange={(e) => e.target.value === '' && setSearchText('')}
            />
            
            <Select
              placeholder="Filtrar por zona"
              style={{ width: 200 }}
              allowClear
              value={filtroZona}
              onChange={setFiltroZona}
            >
              {zonas.map(zona => (
                <Select.Option key={zona.id} value={zona.id}>
                  {zona.nombre}
                </Select.Option>
              ))}
            </Select>
          </Space>
        </div>

        {/* Tabla */}
        <Table
          columns={columns}
          dataSource={noticiasFilteredFull}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} noticias`,
          }}
        />
      </Card>

      {/* Modal para crear/editar/ver */}
      <Modal
        title={
          modalMode === 'create' ? 'Nueva Noticia' :
          modalMode === 'edit' ? 'Editar Noticia' : 'Detalles de la Noticia'
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={modalMode === 'view' ? [
          <Button key="close" onClick={closeModal}>
            Cerrar
          </Button>
        ] : null}
        width={modalMode === 'view' ? 600 : 800}
        destroyOnClose
      >
        {modalMode === 'view' && selectedNoticia ? (
          <div>
            {selectedNoticia.imagen_url && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Image
                  src={selectedNoticia.imagen_url}
                  alt={selectedNoticia.titulo || 'Noticia'} // ✅ Arreglado
                  style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'cover' }}
                />
              </div>
            )}
            <Typography.Title level={4}>
              {selectedNoticia.titulo || 'Sin título'} {/* ✅ Arreglado */}
            </Typography.Title>
            <Typography.Paragraph>
              {selectedNoticia.descripcion || 'Sin descripción'} {/* ✅ Arreglado */}
            </Typography.Paragraph>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Zona: </Text>
                {selectedNoticia.zona ? (
                  <Tag color="blue">{selectedNoticia.zona.nombre}</Tag>
                ) : (
                  <Text type="secondary">Sin zona asignada</Text>
                )}
              </div>
              <div>
                <Text strong>Fecha de publicación: </Text>
                <Text>{formatDate(selectedNoticia.fecha_publicacion)}</Text>
              </div>
            </Space>
          </div>
        ) : (
          <CrearNoticiaForm
            noticia={modalMode === 'edit' ? selectedNoticia : undefined}
            onSuccess={handleFormSuccess}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </div>
  );
};