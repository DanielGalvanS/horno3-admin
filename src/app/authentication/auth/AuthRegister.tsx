'use client'

import React, { useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import CustomTextField from '@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';

interface registerType {
    title?: string;
    subtitle?: React.ReactNode;
    subtext?: React.ReactNode;
}

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { register, loading } = useAuth();
    const router = useRouter();

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Por favor completa todos los campos');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor ingresa un email válido');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        const result = await register(formData.email, formData.password, formData.name);
        
        if (result.success) {
            setSuccess('¡Cuenta creada exitosamente!');
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
        } else {
            setError(result.error || 'Error al crear la cuenta');
        }
    };

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

            <Box component="form" onSubmit={handleSubmit}>
                <Stack mb={3}>
                    <Typography 
                        variant="subtitle1"
                        fontWeight={600} 
                        component="label" 
                        htmlFor='name' 
                        mb="5px"
                    >
                        Nombre Completo
                    </Typography>
                    <CustomTextField 
                        id="name" 
                        variant="outlined" 
                        fullWidth 
                        value={formData.name}
                        onChange={handleChange('name')}
                        disabled={loading}
                        required
                    />

                    <Typography 
                        variant="subtitle1"
                        fontWeight={600} 
                        component="label" 
                        htmlFor='email' 
                        mb="5px" 
                        mt="25px"
                    >
                        Email Address
                    </Typography>
                    <CustomTextField 
                        id="email" 
                        type="email"
                        variant="outlined" 
                        fullWidth 
                        value={formData.email}
                        onChange={handleChange('email')}
                        disabled={loading}
                        required
                    />

                    <Typography 
                        variant="subtitle1"
                        fontWeight={600} 
                        component="label" 
                        htmlFor='password' 
                        mb="5px" 
                        mt="25px"
                    >
                        Password
                    </Typography>
                    <CustomTextField 
                        id="password" 
                        type="password"
                        variant="outlined" 
                        fullWidth 
                        value={formData.password}
                        onChange={handleChange('password')}
                        disabled={loading}
                        required
                        helperText="Mínimo 6 caracteres"
                    />

                    <Typography 
                        variant="subtitle1"
                        fontWeight={600} 
                        component="label" 
                        htmlFor='confirmPassword' 
                        mb="5px" 
                        mt="25px"
                    >
                        Confirmar Password
                    </Typography>
                    <CustomTextField 
                        id="confirmPassword" 
                        type="password"
                        variant="outlined" 
                        fullWidth 
                        value={formData.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        disabled={loading}
                        required
                    />
                </Stack>
                
                <Button 
                    color="primary" 
                    variant="contained" 
                    size="large" 
                    fullWidth 
                    type="submit"
                    disabled={loading}
                    sx={{ mb: 2 }}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Sign Up'
                    )}
                </Button>
            </Box>
            {subtitle}
        </>
    );
};

export default AuthRegister;