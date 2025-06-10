import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { ZonaService } from '@/services/zona.service';
import type { Zona, CreateZonaData } from '@/types/zona';

export const useZonas = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchZonas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ZonaService.getAll();
      setZonas(data);
    } catch (error: any) {
      messageApi.error(`Error al cargar secciones: ${error.message}`);
    } finally {
      setLoading(false);
    }
  },[messageApi]);

  const createZona = async (zonaData: CreateZonaData): Promise<boolean> => {
    try {
      const newZona = await ZonaService.create(zonaData);
      setZonas(prev => [...prev, newZona]);
      messageApi.success('Sección creada correctamente');
      return true;
    } catch (error: any) {
      messageApi.error(`Error al crear sección: ${error.message}`);
      return false;
    }
  };

  const updateZona = async (id: string, zonaData: CreateZonaData): Promise<boolean> => {
    try {
      const updatedZona = await ZonaService.update(id, zonaData);
      setZonas(prev => prev.map(zona => zona.id === id ? updatedZona : zona));
      messageApi.success('Sección actualizada correctamente');
      return true;
    } catch (error: any) {
      messageApi.error(`Error al actualizar sección: ${error.message}`);
      return false;
    }
  };

  const deleteZona = async (id: string): Promise<boolean> => {
    try {
      await ZonaService.delete(id);
      setZonas(prev => prev.filter(zona => zona.id !== id));
      messageApi.success('Sección eliminada correctamente');
      return true;
    } catch (error: any) {
      messageApi.error(`Error al eliminar sección: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    fetchZonas();
  }, [fetchZonas]);

  return {
    zonas,
    loading,
    contextHolder,
    fetchZonas,
    createZona,
    updateZona,
    deleteZona
  };
};