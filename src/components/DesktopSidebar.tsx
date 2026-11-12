import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { useCOD } from '../context/CODContext';
import {
  PieChart,
  TrendingUp,
  Receipt,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface CODModuleItem {
  id: string;
  label: string;
  sublabel: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

const COD_MODULES: CODModuleItem[] = [
  {
    id: 'cod_resumen',
    label: 'Resumen',
    sublabel: 'Ingresos, Egresos y Flujo por S.A.',
    icon: PieChart,
    badge: 'Global',
  },
  {
    id: 'cod_ingresos',
    label: 'Ingresos',
    sublabel: 's/IVA + 16% IVA · S.A. y Banco',
    icon: TrendingUp,
    badge: 'Cobros',
  },
  {
    id: 'cod_egresos',
    label: 'Egresos',
    sublabel: 'Obra + S.A. + Cuenta + WhatsApp OCR',
    icon: Receipt,
    badge: 'Gastos',
  },
  {
    id: 'cod_bancos',
    label: 'Control Bancario y Efectivo',
    sublabel: 'Banorte, IXE, Banregio y Caja',
    icon: Landmark,
    badge: 'Tiempo Real',
  },
];

export const DesktopSidebar: React.FC = () => {
  const { activeModule, setActiveModule } = useERP();
  const { lastSync } = useCOD();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 shrink-0 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider pl-1 block">
              COD
            </span>
            <span className="text-[11px] text-slate-500 pl-1 block">
              Módulos Sincronizados
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-auto"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {COD_MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={collapsed ? mod.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive
                    ? 'text-amber-400'
                    : 'text-slate-500 group-hover:text-slate-900'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs truncate">{mod.label}</span>
                    {mod.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium shrink-0 ${
                          isActive
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] truncate text-slate-400">
                    {mod.sublabel}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!collapsed && lastSync && (
        <div className="p-3 mx-2 mb-3 bg-emerald-50 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lastSync.title}</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 line-clamp-2">
            {lastSync.detail}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>Sincronización en tiempo real</span>
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>COD</span>
          <span className="font-mono">v2.6</span>
        </div>
      )}
    </aside>
  );
};
export default DesktopSidebar;
