// src/components/providers/ThemeProvider.tsx
'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import { museumTheme } from '@/lib/theme/antd-theme';
import esES from 'antd/locale/es_ES';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ConfigProvider 
      theme={museumTheme}
      locale={esES}
      componentSize="middle"
    >
      {children}
    </ConfigProvider>
  );
};