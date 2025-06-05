// src/app/layout.tsx
'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { ConfigProvider } from 'antd';
import CssBaseline from '@mui/material/CssBaseline';
import { museoHorno3Theme } from '@/utils/theme/DefaultColors';
import { antdTheme } from '@/utils/theme/AntdTheme';
import { AuthProvider } from '@/hooks/useAuth';
import esES from 'antd/locale/es_ES';
import 'antd/dist/reset.css'; 
import './global.css';
import '@/styles/dashboard.css'; // ✅ Solo agregar esta línea

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning={true}>
        <ThemeProvider theme={museoHorno3Theme}>
          <ConfigProvider 
            theme={antdTheme}
            locale={esES}
          >
            <CssBaseline />
            <AuthProvider> 
              {children}
            </AuthProvider> 
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}