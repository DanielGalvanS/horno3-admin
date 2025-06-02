import { createTheme } from "@mui/material/styles";
import { Plus_Jakarta_Sans } from "next/font/google";

// Declaración de módulo para extender el tema de Material-UI
declare module '@mui/material/styles' {
  interface Palette {
    gradient: {
      primary: string;
      primaryReverse: string;
      subtle: string;
      dark: string;
      overlay: string;
    };
  }

  interface PaletteOptions {
    gradient?: {
      primary?: string;
      primaryReverse?: string;
      subtle?: string;
      dark?: string;
      overlay?: string;
    };
  }

  interface TypeBackground {
    gradient: string;
  }
}

export const plus = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

// Tema para Museo Horno3 con correcciones de TypeScript
const museoHorno3Theme = createTheme({
  direction: "ltr",
  palette: {
    primary: {
      main: "#E17055", // Naranja coral principal del diseño
      light: "#F39C7A", // Versión más clara
      dark: "#D63447", // Versión más oscura/rojiza
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#FF6B35", // Naranja vibrante secundario
      light: "#FF8A65", 
      dark: "#E55722",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F8F9FA", // Fondo claro general
      paper: "#FFFFFF", // Fondo de tarjetas/modales
      gradient: "linear-gradient(135deg, #E17055 0%, #FF6B35 100%)", // Gradiente naranja
    },
    success: {
      main: "#27AE60", // Verde para estados de éxito
      light: "#2ECC71",
      dark: "#229A54",
      contrastText: "#ffffff",
    },
    info: {
      main: "#3498DB", // Azul para información
      light: "#5DADE2",
      dark: "#2E86C1",
      contrastText: "#ffffff",
    },
    error: {
      main: "#E74C3C", // Rojo para errores
      light: "#EC7063",
      dark: "#C0392B",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F39C12", // Amarillo/naranja para advertencias
      light: "#F7DC6F",
      dark: "#D68910",
      contrastText: "#ffffff",
    },
    grey: {
      50: "#FAFAFA",
      100: "#F5F5F5", 
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E", // Texto secundario
      600: "#757575", // Texto principal
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    text: {
      primary: "#2C3E50", // Texto principal oscuro
      secondary: "#7F8C8D", // Texto secundario gris
      disabled: "#BDC3C7",
    },
    action: {
      active: "#E17055",
      hover: "rgba(225, 112, 85, 0.04)",
      selected: "rgba(225, 112, 85, 0.08)",
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      focus: "rgba(225, 112, 85, 0.12)",
    },
    divider: "#ECF0F1",
    // Gradientes personalizados
    gradient: {
      primary: "linear-gradient(135deg, #E17055 0%, #FF6B35 100%)",
      primaryReverse: "linear-gradient(135deg, #FF6B35 0%, #E17055 100%)",
      subtle: "linear-gradient(135deg, #F39C7A 0%, #FF8A65 100%)",
      dark: "linear-gradient(135deg, #D63447 0%, #E55722 100%)",
      overlay: "linear-gradient(135deg, rgba(225, 112, 85, 0.9) 0%, rgba(255, 107, 53, 0.9) 100%)",
    },
  },
  typography: {
    fontFamily: plus.style.fontFamily,
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: "3rem",
      color: "#2C3E50",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      lineHeight: "2.5rem",
      color: "#2C3E50",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
      lineHeight: "2.25rem",
      color: "#2C3E50",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: "2rem",
      color: "#2C3E50",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      color: "#2C3E50",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: "1.5rem",
      color: "#2C3E50",
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: "1.5rem",
      color: "#7F8C8D",
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      color: "#7F8C8D",
    },
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      lineHeight: "1.5rem",
      color: "#2C3E50",
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      color: "#7F8C8D",
    },
    button: {
      fontWeight: 600,
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      textTransform: "none", // Sin mayúsculas automáticas
    },
    caption: {
      fontWeight: 400,
      fontSize: "0.75rem",
      lineHeight: "1rem",
      color: "#95A5A6",
    },
  },
  shape: {
    borderRadius: 12, // Bordes redondeados como en el diseño
  },
  // Array completo de shadows (25 elementos requeridos por Material-UI)
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 4px 8px rgba(0, 0, 0, 0.05)",
    "0px 8px 16px rgba(0, 0, 0, 0.05)",
    "0px 12px 24px rgba(0, 0, 0, 0.05)",
    "0px 16px 32px rgba(0, 0, 0, 0.05)",
    "0px 20px 40px rgba(0, 0, 0, 0.05)",
    "0px 24px 48px rgba(0, 0, 0, 0.05)",
    "0px 2px 4px rgba(225, 112, 85, 0.1)",
    "0px 4px 8px rgba(225, 112, 85, 0.1)",
    "0px 8px 16px rgba(225, 112, 85, 0.1)",
    "0px 12px 24px rgba(225, 112, 85, 0.1)",
    "0px 16px 32px rgba(225, 112, 85, 0.1)",
    "0px 20px 40px rgba(225, 112, 85, 0.1)",
    "0px 24px 48px rgba(225, 112, 85, 0.1)",
    "0px 28px 56px rgba(225, 112, 85, 0.1)",
    "0px 32px 64px rgba(225, 112, 85, 0.1)",
    "0px 36px 72px rgba(225, 112, 85, 0.1)",
    "0px 40px 80px rgba(225, 112, 85, 0.1)",
    "0px 44px 88px rgba(225, 112, 85, 0.1)",
    "0px 48px 96px rgba(225, 112, 85, 0.1)",
    "0px 52px 104px rgba(225, 112, 85, 0.1)",
    "0px 56px 112px rgba(225, 112, 85, 0.1)",
    "0px 60px 120px rgba(225, 112, 85, 0.1)",
    "0px 64px 128px rgba(225, 112, 85, 0.1)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: "1rem",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(225, 112, 85, 0.3)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #E17055 0%, #FF6B35 100%)",
          color: "#ffffff",
          "&:hover": {
            background: "linear-gradient(135deg, #D63447 0%, #E55722 100%)",
          },
        },
        outlined: {
          borderColor: "#E17055",
          color: "#E17055",
          "&:hover": {
            borderColor: "#D63447",
            backgroundColor: "rgba(225, 112, 85, 0.04)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
            "& fieldset": {
              borderColor: "#ECF0F1",
            },
            "&:hover fieldset": {
              borderColor: "#E17055",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#E17055",
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
          border: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: "rgba(225, 112, 85, 0.1)",
          color: "#E17055",
          "&:hover": {
            backgroundColor: "rgba(225, 112, 85, 0.2)",
          },
        },
      },
    },
  },
});

export { museoHorno3Theme };

// Colores específicos para uso directo (opcional)
export const museoColors = {
  // Principales
  primary: "#E17055",
  primaryLight: "#F39C7A", 
  primaryDark: "#D63447",
  
  // Secundarios
  secondary: "#FF6B35",
  secondaryLight: "#FF8A65",
  secondaryDark: "#E55722",
  
  // Fondos
  backgroundDefault: "#F8F9FA",
  backgroundPaper: "#FFFFFF",
  backgroundGradient: "linear-gradient(135deg, #E17055 0%, #FF6B35 100%)",
  
  // Textos
  textPrimary: "#2C3E50",
  textSecondary: "#7F8C8D",
  textDisabled: "#BDC3C7",
  
  // Estados
  success: "#27AE60",
  error: "#E74C3C",
  warning: "#F39C12",
  info: "#3498DB",
  
  // Grises
  grey50: "#FAFAFA",
  grey100: "#F5F5F5",
  grey200: "#EEEEEE",
  grey300: "#E0E0E0",
  grey400: "#BDBDBD",
  grey500: "#9E9E9E",
  grey600: "#757575",
  grey700: "#616161",
  grey800: "#424242",
  grey900: "#212121",
  
  // Especiales para componentes
  divider: "#ECF0F1",
  overlay: "rgba(0, 0, 0, 0.5)",
  white: "#FFFFFF",
  black: "#000000",
};

// Hook para usar los gradientes en componentes
export const useMuseoGradients = () => {
  return {
    primary: "linear-gradient(135deg, #E17055 0%, #FF6B35 100%)",
    primaryReverse: "linear-gradient(135deg, #FF6B35 0%, #E17055 100%)",
    subtle: "linear-gradient(135deg, #F39C7A 0%, #FF8A65 100%)",
    dark: "linear-gradient(135deg, #D63447 0%, #E55722 100%)",
    overlay: "linear-gradient(135deg, rgba(225, 112, 85, 0.9) 0%, rgba(255, 107, 53, 0.9) 100%)",
  };
};