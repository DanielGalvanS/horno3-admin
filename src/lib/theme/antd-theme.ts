// src/lib/theme/antd-theme.ts
import type { ThemeConfig } from 'antd';

export const museumTheme: ThemeConfig = {
  token: {
    // ✅ COLORES REALES DE TU APP
    colorPrimary: '#FF6B35', // Naranja principal de tu app
    colorSuccess: '#52c41a',
    colorWarning: '#faad14', 
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    
    // Typography
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    
    // Spacing
    padding: 16,
    margin: 16,
    
    // Border radius para look moderno
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    
    // Shadows para depth
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.12)',
    
    // Background colors
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',
  },
  components: {
    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
      boxShadowTertiary: '0 4px 20px rgba(255, 107, 53, 0.08)',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 24,
    },
    Table: {
      borderRadiusLG: 12,
      headerBg: '#fafafa',
      headerColor: '#595959',
      rowHoverBg: '#fff5f2',
    },
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
      bodyBg: '#f5f5f5',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(255, 107, 53, 0.1)',
      itemSelectedColor: '#FF6B35',
      itemHoverBg: 'rgba(255, 107, 53, 0.05)',
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 32,
    }
  },
  algorithm: undefined,
};

// ✅ COLORES ACTUALIZADOS PARA GRÁFICOS
export const chartColors = [
  '#FF6B35', // Naranja principal
  '#FF8A65', // Naranja claro
  '#FF7043', // Naranja medio
  '#FF5722', // Naranja oscuro
  '#FF9800', // Naranja amber
  '#FFB74D', // Naranja suave
  '#FFCC02', // Amarillo complementario
  '#FFA726', // Naranja dorado
];

// ✅ GRADIENTES CON TUS COLORES REALES
export const gradients = {
  primary: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
  secondary: 'linear-gradient(135deg, #FF7043 0%, #FF9800 100%)',
  success: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
  warning: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)',
  info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  card: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  museum: 'linear-gradient(135deg, #FF6B35 0%, #FF7043 50%, #FF8A65 100%)',
};