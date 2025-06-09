// src/app/(DashboardLayout)/utilities/SeccionesPage/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { SeccionesTable } from './SeccionesTable';
import { SeccionesHeader } from './SeccionesHeader';
import { ZonaModal } from './ZonaModal';
import type { Zona, CreateZonaData } from '@/types/zona';

const SeccionesPage: React.FC = () => {
  const { user } = useAuth();
  
  // ✅ Estado usando useState (como en noticias) en lugar de hooks
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // ✅ Estado del modal (como en noticias) en lugar de useZonaModal
  const [isVisible, setIsVisible] = useState(false);
  const [editingZona, setEditingZona] = useState<Zona | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // ✅ Cargar zonas usando API directa (como en noticias)
  const fetchZonas = async () => {
    try {
      setLoading(true);
      console.log('Cargando zonas desde API...');
      
      const response = await fetch('/api/zonas');
      const result = await response.json();
      
      console.log('Respuesta de zonas:', result);

      if (result.success) {
        setZonas(result.data);
      } else {
        throw new Error(result.error || 'Error al cargar zonas');
      }
    } catch (error: any) {
      console.error('Error al cargar zonas:', error);
      message.error(`Error al cargar secciones: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Crear zona usando API directa (como en noticias)
  const createZona = async (zonaData: CreateZonaData): Promise<boolean> => {
    try {
      console.log('Creando zona...');
      
      const response = await fetch('/api/zonas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zonaData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      if (result.success) {
        // Agregar la nueva zona al estado
        setZonas(prev => [...prev, result.data]);
        message.success('Sección creada correctamente');
        return true;
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error al crear zona:', error);
      message.error(`Error al crear sección: ${error.message}`);
      return false;
    }
  };

  // ✅ Actualizar zona usando API directa (como en noticias)
  const updateZona = async (id: string, zonaData: CreateZonaData): Promise<boolean> => {
    try {
      console.log(`Actualizando zona ${id}...`);
      
      const response = await fetch(`/api/zonas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zonaData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }

      if (result.success) {
        // Actualizar la zona en el estado
        setZonas(prev => prev.map(zona => zona.id === id ? result.data : zona));
        message.success('Sección actualizada correctamente');
        return true;
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error al actualizar zona:', error);
      message.error(`Error al actualizar sección: ${error.message}`);
      return false;
    }
  };

  // ✅ Eliminar zona usando API directa (como en noticias)
  const deleteZona = async (id: string): Promise<boolean> => {
    try {
      console.log(`Eliminando zona ${id}...`);
      
      const response = await fetch(`/api/zonas/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Remover la zona del estado
        setZonas(prev => prev.filter(zona => zona.id !== id));
        message.success('Sección eliminada correctamente');
        return true;
      } else {
        throw new Error(result.error || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('Error al eliminar zona:', error);
      message.error(`Error al eliminar sección: ${error.message}`);
      return false;
    }
  };

// En tu página principal de secciones
const handleToggleActive = async (id: string, activo: boolean): Promise<boolean> => {
  try {
    const response = await fetch(`/api/zonas/${id}`, {
      method: 'PATCH', // 🆕 Usar PATCH en lugar de PUT
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.message); // Log del mensaje de éxito
      
      // Recargar datos
      await fetchZonas(); // Tu función para recargar las zonas
      return true;
    } else {
      const error = await response.json();
      console.error('Error:', error.error);
      return false;
    }
  } catch (error) {
    console.error('Error updating zona active state:', error);
    return false;
  }
};

  // ✅ Funciones del modal (como en noticias)
  const openCreateModal = () => {
    setEditingZona(null);
    setIsVisible(true);
  };

  const openEditModal = (zona: Zona) => {
    setEditingZona(zona);
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setEditingZona(null);
    setModalLoading(false);
  };

  // ✅ Cargar datos al montar el componente
  useEffect(() => {
    fetchZonas();
  }, []);

  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3>Acceso no autorizado</h3>
        <p>Debes iniciar sesión para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: '24px' }}>
        <Card>
          <SeccionesHeader 
            onRefresh={fetchZonas}
            loading={loading}
            onSearch={setSearchText}
            onCreateClick={openCreateModal}
          />
          <SeccionesTable 
            zonas={zonas}
            loading={loading}
            onDelete={deleteZona}
            onEditClick={openEditModal}
            onToggleActive={handleToggleActive}
            searchText={searchText}
          />
        </Card>
        <ZonaModal
          isVisible={isVisible}
          editingZona={editingZona}
          loading={modalLoading}
          onClose={closeModal}
          onSave={createZona}
          onUpdate={updateZona}
          setLoading={setModalLoading}
        />
      </div>
    </>
  );
};

export default SeccionesPage;