import { useState } from 'react';
import type { Zona, CreateZonaData } from '@/types/zona';

export const useZonaModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [editingZona, setEditingZona] = useState<Zona | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(false);
  };

  return {
    isVisible,
    editingZona,
    loading,
    setLoading,
    openCreateModal,
    openEditModal,
    closeModal
  };
};