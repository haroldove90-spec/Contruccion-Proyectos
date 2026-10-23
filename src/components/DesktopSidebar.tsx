import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Building2,
  Receipt,
  Landmark,
  Scale,
  TrendingUp,
  BarChart3,
  PieChart,
  MessageSquare,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const MODULES_CONFIG = [
  {
    id: 'centros_costos',
    label: 'Centros de Costos',
    sublabel: 'Obras y Presupuestos',
    icon: Building2,
    badge: 'Proyectos',
  },
  {
    id: 'whatsapp_ocr',
    label: 'WhatsApp OCR',
    sublabel: 'Carga Única Automática',
    icon: MessageSquare,
    badge: 'Clave IA',
    highlight: true,
  },
  {
    id: 'compras_gastos',
    label: 'Compras y Gastos',
    sublabel: 'Órdenes y Facturas',
    icon: Receipt,
  },
  {
    id: 'tesoreria',
    label: 'Tesorería y Bancos',
    sublabel: 'Cajas, Cuentas y Flujo',
    icon: Landmark,
  },
  {
    id: 'cuentas_pagar_cobrar',
    label: 'Cuentas por Pagar / Cobrar',
    sublabel: 'Proveedores y Clientes',
    icon: Scale,
  },
  {
    id: 'ventas_estimaciones',
    label: 'Ventas y Estimaciones',
    sublabel: 'Cobranza y Avance',
    icon: TrendingUp,
  },
  {
    id: 'programa_obra',
    label: 'Programa de Obra',
    sublabel: 'Avance % vs Gasto Ejercido',
    icon: BarChart3,
  },
  {
    id: 'reportes_financieros',
    label: 'Reportes Financieros',
    sublabel: 'Balance, P&L y Utilidad Real',
    icon: PieChart,
    badge: 'Tiempo Real',
  },
  {
    id: 'propuesta_tecnica',
    label: 'Propuesta Técnica ERP',
    sublabel: 'Fases, Costos y Arquitectura',
    icon: FileCode2,
  },
];

export const DesktopSidebar: React.FC = () => {
  const { activeModule, setActiveModule, lastSingleEntryImpact } = useERP();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 shrink-0 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Sidebar Controls Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">
            Módulos del Sistema
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-auto"
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {MODULES_CONFIG.map((mod) => {
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
              } ${mod.highlight && !isActive ? 'ring-1 ring-amber-300/80 bg-amber-50/40 text-amber-900' : ''}`}
              title={collapsed ? mod.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive
                    ? 'text-amber-400'
                    : mod.highlight
                    ? 'text-amber-600'
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
                  <div
                    className={`text-[11px] truncate ${
                      isActive ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {mod.sublabel}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Live Single Entry Status Notification Widget */}
      {!collapsed && lastSingleEntryImpact && (
        <div className="p-3 mx-2 mb-3 bg-emerald-50 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Última Carga Única</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 line-clamp-2">
            {lastSingleEntryImpact.impactSummary.costCenter}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>4 módulos actualizados</span>
          </div>
        </div>
      )}

      {/* System Footer info */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Grupo Constructor ERP</span>
          <span className="font-mono">v2.4 PWA</span>
        </div>
      )}
    </aside>
  );
};
