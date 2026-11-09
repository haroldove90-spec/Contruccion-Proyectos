import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
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
} from 'lucide-react';

export const ControlTipo1MainView: React.FC = () => {
  const { activeSubTipo1, resetControlTipo1Data, activeControlledProject, controlTipo1Data } = useERP();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);

  const subTitles = {
    control_general: {
      title: 'Control General P0-00',
      desc: 'Resumen financiero consolidado y balance de flujo de obra',
      icon: FolderKanban,
      badge: '01',
    },
    presupuesto_aditivas: {
      title: 'Presupuesto Inicial, Aditivas y Deductivas',
      desc: 'Control contractual de ampliaciones y deducciones de obra',
      icon: Calculator,
      badge: '02',
    },
    mano_obra: {
      title: 'Mano de Obra y Destajos',
      desc: 'Cuadrillas, destajos semanales y retención de fondo de garantía del 5%',
      icon: HardHat,
      badge: '03',
    },
    subcontratos: {
      title: 'Subcontratos y Proveedores Especializados',
      desc: 'Contratos, estimaciones, retenciones de garantía y saldos',
      icon: Truck,
      badge: '04',
    },
    materiales: {
      title: 'Control de Materiales de Obra',
      desc: 'Facturación, órdenes de compra y desglose fiscal por proveedor',
      icon: Package,
      badge: '05',
    },
    materiales_cliente: {
      title: 'Materiales Compras de Cliente',
      desc: 'Insumos, acabados y equipamiento adquiridos directamente por el cliente',
      icon: ShoppingBag,
      badge: '06',
    },
  };

  const currentInfo = subTitles[activeSubTipo1] || subTitles.control_general;
  const IconComponent = currentInfo.icon;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Module Identity without horizontal navigation tabs */}
      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 text-white border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg">
                ROL: PROYECTOS
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 font-mono text-xs font-bold rounded-lg border border-slate-700">
                MÓDULO: Control_Tipo1_P0-00
              </span>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Submódulo {currentInfo.badge} Activo
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
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
              Obra: <span className="text-slate-200 font-semibold">{activeControlledProject?.name || 'Residencia Campestre Vista Bella (P0-00)'}</span> ·
              Cliente: <span className="text-slate-200 font-semibold">{activeControlledProject?.client || 'Desarrollos Residenciales del Norte S.A.'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <button
              onClick={() => setShowUnifiedModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer"
              title="Generar un solo reporte uniendo los 6 submódulos en PDF y Excel"
            >
              <Printer className="w-4 h-4" />
              <span>Reporte Unificado (6 Submódulos)</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-xs cursor-pointer"
              title="Restaurar datos predeterminados de las 6 hojas de cálculo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer Plantilla
            </button>
          </div>
        </div>
      </div>

      {/* Submodule View Switcher (Driven directly by Sidebar & Bottom Bar) */}
      <div className="min-h-[500px]">
        {activeSubTipo1 === 'control_general' && <SubControlGeneral />}
        {activeSubTipo1 === 'presupuesto_aditivas' && <SubPresupuestoAditivas />}
        {activeSubTipo1 === 'mano_obra' && <SubManoObra />}
        {activeSubTipo1 === 'subcontratos' && <SubSubcontratos />}
        {activeSubTipo1 === 'materiales' && <SubMateriales />}
        {activeSubTipo1 === 'materiales_cliente' && <SubMaterialesCliente />}
      </div>

      {/* Confirmation Modal to Reset Default Template Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              ¿Restablecer datos predeterminados?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Esta acción restablecerá los registros de los 6 submódulos con los datos originales de las hojas de cálculo enviadas.
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
                  resetControlTipo1Data();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs"
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
