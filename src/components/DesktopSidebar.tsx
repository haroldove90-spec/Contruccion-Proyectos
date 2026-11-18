import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { useCOD } from '../context/CODContext';
import {
  PieChart,
  TrendingUp,
  Receipt,
  Landmark,
  CreditCard,
  Bell,
  FolderCog,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface CDOModuleItem {
  id: string;
  label: string;
  sublabel: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

const CDO_MODULES: CDOModuleItem[] = [
  {
    id: 'cdo_resumen',
    label: 'Resumen',
    sublabel: 'Ingresos, Egresos y Flujo por S.A.',
    icon: PieChart,
    badge: 'Global',
  },
  {
    id: 'cdo_ingresos',
    label: 'Ingresos',
    sublabel: 's/IVA + 16% IVA · Cliente y Banco',
    icon: TrendingUp,
    badge: 'Cobros',
  },
  {
    id: 'cdo_egresos',
    label: 'Egresos',
    sublabel: 'Obra + S.A. + Cuenta + WhatsApp OCR',
    icon: Receipt,
    badge: 'Gastos',
  },
  {
    id: 'cdo_bancos',
    label: 'Control Bancario y Efectivo',
    sublabel: 'Cuentas Bancarias (8+) y Cajas',
    icon: Landmark,
    badge: 'Tiempo Real',
  },
  {
    id: 'cdo_prestamos',
    label: 'Préstamos y Tarjetas',
    sublabel: 'Créditos por Cliente / Proyecto',
    icon: CreditCard,
    badge: 'Deuda',
  },
  {
    id: 'cdo_notificaciones',
    label: 'Notificaciones',
    sublabel: 'Autorizaciones Admin ↔ Contadora',
    icon: Bell,
  },
  {
    id: 'cdo_catalogos',
    label: 'Catálogos y Clientes',
    sublabel: 'Clientes, Proyectos, S.A. y Conceptos',
    icon: FolderCog,
    badge: 'Control',
  },
  {
    id: 'cdo_perfil',
    label: 'Mi Perfil',
    sublabel: 'Datos personales y contraseña',
    icon: UserCircle2,
    badge: 'Cuenta',
  },
];

export const DesktopSidebar: React.FC = () => {
  const { activeModule, setActiveModule, currentRole } = useERP();
  const { lastSync, currentUser, unreadNotificationsCount, pendingApprovalsCount } = useCOD();
  const [collapsed, setCollapsed] = useState(false);

  const roleLabel = currentRole === 'admin' ? 'Admin' : 'Administración';
  const notifCount =
    currentRole === 'admin'
      ? Math.max(unreadNotificationsCount, pendingApprovalsCount)
      : unreadNotificationsCount;

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 shrink-0 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 pl-1">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                CDO
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentRole === 'admin'
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {roleLabel}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 pl-1 block truncate">
              {currentUser?.fullName || 'Control Total y Sincronización'}
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
        {CDO_MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          const isNotif = mod.id === 'cdo_notificaciones';
          const dynamicBadge = isNotif && notifCount > 0 ? String(notifCount) : mod.badge;

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
              <div className="relative shrink-0">
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? 'text-amber-400'
                      : 'text-slate-500 group-hover:text-slate-900'
                  }`}
                />
                {collapsed && isNotif && notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-600" />
                )}
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs truncate">{mod.label}</span>
                    {dynamicBadge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold shrink-0 ${
                          isNotif && notifCount > 0
                            ? 'bg-rose-600 text-white'
                            : isActive
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {dynamicBadge}
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
        <div
          className={`p-3 mx-2 mb-3 border rounded-xl ${
            lastSync.isError
              ? 'bg-rose-50 border-rose-200/80'
              : 'bg-emerald-50 border-emerald-200/80'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs font-bold ${
              lastSync.isError ? 'text-rose-800' : 'text-emerald-800'
            }`}
          >
            <Zap
              className={`w-3.5 h-3.5 ${
                lastSync.isError ? 'text-rose-600' : 'text-emerald-600'
              }`}
            />
            <span>{lastSync.title}</span>
          </div>
          <p
            className={`text-[11px] mt-1 line-clamp-2 ${
              lastSync.isError ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {lastSync.detail}
          </p>
          <div
            className={`mt-1 flex items-center gap-1 text-[10px] font-medium ${
              lastSync.isError ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>
              {lastSync.isError ? 'Error al guardar en Supabase' : 'Sincronización en tiempo real'}
            </span>
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>CDO · {roleLabel}</span>
          <span className="font-mono">v2.7</span>
        </div>
      )}
    </aside>
  );
};
export default DesktopSidebar;
