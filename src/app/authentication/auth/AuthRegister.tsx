'use client'

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert, 
  CircularProgress,
  Stack,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';

interface AuthRegisterProps {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
}

const AuthRegister = ({ title, subtitle, subtext }: AuthRegisterProps) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loading: authLoading } = useAuth();

  // Limpiar errores cuando el usuario escribe
  useEffect(() => {
    if (error || success) {
      setError('');
      setSuccess('');
    }
    
    // Limpiar errores específicos del campo que está siendo editado
    const newErrors = { ...formErrors };
    let hasChanges = false;

    Object.keys(formData).forEach(key => {
      if (formErrors[key as keyof typeof formErrors] && formData[key as keyof typeof formData]) {
        newErrors[key as keyof typeof formErrors] = '';
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFormErrors(newErrors);
    }
  }, [formData]);

  // Validación completa del formulario
  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    } else if (formData.name.trim().length > 50) {
      errors.name = 'El nombre no puede tener más de 50 caracteres';
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name.trim())) {
      errors.name = 'El nombre solo puede contener letras y espacios';
      isValid = false;
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Ingresa un email válido';
      isValid = false;
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    } else if (formData.password.length > 100) {
      errors.password = 'La contraseña no puede tener más de 100 caracteres';
      isValid = false;
    } else if (!/(?=.*[a-zA-Z])/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una letra';
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir envíos múltiples
    if (isSubmitting || authLoading) return;

    setError('');
    setSuccess('');

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Intentando registro...');
      
      const result = await register(
        formData.email.trim(),
        formData.password,
        formData.name.trim()
      );
      
      if (result.success) {
        setSuccess('¡Cuenta de administrador creada exitosamente!');
        
        // Limpiar formulario
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
        // El AuthContext maneja la redirección automáticamente
      } else {
        setError(result.error || 'Error al crear la cuenta');
        
        // Limpiar contraseñas en caso de error
        setFormData(prev => ({ 
          ...prev, 
          password: '', 
          confirmPassword: '' 
        }));
      }
      
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      setError('Error inesperado. Intenta de nuevo.');
      
      setFormData(prev => ({ 
        ...prev, 
        password: '', 
        confirmPassword: '' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cambios en inputs
  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  // Toggle visibilidad de contraseñas
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const isLoading = isSubmitting || authLoading;

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      {/* Mostrar alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {/* Campo Nombre */}
          <Box>
            <Typography 
              variant="subtitle1"
              fontWeight={600} 
              component="label" 
              htmlFor='name' 
              mb="5px"
            >
              Nombre Completo *
            </Typography>
            <CustomTextField 
              id="name" 
              variant="outlined" 
              fullWidth 
              value={formData.name}
              onChange={handleInputChange('name')}
              disabled={isLoading}
              error={!!formErrors.name}
              helperText={formErrors.name}
              placeholder="Juan Pérez"
              autoComplete="name"
            />
          </Box>

          {/* Campo Email */}
          <Box>
            <Typography 
              variant="subtitle1"
              fontWeight={600} 
              component="label" 
              htmlFor='email' 
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
              htmlFor='password' 
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
              helperText={formErrors.password || "Mínimo 6 caracteres, debe contener al menos una letra"}
              placeholder="Contraseña segura"
              autoComplete="new-password"
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

          {/* Campo Confirmar Contraseña */}
          <Box>
            <Typography 
              variant="subtitle1"
              fontWeight={600} 
              component="label" 
              htmlFor='confirmPassword' 
              mb="5px"
            >
              Confirmar Contraseña *
            </Typography>
            <CustomTextField 
              id="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined" 
              fullWidth 
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              disabled={isLoading}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

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
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta de Administrador'
            )}
          </Button>
        </Stack>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;