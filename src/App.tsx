/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { CODProvider, useCOD } from './context/CODContext';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { InstitutionalHeader } from './components/InstitutionalHeader';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileBottomBar } from './components/MobileBottomBar';

import { CODResumenView } from './views/cod/CODResumenView';
import { CODIngresosView } from './views/cod/CODIngresosView';
import { CODEgresosView } from './views/cod/CODEgresosView';
import { CODBancosView } from './views/cod/CODBancosView';
import { CODPrestamosView } from './views/cod/CODPrestamosView';
import { CODNotificacionesView } from './views/cod/CODNotificacionesView';
import { CODCatalogosView } from './views/cod/CODCatalogosView';
import { CODPerfilView } from './views/cod/CODPerfilView';

const CDO_TABS = [
  { id: 'cdo_resumen', label: 'RESUMEN' },
  { id: 'cdo_ingresos', label: 'INGRESOS' },
  { id: 'cdo_egresos', label: 'EGRESOS' },
  { id: 'cdo_bancos', label: 'CONTROL BANCARIO Y EFECTIVO' },
  { id: 'cdo_prestamos', label: 'PRÉSTAMOS Y TARJETAS' },
  { id: 'cdo_notificaciones', label: 'NOTIFICACIONES' },
  { id: 'cdo_catalogos', label: 'CATÁLOGOS Y CLIENTES' },
  { id: 'cdo_perfil', label: 'MI PERFIL' },
];

const DashboardContent: React.FC = () => {
  const { currentRole, setCurrentRole, activeModule, setActiveModule } = useERP();
  const { currentUser, unreadNotificationsCount, pendingApprovalsCount } = useCOD();

  React.useEffect(() => {
    if (currentUser && currentRole !== currentUser.role) {
      setCurrentRole(currentUser.role);
    }
  }, [currentUser, currentRole, setCurrentRole]);

  if (!currentUser) {
    return <RoleSelectionScreen />;
  }

  const effectiveRole = currentRole || currentUser.role;
  const notifCount =
    effectiveRole === 'admin'
      ? Math.max(unreadNotificationsCount, pendingApprovalsCount)
      : unreadNotificationsCount;

  const renderCDOModule = () => {
    switch (activeModule) {
      case 'cdo_ingresos':
        return <CODIngresosView />;
      case 'cdo_egresos':
        return <CODEgresosView />;
      case 'cdo_bancos':
        return <CODBancosView />;
      case 'cdo_prestamos':
        return <CODPrestamosView />;
      case 'cdo_notificaciones':
        return <CODNotificacionesView />;
      case 'cdo_catalogos':
        return <CODCatalogosView />;
      case 'cdo_perfil':
        return <CODPerfilView />;
      case 'cdo_resumen':
      default:
        return <CODResumenView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-amber-500 selection:text-white">
      <InstitutionalHeader />

      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        <DesktopSidebar />

        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-8 overflow-y-auto w-full space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2.5">
            {CDO_TABS.map((tab) => {
              const isActive =
                activeModule === tab.id || (!activeModule && tab.id === 'cdo_resumen');
              const isNotif = tab.id === 'cdo_notificaciones';

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveModule(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B2545] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isNotif && notifCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black leading-tight">
                      {notifCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {renderCDOModule()}
        </main>
      </div>

      <MobileBottomBar />
    </div>
  );
};

export default function App() {
  return (
    <ERPProvider>
      <CODProvider>
        <DashboardContent />
      </CODProvider>
    </ERPProvider>
  );
}
