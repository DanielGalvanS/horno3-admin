import React, { useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  CircularProgress,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { UserOutlined } from "@ant-design/icons";
import { IconLogout, IconUser, IconShieldCheck } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { logout, user, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevenir múltiples clicks

    setIsLoggingOut(true);
    
    try {
      console.log('🚪 Iniciando logout desde Profile...');
      await logout();
      
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      
      // En caso de error, forzar redirect
      window.location.replace('/authentication/login');
    }
    
    // No resetear isLoggingOut porque queremos que se mantenga
    // hasta que se complete el redirect
  };

  if (!user) {
    return null; // No mostrar nada si no hay usuario
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Información del usuario */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            lineHeight: 1.2
          }}
        >
          {user.name}
        </Typography>
        
        
      </Box>

      {/* Botón de Logout */}
      
        <IconButton
          onClick={handleLogout}
          disabled={isLoggingOut}
          color="inherit"
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              transform: 'scale(1.05)',
            },
            '&:disabled': {
              opacity: 0.7,
            },
          }}
        >
          {isLoggingOut ? (
            <CircularProgress 
              size={20} 
              color="inherit" 
              sx={{ 
                animation: 'spin 1s linear infinite' 
              }} 
            />
          ) : (
            <IconLogout size={20} />
          )}
        </IconButton>

      {/* Avatar del usuario */}
      <Avatar
        alt={user.name}
        sx={{
          width: 35,
          height: 35,
          opacity: isLoggingOut ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.05)',
          }
        }}
      >
        <UserOutlined />
      </Avatar>
    </Box>
  );
};

export default Profile;