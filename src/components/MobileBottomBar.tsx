import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { UnifiedReportModal } from './UnifiedReportModal';
import { NewProjectModal } from './NewProjectModal';
import {
  Building2,
  MessageSquare,
  Landmark,
  PieChart,
  Receipt,
  Scale,
  TrendingUp,
  BarChart3,
  FileCode2,
  FolderKanban,
  Calculator,
  Printer,
  Plus,
} from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const {
    currentRole,
    activeModule,
    setActiveModule,
    activeControlledProject,
    controlTipo1Data,
    controlTipo4DData,
    setProjectWorkspaceMode,
  } = useERP();

  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Specific tabs for non-proyectos roles
  const getRoleTabs = () => {
    switch (currentRole) {
      case 'socio':
        return [
          { id: 'reportes_financieros', label: 'Finanzas', icon: PieChart },
          { id: 'centros_costos', label: 'Obras', icon: Building2 },
          { id: 'ventas_estimaciones', label: 'Cobranza', icon: TrendingUp },
          { id: 'propuesta_tecnica', label: 'Dossier', icon: FileCode2 },
        ];
      case 'admin':
        return [
          { id: 'tesoreria', label: 'Tesorería', icon: Landmark },
          { id: 'cuentas_pagar_cobrar', label: 'CXP / CXC', icon: Scale },
          { id: 'compras_gastos', label: 'Compras', icon: Receipt },
          { id: 'centros_costos', label: 'Obras', icon: Building2 },
        ];
      case 'residente':
        return [
          { id: 'programa_obra', label: 'Avance', icon: BarChart3 },
          { id: 'centros_costos', label: 'Obra', icon: Building2 },
          { id: 'compras_gastos', label: 'Requisiciones', icon: Receipt },
        ];
      case 'compras':
        return [
          { id: 'whatsapp_ocr', label: 'WhatsApp IA', icon: MessageSquare, highlight: true },
          { id: 'compras_gastos', label: 'Compras', icon: Receipt },
          { id: 'cuentas_pagar_cobrar', label: 'Cuentas x Pagar', icon: Scale },
        ];
      default:
        return [];
    }
  };

  const isProyectos = currentRole === 'proyectos';
  const roleTabs = getRoleTabs();

  return (
    <>
      {/* Fixed Bottom Bar on Mobile/Tablet */}
      <nav
        aria-label="Navegación móvil adaptada al rol"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg"
      >
        {isProyectos ? (
          <>
            {/* Quick Clean Proyectos Buttons */}
            <button
              onClick={() => {
                setActiveModule('control_tipo1');
                setProjectWorkspaceMode('catalog');
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer min-w-[55px] ${
                activeModule === 'control_tipo1'
                  ? 'text-amber-600 font-bold bg-amber-50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 leading-none font-bold">Tipo 1</span>
            </button>

            <button
              onClick={() => {
                setActiveModule('control_tipo4d');
                setProjectWorkspaceMode('catalog');
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer min-w-[55px] ${
                activeModule === 'control_tipo4d'
                  ? 'text-indigo-600 font-bold bg-indigo-50'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 leading-none font-bold">Tipo 3M</span>
            </button>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors cursor-pointer min-w-[65px] bg-amber-500 text-slate-950 font-black shadow-xs"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span className="text-[10px] mt-0.5 leading-none">+ Proyecto</span>
            </button>

            <button
              onClick={() => setShowUnifiedModal(true)}
              className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer min-w-[55px] text-slate-600 hover:text-slate-900"
            >
              <Printer className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 leading-none font-bold">Reporte</span>
            </button>
          </>
        ) : (
          /* For other roles: standard role tabs */
          roleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors cursor-pointer min-w-[60px] ${
                  isActive
                    ? 'text-amber-600 font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-amber-600 stroke-[2.2]' : 'text-slate-500'
                    }`}
                  />
                  {tab.highlight && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] mt-0.5 leading-none">{tab.label}</span>
              </button>
            );
          })
        )}
      </nav>

      {/* Unified Report Modal Mobile */}
      {showUnifiedModal && activeControlledProject && (
        <UnifiedReportModal
          project={activeControlledProject}
          tipo1Data={controlTipo1Data}
          tipo3mData={controlTipo4DData}
          onClose={() => setShowUnifiedModal(false)}
        />
      )}

      {/* New Project Modal Mobile */}
      {showNewProjectModal && (
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      )}
    </>
  );
};
export default MobileBottomBar;
