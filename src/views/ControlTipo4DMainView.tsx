import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SubmoduleTipo4DKey } from '../context/ERPContext';
import { ProjectsCatalogView } from './controlTipo1/ProjectsCatalogView';
import { SubControlGeneral4D } from './controlTipo4D/SubControlGeneral4D';
import { SubBitacoraObservaciones } from './controlTipo4D/SubBitacoraObservaciones';
import { SubMaterialesCliente4D } from './controlTipo4D/SubMaterialesCliente4D';
import { UnifiedReportModal } from '../components/UnifiedReportModal';
import {
  Calculator,
  BookOpen,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Printer,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';

export const ControlTipo4DMainView: React.FC = () => {
  const {
    activeSubTipo4D,
    setActiveSubTipo4D,
    resetControlTipo4DData,
    activeControlledProject,
    setActiveControlledProjectId,
    controlTipo4DData,
  } = useERP();

  // Mode: 'catalog' (shows project history) or 'workspace' (submodules filling & report)
  const [viewMode, setViewMode] = useState<'catalog' | 'workspace'>('catalog');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);

  const TIPO3M_SUBMODULES: {
    id: SubmoduleTipo4DKey;
    label: string;
    badge: string;
    icon: React.FC<{ className?: string }>;
    desc: string;
  }[] = [
    {
      id: 'control_general_4d',
      label: 'Control General (TIR)',
      badge: '01',
      icon: Calculator,
      desc: 'Cálculo de Total Ingresos Recibidos: TIR = (A) - (B) - (C)',
    },
    {
      id: 'bitacora_observaciones',
      label: 'Bitácora observaciones',
      badge: '02',
      icon: BookOpen,
      desc: 'Historial cronológico de incidencias, acuerdos y especificaciones técnicas',
    },
    {
      id: 'materiales_cliente_4d',
      label: 'Materiales compras cliente',
      badge: '03',
      icon: ShoppingBag,
      desc: 'Registro y conciliación de suministros adquiridos directamente por el cliente',
    },
  ];

  const currentSub = TIPO3M_SUBMODULES.find((s) => s.id === activeSubTipo4D) || TIPO3M_SUBMODULES[0];
  const CurrentIcon = currentSub.icon;

  // Catalog Mode: Shows project history for Tipo 3M
  if (viewMode === 'catalog') {
    return (
      <div className="space-y-4">
        <ProjectsCatalogView
          filterType="tipo3m"
          titleOverride="Historial de Proyectos · Control_Tipo3M_P0-00"
          subtitleOverride="Catálogo de proyectos Tipo 3M (TIR = A - B - C). Haga clic en 'Abrir Submódulos' para llenar el Control General TIR, Bitácora y Materiales compras de cliente, o genere su reporte unificado."
          onSelectProject={(proj) => {
            setActiveControlledProjectId(proj.id);
            setViewMode('workspace');
          }}
        />
      </div>
    );
  }

  // Workspace Mode: User fills 3 submodules and creates unified report
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation Banner with Project Identity */}
      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 text-white border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setViewMode('catalog')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                title="Regresar a la lista de proyectos Tipo 3M"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Historial de Obras</span>
              </button>

              <span className="px-2.5 py-1 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-lg font-mono">
                ROL: PROYECTOS
              </span>
              <span className="px-2.5 py-1 bg-slate-800 text-indigo-200 font-mono text-xs font-bold rounded-lg border border-slate-700">
                {activeControlledProject?.code || 'P0-01'} · Control_Tipo3M
              </span>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
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
              <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
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
                <strong className="text-indigo-300">
                  ${activeControlledProject?.initialBudget?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={() => setShowUnifiedModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer"
              title="Generar un solo reporte uniendo los 3 submódulos en PDF y Excel"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Reporte Unificado (3 Submódulos)</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-xs cursor-pointer"
              title="Restaurar datos predeterminados de Control Tipo 3M"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Clean Submodules Horizontal Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TIPO3M_SUBMODULES.map((sub) => {
            const SubIcon = sub.icon;
            const isActive = activeSubTipo4D === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubTipo4D(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-mono font-black ${
                    isActive ? 'bg-white text-indigo-800' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {sub.badge}
                </span>
                <SubIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submodule View Content */}
      <div className="min-h-[500px]">
        {activeSubTipo4D === 'control_general_4d' && <SubControlGeneral4D />}
        {activeSubTipo4D === 'bitacora_observaciones' && <SubBitacoraObservaciones />}
        {activeSubTipo4D === 'materiales_cliente_4d' && <SubMaterialesCliente4D />}
      </div>

      {/* Confirmation Modal to Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              ¿Restablecer datos de Control Tipo 3M?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Esta acción restablecerá los registros de Control General (TIR), Bitácora y Materiales compras de clientes con los datos iniciales.
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
                  resetControlTipo4DData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
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
          tipo3mData={controlTipo4DData}
          onClose={() => setShowUnifiedModal(false)}
        />
      )}
    </div>
  );
};
export default ControlTipo4DMainView;
