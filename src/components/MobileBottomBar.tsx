import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SubmoduleTipo1Key, SubmoduleTipo4DKey } from '../context/ERPContext';
import { UnifiedReportModal } from './UnifiedReportModal';
import {
  Building2,
  MessageSquare,
  Landmark,
  PieChart,
  Menu,
  X,
  Receipt,
  Scale,
  TrendingUp,
  BarChart3,
  FileCode2,
  FolderKanban,
  Calculator,
  HardHat,
  Truck,
  Package,
  ShoppingBag,
  BookOpen,
  Printer,
} from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const {
    currentRole,
    activeModule,
    setActiveModule,
    activeSubTipo1,
    setActiveSubTipo1,
    activeSubTipo4D,
    setActiveSubTipo4D,
    activeControlledProject,
    controlTipo1Data,
    controlTipo4DData,
  } = useERP();

  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);

  // Submodules config for Proyectos
  const TIPO1_SUBMODULES: { id: SubmoduleTipo1Key; label: string; badge: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'control_general', label: 'Control General P0-00', badge: '01', icon: FolderKanban },
    { id: 'presupuesto_aditivas', label: 'Presupuesto y aditivas', badge: '02', icon: Calculator },
    { id: 'mano_obra', label: 'Mano de obra (5% ret.)', badge: '03', icon: HardHat },
    { id: 'subcontratos', label: 'Sub-C y Proveedores', badge: '04', icon: Truck },
    { id: 'materiales', label: 'Materiales de Obra', badge: '05', icon: Package },
    { id: 'materiales_cliente', label: 'Materiales compras cliente', badge: '06', icon: ShoppingBag },
  ];

  const TIPO4D_SUBMODULES: { id: SubmoduleTipo4DKey; label: string; badge: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'control_general_4d', label: 'Control General (TIR=A-B-C)', badge: '01', icon: Calculator },
    { id: 'bitacora_observaciones', label: 'Bitácora / Observaciones', badge: '02', icon: BookOpen },
    { id: 'materiales_cliente_4d', label: 'Materiales compras de cliente 4D', badge: '03', icon: ShoppingBag },
  ];

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
      {/* Drawer modal for full submodule access */}
      {showSubMenu && isProyectos && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black text-amber-600 uppercase font-mono">
                  ROL: PROYECTOS
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Submódulos de Control
                </h3>
              </div>
              <button
                onClick={() => setShowSubMenu(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grupo Control Tipo 1 */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2 text-xs font-black text-slate-800 uppercase font-mono">
                <FolderKanban className="w-4 h-4 text-amber-600" />
                <span>Control_Tipo1_P0-00</span>
              </div>
              <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-amber-300">
                {TIPO1_SUBMODULES.map((sub) => {
                  const Icon = sub.icon;
                  const isActive = activeModule === 'control_tipo1' && activeSubTipo1 === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveModule('control_tipo1');
                        setActiveSubTipo1(sub.id);
                        setShowSubMenu(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                          isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.badge}
                      </span>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grupo Control Tipo 4D */}
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-2 text-xs font-black text-slate-800 uppercase font-mono">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>Control_Tipo4D_P0-00 (TIR)</span>
              </div>
              <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-indigo-400">
                {TIPO4D_SUBMODULES.map((sub) => {
                  const Icon = sub.icon;
                  const isActive = activeModule === 'control_tipo4d' && activeSubTipo4D === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveModule('control_tipo4d');
                        setActiveSubTipo4D(sub.id);
                        setShowSubMenu(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                          isActive ? 'bg-indigo-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.badge}
                      </span>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar on Mobile/Tablet */}
      <nav
        aria-label="Navegación móvil adaptada al rol"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg"
      >
        {isProyectos ? (
          <>
            {/* Quick Proyectos Buttons */}
            <button
              onClick={() => setActiveModule('historial_proyectos')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer min-w-[50px] ${
                activeModule === 'historial_proyectos'
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 leading-none">Obras</span>
            </button>

            <button
              onClick={() => {
                setActiveModule('control_tipo1');
                setActiveSubTipo1('control_general');
              }}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer min-w-[50px] ${
                activeModule === 'control_tipo1'
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FolderKanban className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 leading-none">Tipo 1</span>
            </button>

            <button
              onClick={() => {
                setActiveModule('control_tipo4d');
                setActiveSubTipo4D('control_general_4d');
              }}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer min-w-[50px] ${
                activeModule === 'control_tipo4d'
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 leading-none">Tipo 3M</span>
            </button>

            <button
              onClick={() => setShowUnifiedModal(true)}
              className="flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer min-w-[50px] text-amber-600 hover:text-amber-700"
            >
              <Printer className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 leading-none font-bold">Reporte</span>
            </button>

            <button
              onClick={() => setShowSubMenu(true)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer min-w-[50px] ${
                showSubMenu ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-none">Módulos</span>
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
    </>
  );
};
