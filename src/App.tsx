/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { InstitutionalHeader } from './components/InstitutionalHeader';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileBottomBar } from './components/MobileBottomBar';

// Views
import { CentrosCostosView } from './views/CentrosCostosView';
import { ComprasGastosView } from './views/ComprasGastosView';
import { TesoreriaView } from './views/TesoreriaView';
import { CuentasPagarCobrarView } from './views/CuentasPagarCobrarView';
import { VentasEstimacionesView } from './views/VentasEstimacionesView';
import { ProgramaObraView } from './views/ProgramaObraView';
import { ReportesFinancierosView } from './views/ReportesFinancierosView';
import { WhatsAppOCRView } from './views/WhatsAppOCRView';
import { PropuestaTecnicaView } from './views/PropuestaTecnicaView';

const DashboardContent: React.FC = () => {
  const { currentRole, activeModule } = useERP();

  // Si no hay rol activo, mostrar la pantalla de selección de roles limpia sin header ni descripciones
  if (!currentRole) {
    return <RoleSelectionScreen />;
  }

  // Renderizador de módulos principales
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'centros_costos':
        return <CentrosCostosView />;
      case 'whatsapp_ocr':
        return <WhatsAppOCRView />;
      case 'compras_gastos':
        return <ComprasGastosView />;
      case 'tesoreria':
        return <TesoreriaView />;
      case 'cuentas_pagar_cobrar':
        return <CuentasPagarCobrarView />;
      case 'ventas_estimaciones':
        return <VentasEstimacionesView />;
      case 'programa_obra':
        return <ProgramaObraView />;
      case 'reportes_financieros':
        return <ReportesFinancierosView />;
      case 'propuesta_tecnica':
        return <PropuestaTecnicaView />;
      default:
        return <CentrosCostosView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-amber-500 selection:text-white">
      {/* Cabecera Institucional Unificada */}
      <InstitutionalHeader />

      {/* Área de Trabajo Principal */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        {/* Menú Lateral Desplegable en Escritorio */}
        <DesktopSidebar />

        {/* Contenedor del Módulo Activo */}
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-8 overflow-y-auto w-full">
          {renderActiveModule()}
        </main>
      </div>

      {/* Navegación Móvil y Tablet (Bottom Bar) */}
      <MobileBottomBar />
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <DashboardContent />
    </ERPProvider>
  );
}
