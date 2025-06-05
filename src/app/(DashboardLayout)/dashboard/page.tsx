// src/app/dashboard/page.tsx
import { MainDashboard } from '@/components/dashboard';

export default function DashboardPage() {
  return <MainDashboard />;
}

export const metadata = {
  title: 'Dashboard - Museo Hornos',
  description: 'Panel de control del Museo Hornos con estadísticas y métricas en tiempo real',
};