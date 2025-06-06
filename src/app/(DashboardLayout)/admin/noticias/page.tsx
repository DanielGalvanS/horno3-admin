// src/app/admin/noticias/page.tsx

'use client';

import React from 'react';
import { ListarNoticias } from '@/components/admin/ListarNoticias';

export default function AdminNoticiasPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '24px' 
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto' 
      }}>
        <ListarNoticias />
      </div>
    </div>
  );
}

// Si prefieres una versión más simple para probar:
// export default function AdminNoticiasPage() {
//   return <ListarNoticias />;
// }