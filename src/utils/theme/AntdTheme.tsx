import type { ThemeConfig } from 'antd';

// Configuración del tema de Ant Design para coincidir con el tema de MUI
export const antdTheme: ThemeConfig = {
  token: {
    // Fuente - Usar la misma que MUI (Plus Jakarta Sans)
    fontFamily: '"Plus Jakarta Sans", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 40,
    fontSizeHeading2: 32,
    fontSizeHeading3: 28,
    fontSizeHeading4: 24,
    fontSizeHeading5: 20,
    fontWeightStrong: 600,
    
    // Colores primarios - Usar la paleta del museo
    colorPrimary: '#E17055', // Naranja coral principal
    colorSuccess: '#27AE60', // Verde éxito
    colorWarning: '#F39C12', // Amarillo advertencia
    colorError: '#E74C3C',   // Rojo error
    colorInfo: '#3498DB',    // Azul información
    
    // Colores de texto - Coincidir con MUI
    colorText: '#2C3E50',           // Texto principal
    colorTextSecondary: '#7F8C8D',  // Texto secundario
    colorTextTertiary: '#95A5A6',   // Texto terciario
    colorTextQuaternary: '#BDC3C7', // Texto deshabilitado
    
    // Fondos
    colorBgBase: '#FFFFFF',        // Fondo papel
    colorBgContainer: '#FFFFFF',   // Fondo contenedor
    colorBgElevated: '#FFFFFF',    // Fondo elevado
    colorBgLayout: '#F8F9FA',      // Fondo layout
    colorBgSpotlight: '#FAFAFA',   // Fondo destacado
    
    // Bordes
    colorBorder: '#ECF0F1',        // Borde normal
    colorBorderSecondary: '#E0E0E0', // Borde secundario
    borderRadius: 12,              // Radio de borde - coincidir con MUI
    borderRadiusLG: 16,            // Radio grande
    borderRadiusSM: 8,             // Radio pequeño
    borderRadiusXS: 6,             // Radio extra pequeño
    
    // Espaciado - Coincidir con MUI
    controlHeight: 40,             // Altura de controles
    controlHeightLG: 48,           // Altura grande
    controlHeightSM: 32,           // Altura pequeña
    controlHeightXS: 24,           // Altura extra pequeña
    
    // Sombras sutiles
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0px 2px 8px rgba(0, 0, 0, 0.05)',
  },
  
  components: {
    // Botones - Estilo similar a MUI
    Button: {
      fontWeight: 600,
      borderRadius: 12,
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      primaryShadow: '0px 4px 12px rgba(225, 112, 85, 0.3)',
    },
    
    // Inputs - Estilo similar a MUI
    Input: {
      borderRadius: 12,
      controlHeight: 40,
      paddingInline: 16,
    },
    
    InputNumber: {
      borderRadius: 12,
      controlHeight: 40,
      paddingInline: 16,
    },
    
    Select: {
      borderRadius: 12,
      controlHeight: 40,
    },
    
    // Tabla - Mejorar legibilidad
    Table: {
      headerBg: '#FAFAFA',          // Fondo header tabla
      headerColor: '#2C3E50',       // Color texto header
      rowHoverBg: 'rgba(225, 112, 85, 0.04)', // Hover filas
      borderColor: '#ECF0F1',       // Color bordes
      fontSizeIcon: 14,
      controlItemBgHover: 'rgba(225, 112, 85, 0.04)',
    },
    
    // Modal - Estilo similar a MUI
    Modal: {
      borderRadiusLG: 16,
    },
    
    // Card - Estilo similar a MUI
    Card: {
      borderRadiusLG: 16,
    },
    
    // Tag - Mejorar estilo
    Tag: {
      borderRadiusSM: 8,
    },
    
    // Popconfirm
    Popconfirm: {
      borderRadius: 12,
    },
    
    // Tooltip
    Tooltip: {
      borderRadius: 8,
    },
    
    // Space - Consistencia de espaciado
    Space: {
      size: 16,
    },
    
    // Typography - Mejorar jerarquía
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: 8,
    },
    
    // Message y Notification
    Message: {
      borderRadius: 12,
    },
    
    Notification: {
      borderRadiusLG: 16,
    },
  },
  
  algorithm: undefined, // Usar algoritmo por defecto (no dark mode)
};

// Configuración adicional para componentes específicos
export const antdComponentStyles = {
  // Estilos CSS adicionales si necesitas overrides más específicos
  '.ant-btn': {
    fontFamily: '"Plus Jakarta Sans", "Helvetica", "Arial", sans-serif !important',
    textTransform: 'none' as const,
  },
  
  '.ant-table': {
    fontFamily: '"Plus Jakarta Sans", "Helvetica", "Arial", sans-serif !important',
  },
  
  '.ant-typography': {
    fontFamily: '"Plus Jakarta Sans", "Helvetica", "Arial", sans-serif !important',
  },
  
  '.ant-input': {
    fontFamily: '"Plus Jakarta Sans", "Helvetica", "Arial", sans-serif !important',
  },
  
  '.ant-select': {
    fontFamily: '"Plus Jakarta Sans", "Helvetica", "Arial", sans-serif !important',
  },
};

export default antdTheme;