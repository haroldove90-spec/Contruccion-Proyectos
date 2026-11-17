/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { CODProvider } from './context/CODContext';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { InstitutionalHeader } from './components/InstitutionalHeader';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileBottomBar } from './components/MobileBottomBar';

import { CODResumenView } from './views/cod/CODResumenView';
import { CODIngresosView } from './views/cod/CODIngresosView';
import { CODEgresosView } from './views/cod/CODEgresosView';
import { CODBancosView } from './views/cod/CODBancosView';
import { CODCatalogosView } from './views/cod/CODCatalogosView';

const CDO_TABS = [
  { id: 'cdo_resumen', label: 'RESUMEN' },
  { id: 'cdo_ingresos', label: 'INGRESOS' },
  { id: 'cdo_egresos', label: 'EGRESOS' },
  { id: 'cdo_bancos', label: 'CONTROL BANCARIO Y EFECTIVO' },
  { id: 'cdo_catalogos', label: 'CATÁLOGOS Y CLIENTES' },
];

const DashboardContent: React.FC = () => {
  const { currentRole, activeModule, setActiveModule } = useERP();

  if (!currentRole) {
    return <RoleSelectionScreen />;
  }

  const renderCDOModule = () => {
    switch (activeModule) {
      case 'cdo_ingresos':
        return <CODIngresosView />;
      case 'cdo_egresos':
        return <CODEgresosView />;
      case 'cdo_bancos':
        return <CODBancosView />;
      case 'cdo_catalogos':
        return <CODCatalogosView />;
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
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveModule(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B2545] text-white shadow-2xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
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
