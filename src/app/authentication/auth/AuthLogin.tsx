'use client'

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, AdminPanelSettings } from "@mui/icons-material";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";

interface AuthLoginProps {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthLogin = ({ title, subtitle, subtext }: AuthLoginProps) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loading: authLoading, isAuthenticated } = useAuth();

  // Limpiar errores cuando el usuario escribe
  useEffect(() => {
    if (error) {
      setError('');
    }
    if (formErrors.email || formErrors.password) {
      setFormErrors({ email: '', password: '' });
    }
  }, [formData.email, formData.password]);

  // Validación del formulario
  const validateForm = (): boolean => {
    const errors = { email: '', password: '' };
    let isValid = true;

    // Validar email
    if (!formData.email) {
      errors.email = 'El email es obligatorio';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingresa un email válido';
      isValid = false;
    }

    // Validar password
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevenir envíos múltiples
    if (isSubmitting || authLoading) return;

    setError('');
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🔐 Intentando login...');
      
      const result = await login(formData.email.trim(), formData.password);
      
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
        
        // Limpiar contraseña en caso de error
        setFormData(prev => ({ ...prev, password: '' }));
      }
      // Si es exitoso, el AuthContext maneja la redirección
      
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      setError('Error inesperado. Intenta de nuevo.');
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberDevice' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle visibilidad de contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isLoading = isSubmitting || authLoading;

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}


      {/* Mostrar errores */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {/* Campo Email */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="email"
              mb="5px"
            >
              Email *
            </Typography>
            <CustomTextField 
              id="email"
              type="email"
              variant="outlined" 
              fullWidth 
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isLoading}
              error={!!formErrors.email}
              helperText={formErrors.email}
              placeholder="admin@ejemplo.com"
              autoComplete="email"
            />
          </Box>

          {/* Campo Contraseña */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Contraseña *
            </Typography>
            <CustomTextField 
              id="password"
              type={showPassword ? "text" : "password"}
              variant="outlined" 
              fullWidth 
              value={formData.password}
              onChange={handleInputChange('password')}
              disabled={isLoading}
              error={!!formErrors.password}
              helperText={formErrors.password}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Recordar dispositivo */}
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
          >
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.rememberDevice}
                    onChange={handleInputChange('rememberDevice')}
                    disabled={isLoading}
                  />
                }
                label="Recordar este dispositivo"
              />
            </FormGroup>
          </Stack>

          {/* Botón de envío */}
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={isLoading}
            sx={{ 
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </Stack>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthLogin;