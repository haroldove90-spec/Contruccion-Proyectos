import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SubmoduleTipo1Key } from '../context/ERPContext';
import { ProjectsCatalogView } from './controlTipo1/ProjectsCatalogView';
import { SubControlGeneral } from './controlTipo1/SubControlGeneral';
import { SubPresupuestoAditivas } from './controlTipo1/SubPresupuestoAditivas';
import { SubManoObra } from './controlTipo1/SubManoObra';
import { SubSubcontratos } from './controlTipo1/SubSubcontratos';
import { SubMateriales } from './controlTipo1/SubMateriales';
import { SubMaterialesCliente } from './controlTipo1/SubMaterialesCliente';
import { UnifiedReportModal } from '../components/UnifiedReportModal';
import {
  FolderKanban,
  Calculator,
  HardHat,
  Truck,
  Package,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Printer,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';

export const ControlTipo1MainView: React.FC = () => {
  const {
    activeSubTipo1,
    setActiveSubTipo1,
    resetControlTipo1Data,
    activeControlledProject,
    setActiveControlledProjectId,
    controlTipo1Data,
  } = useERP();

  // Mode: 'catalog' (shows project history) or 'workspace' (submodules filling & report)
  const [viewMode, setViewMode] = useState<'catalog' | 'workspace'>('catalog');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);

  const TIPO1_SUBMODULES: {
    id: SubmoduleTipo1Key;
    label: string;
    badge: string;
    icon: React.FC<{ className?: string }>;
    desc: string;
  }[] = [
    {
      id: 'control_general',
      label: 'Control General',
      badge: '01',
      icon: FolderKanban,
      desc: 'Resumen financiero consolidado y balance de flujo de obra',
    },
    {
      id: 'presupuesto_aditivas',
      label: 'Presupuesto y aditivas',
      badge: '02',
      icon: Calculator,
      desc: 'Control contractual de ampliaciones y deducciones de obra',
    },
    {
      id: 'mano_obra',
      label: 'Mano de obra',
      badge: '03',
      icon: HardHat,
      desc: 'Cuadrillas, destajos semanales y retención de fondo de garantía del 5%',
    },
    {
      id: 'subcontratos',
      label: 'Sub-C y Prov',
      badge: '04',
      icon: Truck,
      desc: 'Contratos, estimaciones, retenciones de garantía y saldos',
    },
    {
      id: 'materiales',
      label: 'Materiales',
      badge: '05',
      icon: Package,
      desc: 'Facturación, órdenes de compra y desglose fiscal por proveedor',
    },
    {
      id: 'materiales_cliente',
      label: 'Materiales compras cliente',
      badge: '06',
      icon: ShoppingBag,
      desc: 'Insumos y equipamiento adquiridos directamente por el cliente',
    },
  ];

  const currentSub = TIPO1_SUBMODULES.find((s) => s.id === activeSubTipo1) || TIPO1_SUBMODULES[0];
  const CurrentIcon = currentSub.icon;

  // If in catalog mode, show the projects history specifically for Tipo 1
  if (viewMode === 'catalog') {
    return (
      <div className="space-y-4">
        <ProjectsCatalogView
          filterType="tipo1"
          titleOverride="Historial de Obras · Control_Tipo1_P0-00"
          subtitleOverride="Catálogo de proyectos Tipo 1. Haga clic en 'Abrir Submódulos' para llenar el presupuesto, mano de obra, subcontratos, materiales o generar el reporte unificado."
          onSelectProject={(proj) => {
            setActiveControlledProjectId(proj.id);
            setViewMode('workspace');
          }}
        />
      </div>
    );
  }

  // Workspace Mode: User fills submodules step-by-step and creates unified report
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation Banner with Project Identity */}
      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 text-white border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setViewMode('catalog')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                title="Regresar a la lista de proyectos Tipo 1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Historial de Obras</span>
              </button>

              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg font-mono">
                ROL: PROYECTOS
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-mono text-xs font-bold rounded-lg border border-slate-700">
                {activeControlledProject?.code || 'P0-00'} · Control_Tipo1
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {currentSub.badge}. {currentSub.label}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{currentSub.desc}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 mt-3 pt-3 border-t border-slate-800/80 max-w-3xl flex items-center gap-2 flex-wrap font-mono">
              <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Obra Activa: <strong className="text-white">{activeControlledProject?.name}</strong>
              </span>
              <span>·</span>
              <span>
                Cliente: <strong className="text-white">{activeControlledProject?.client}</strong>
              </span>
              <span>·</span>
              <span>
                Presupuesto Base:{' '}
                <strong className="text-amber-400">
                  ${activeControlledProject?.initialBudget?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={() => setShowUnifiedModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer"
              title="Generar un solo reporte uniendo los 6 submódulos en PDF y Excel"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Reporte Unificado (6 Submódulos)</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-xs cursor-pointer"
              title="Restaurar datos predeterminados de las 6 hojas de cálculo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Clean Submodules Horizontal Switcher (Matching User Interface Screenshot) */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TIPO1_SUBMODULES.map((sub) => {
            const SubIcon = sub.icon;
            const isActive = activeSubTipo1 === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubTipo1(sub.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-mono font-black ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {sub.badge}
                </span>
                <SubIcon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submodule View Content */}
      <div className="min-h-[500px]">
        {activeSubTipo1 === 'control_general' && <SubControlGeneral />}
        {activeSubTipo1 === 'presupuesto_aditivas' && <SubPresupuestoAditivas />}
        {activeSubTipo1 === 'mano_obra' && <SubManoObra />}
        {activeSubTipo1 === 'subcontratos' && <SubSubcontratos />}
        {activeSubTipo1 === 'materiales' && <SubMateriales />}
        {activeSubTipo1 === 'materiales_cliente' && <SubMaterialesCliente />}
      </div>

      {/* Confirmation Modal to Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              ¿Restablecer datos de la plantilla?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Esta acción restablecerá los registros de los 6 submódulos con los datos originales.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetControlTipo1Data();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Sí, Restablecer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Report Modal */}
      {showUnifiedModal && activeControlledProject && (
        <UnifiedReportModal
          project={activeControlledProject}
          tipo1Data={controlTipo1Data}
          onClose={() => setShowUnifiedModal(false)}
        />
      )}
    </div>
  );
};
export default ControlTipo1MainView;
