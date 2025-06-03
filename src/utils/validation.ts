// src/utils/validation.ts
import type { CreateZonaData, ValidationErrors } from '@/types/zona';

export const validateZonaForm = (formData: CreateZonaData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!formData.nombre || formData.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  }
  
  if (!formData.descripcion || formData.descripcion.trim().length < 10) {
    errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
  }
  
  if (!formData.categorias) {
    errors.categorias = 'Debe seleccionar una categoría';
  }
  
  if (!formData.nivel) {
    errors.nivel = 'Debe seleccionar un nivel';
  }
  
  if (!formData.duracion || formData.duracion < 5) {
    errors.duracion = 'La duración debe ser de al menos 5 minutos';
  }
  
  if (!formData.actividad) {
    errors.actividad = 'Debe seleccionar una intensidad';
  }
  
  return errors;
};