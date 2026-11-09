import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SubControlGeneral } from './controlTipo1/SubControlGeneral';
import { SubPresupuestoAditivas } from './controlTipo1/SubPresupuestoAditivas';
import { SubManoObra } from './controlTipo1/SubManoObra';
import { SubSubcontratos } from './controlTipo1/SubSubcontratos';
import { SubMateriales } from './controlTipo1/SubMateriales';
import { SubMaterialesCliente } from './controlTipo1/SubMaterialesCliente';
import {
  FolderKanban,
  FileSpreadsheet,
  Calculator,
  HardHat,
  Truck,
  Package,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export type SubModuleKey =
  | 'control_general'
  | 'presupuesto_aditivas'
  | 'mano_obra'
  | 'subcontratos'
  | 'materiales'
  | 'materiales_cliente';

export const ControlTipo1MainView: React.FC = () => {
  const { controlTipo1Data, resetControlTipo1Data } = useERP();
  const [activeSubTab, setActiveSubTab] = useState<SubModuleKey>('control_general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const submodules = [
    {
      id: 'control_general' as SubModuleKey,
      label: 'Control General',
      subtitle: 'Resumen consolidado y flujo',
      icon: FolderKanban,
      color: 'from-amber-500 to-amber-600',
      badge: '01',
    },
    {
      id: 'presupuesto_aditivas' as SubModuleKey,
      label: 'Presupuesto y aditivas',
      subtitle: 'Base, aditivas y deductivas',
      icon: Calculator,
      color: 'from-blue-600 to-indigo-600',
      badge: '02',
    },
    {
      id: 'mano_obra' as SubModuleKey,
      label: 'Mano de obra',
      subtitle: 'Destajos, 5% retención y nómina',
      icon: HardHat,
      color: 'from-orange-500 to-amber-600',
      badge: '03',
    },
    {
      id: 'subcontratos' as SubModuleKey,
      label: 'Sub-C y Prov',
      subtitle: 'Subcontratistas y estimaciones',
      icon: Truck,
      color: 'from-purple-600 to-indigo-600',
      badge: '04',
    },
    {
      id: 'materiales' as SubModuleKey,
      label: 'Materiales',
      subtitle: 'Proveedores, OC y facturas',
      icon: Package,
      color: 'from-amber-600 to-yellow-600',
      badge: '05',
    },
    {
      id: 'materiales_cliente' as SubModuleKey,
      label: 'Materiales compras de cliente',
      subtitle: 'Suministros directos cliente',
      icon: ShoppingBag,
      color: 'from-teal-600 to-emerald-600',
      badge: '06',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Module Identity */}
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
                6 Submódulos Sincronizados
              </span>
            </div>

            <h1 className="text-xl md:text-3xl font-black tracking-tight text-white mt-2">
              Sistema de Control Presupuestal y Costos P0-00
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              Obra: <span className="text-slate-200 font-semibold">Residencia Campestre Vista Bella (P0-00)</span> ·
              Cliente: <span className="text-slate-200 font-semibold">Desarrollos Residenciales del Norte S.A.</span> ·
              S.A. Facturadora: <span className="text-slate-200 font-semibold">Proyectos y Edificaciones Santa Fe S.A. de C.V.</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 shadow-xs"
              title="Restaurar datos predeterminados de las 6 hojas de cálculo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer Plantilla
            </button>
          </div>
        </div>

        {/* 6 Submodules Tab Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {submodules.map((sm) => {
              const Icon = sm.icon;
              const isActive = activeSubTab === sm.id;

              return (
                <button
                  key={sm.id}
                  onClick={() => setActiveSubTab(sm.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {sm.badge}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{sm.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submodule View Switcher */}
      <div className="min-h-[500px]">
        {activeSubTab === 'control_general' && <SubControlGeneral />}
        {activeSubTab === 'presupuesto_aditivas' && <SubPresupuestoAditivas />}
        {activeSubTab === 'mano_obra' && <SubManoObra />}
        {activeSubTab === 'subcontratos' && <SubSubcontratos />}
        {activeSubTab === 'materiales' && <SubMateriales />}
        {activeSubTab === 'materiales_cliente' && <SubMaterialesCliente />}
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
    </div>
  );
};
export default ControlTipo1MainView;
