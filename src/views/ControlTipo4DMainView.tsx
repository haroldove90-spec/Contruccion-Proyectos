import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SubControlGeneral4D } from './controlTipo4D/SubControlGeneral4D';
import { SubBitacoraObservaciones } from './controlTipo4D/SubBitacoraObservaciones';
import { SubMaterialesCliente4D } from './controlTipo4D/SubMaterialesCliente4D';
import { UnifiedReportModal } from '../components/UnifiedReportModal';
import {
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Calculator,
  BookOpen,
  ShoppingBag,
  Printer,
} from 'lucide-react';

export const ControlTipo4DMainView: React.FC = () => {
  const { activeSubTipo4D, resetControlTipo4DData, activeControlledProject, controlTipo4DData } = useERP();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);

  const subTitles = {
    control_general_4d: {
      title: 'Control General (TIR)',
      desc: 'Cálculo de Total Ingresos Recibidos: TIR = (A) - (B) - (C)',
      icon: Calculator,
      badge: '01',
    },
    bitacora_observaciones: {
      title: 'Bitácora y Observaciones',
      desc: 'Historial cronológico de incidencias, acuerdos y especificaciones técnicas',
      icon: BookOpen,
      badge: '02',
    },
    materiales_cliente_4d: {
      title: 'Materiales Compras de Clientes',
      desc: 'Registro y conciliación de suministros adquiridos directamente por el cliente',
      icon: ShoppingBag,
      badge: '03',
    },
  };

  const currentInfo = subTitles[activeSubTipo4D] || subTitles.control_general_4d;
  const IconComponent = currentInfo.icon;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Module Identity without horizontal navigation tabs */}
      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 text-white border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-lg">
                ROL: PROYECTOS
              </span>
              <span className="px-3 py-1 bg-slate-800 text-indigo-300 font-mono text-xs font-bold rounded-lg border border-slate-700">
                MÓDULO: Control_Tipo3M_P0-00
              </span>
              <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Submódulo {currentInfo.badge} Activo
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {currentInfo.title}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">{currentInfo.desc}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800 max-w-2xl font-mono">
              Obra: <span className="text-slate-200 font-semibold">{activeControlledProject?.name || 'Plaza Palmas & Corporativo 4D'}</span> ·
              Cliente: <span className="text-slate-200 font-semibold">{activeControlledProject?.client || 'Grupo Inmobiliario del Bajío S.A.P.I.'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={() => setShowUnifiedModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer"
              title="Generar un solo reporte uniendo los 3 submódulos en PDF y Excel"
            >
              <Printer className="w-4 h-4" />
              <span>Reporte Unificado (3 Submódulos)</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-xs cursor-pointer"
              title="Restaurar datos predeterminados de Control Tipo 3M"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer Plantilla
            </button>
          </div>
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
              Esta acción restablecerá los registros de Control General (TIR), Bitácora y Materiales compras de clientes con los datos originales.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetControlTipo4DData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs"
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
