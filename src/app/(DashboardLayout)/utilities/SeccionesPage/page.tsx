// src/app/(DashboardLayout)/utilities/SeccionesPage/page.tsx
"use client";

import React, { useState } from 'react';
import { Card } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { useZonas } from '@/hooks/useZonas';
import { useZonaModal } from '@/hooks/useZonaModal';
import { SeccionesTable } from './SeccionesTable';
import { SeccionesHeader } from './SeccionesHeader';
import { ZonaModal } from './ZonaModal';

const SeccionesPage: React.FC = () => {
  const { user } = useAuth();
  const zonas = useZonas();
  const modal = useZonaModal();
  const [searchText, setSearchText] = useState('');

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
      {zonas.contextHolder}
      <div style={{ padding: '24px' }}>
        <Card>
          <SeccionesHeader 
            onRefresh={zonas.fetchZonas}
            loading={zonas.loading}
            onSearch={setSearchText}
            onCreateClick={modal.openCreateModal}
          />
          <SeccionesTable 
            zonas={zonas.zonas}
            loading={zonas.loading}
            onDelete={zonas.deleteZona}
            onEditClick={modal.openEditModal}
            searchText={searchText}
          />
        </Card>
        <ZonaModal
          isVisible={modal.isVisible}
          editingZona={modal.editingZona}
          loading={modal.loading}
          onClose={modal.closeModal}
          onSave={zonas.createZona}
          onUpdate={zonas.updateZona}
          setLoading={modal.setLoading}
        />
      </div>
    </>
  );
};

export default SeccionesPage;