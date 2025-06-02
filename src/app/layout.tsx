// src/app/layout.tsx
'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { museoHorno3Theme } from '@/utils/theme/DefaultColors';
import { AuthProvider } from '@/hooks/useAuth'; // ← AGREGAR

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true}>
        <ThemeProvider theme={museoHorno3Theme}>
          <CssBaseline />
          <AuthProvider> 
            {children}
          </AuthProvider> 
        </ThemeProvider>
      </body>
    </html>
  );
}