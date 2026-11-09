import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { NewProjectModal } from './NewProjectModal';
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
  FolderKanban,
  Calculator,
  Plus,
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const {
    currentRole,
    activeModule,
    setActiveModule,
    lastSingleEntryImpact,
    setProjectWorkspaceMode,
  } = useERP();

  const [collapsed, setCollapsed] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  interface RoleModuleItem {
    id: string;
    label: string;
    sublabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
    highlight?: boolean;
  }

  // Standard modules for other roles (Strictly filtered by role)
  const getModulesForRole = (): RoleModuleItem[] => {
    switch (currentRole) {
      case 'socio':
        return [
          {
            id: 'reportes_financieros',
            label: 'Reportes Financieros',
            sublabel: 'Balance, P&L y Utilidad Real',
            icon: PieChart,
            badge: 'Tiempo Real',
          },
          {
            id: 'centros_costos',
            label: 'Centros de Costos',
            sublabel: 'Obras y Presupuestos',
            icon: Building2,
            badge: 'ERP',
          },
          {
            id: 'ventas_estimaciones',
            label: 'Ventas y Estimaciones',
            sublabel: 'Cobranza y Avance',
            icon: TrendingUp,
          },
          {
            id: 'propuesta_tecnica',
            label: 'Propuesta Técnica ERP',
            sublabel: 'Dossier y Arquitectura',
            icon: FileCode2,
          },
        ];
      case 'admin':
        return [
          {
            id: 'tesoreria',
            label: 'Tesorería y Bancos',
            sublabel: 'Cajas, Cuentas y Flujo',
            icon: Landmark,
            badge: 'Clave',
          },
          {
            id: 'cuentas_pagar_cobrar',
            label: 'Cuentas por Pagar / Cobrar',
            sublabel: 'Proveedores y Clientes',
            icon: Scale,
          },
          {
            id: 'compras_gastos',
            label: 'Compras y Gastos',
            sublabel: 'Órdenes y Facturas',
            icon: Receipt,
          },
          {
            id: 'centros_costos',
            label: 'Centros de Costos',
            sublabel: 'Obras y Presupuestos',
            icon: Building2,
            badge: 'ERP',
          },
        ];
      case 'residente':
        return [
          {
            id: 'programa_obra',
            label: 'Programa de Obra',
            sublabel: 'Avance % vs Gasto Ejercido',
            icon: BarChart3,
            badge: 'Campo',
          },
          {
            id: 'centros_costos',
            label: 'Centros de Costos',
            sublabel: 'Obras Asignadas',
            icon: Building2,
            badge: 'ERP',
          },
          {
            id: 'compras_gastos',
            label: 'Compras y Gastos',
            sublabel: 'Requisiciones y Facturas',
            icon: Receipt,
          },
        ];
      case 'compras':
        return [
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
            sublabel: 'Órdenes y Catálogo Prov.',
            icon: Receipt,
          },
          {
            id: 'cuentas_pagar_cobrar',
            label: 'Cuentas por Pagar',
            sublabel: 'Vencimientos a Proveedores',
            icon: Scale,
          },
        ];
      default:
        return [];
    }
  };

  const isProyectosRole = currentRole === 'proyectos';
  const roleModules = getModulesForRole();

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 shrink-0 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          {!collapsed && (
            <div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider pl-1 block font-mono">
                {currentRole ? `ROL: ${currentRole.toUpperCase()}` : 'SISTEMA'}
              </span>
              <span className="text-xs font-bold text-slate-800 pl-1">
                {isProyectosRole ? 'Control de Proyectos & Obras' : 'Módulos Autorizados'}
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

        {/* Navigation List */}
        <div className="flex-1 py-3 px-2 space-y-3 overflow-y-auto">
          {/* If Role is Proyectos: Simple, Clean Navigation with Visible [+ Nuevo Proyecto] Button */}
          {isProyectosRole ? (
            <div className="space-y-3">
              {/* Prominent Action Button: + Nuevo Proyecto */}
              {!collapsed ? (
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-xs hover:shadow-sm cursor-pointer"
                  title="Dar de alta un nuevo proyecto para Control Tipo 1 o Tipo 3M"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Nuevo Proyecto</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="w-full p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center shadow-xs cursor-pointer"
                  title="Agregar Nuevo Proyecto"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              )}

              {/* MODULE 1: Control_Tipo1_P0-00 */}
              <button
                onClick={() => {
                  setActiveModule('control_tipo1');
                  setProjectWorkspaceMode('catalog');
                }}
                className={`w-full group flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                  activeModule === 'control_tipo1'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-600/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                }`}
                title={collapsed ? 'Control_Tipo1_P0-00 (Historial y 6 Submódulos)' : undefined}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeModule === 'control_tipo1'
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                </div>

                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black tracking-tight truncate">
                        Control_Tipo1_P0-00
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                          activeModule === 'control_tipo1'
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        6 Subm.
                      </span>
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        activeModule === 'control_tipo1' ? 'text-slate-900 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      Historial y 6 Submódulos de Obra
                    </div>
                  </div>
                )}
              </button>

              {/* MODULE 2: Control_Tipo3M_P0-00 */}
              <button
                onClick={() => {
                  setActiveModule('control_tipo4d');
                  setProjectWorkspaceMode('catalog');
                }}
                className={`w-full group flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer ${
                  activeModule === 'control_tipo4d'
                    ? 'bg-indigo-600 text-white font-black shadow-xs ring-1 ring-indigo-700/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/80'
                }`}
                title={collapsed ? 'Control_Tipo3M_P0-00 (Historial y 3 Submódulos TIR)' : undefined}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    activeModule === 'control_tipo4d'
                      ? 'bg-white text-indigo-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                </div>

                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black tracking-tight truncate">
                        Control_Tipo3M_P0-00
                      </div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                          activeModule === 'control_tipo4d'
                            ? 'bg-indigo-800 text-indigo-100'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        3 Subm.
                      </span>
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        activeModule === 'control_tipo4d' ? 'text-indigo-100 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      TIR = A - B - C · 3 Submódulos
                    </div>
                  </div>
                )}
              </button>
            </div>
          ) : (
            /* For other roles: Strictly show only their allowed modules */
            <div className="space-y-1">
              {roleModules.map((mod) => {
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
                        <div className="text-[11px] truncate text-slate-400">
                          {mod.sublabel}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
              <span>Actualización en tiempo real</span>
            </div>
          </div>
        )}

        {/* System Footer info */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Grupo Constructor ERP</span>
            <span className="font-mono">v2.6 PWA</span>
          </div>
        )}
      </aside>

      {/* Modal to Add New Project */}
      {showNewProjectModal && (
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      )}
    </>
  );
};
export default DesktopSidebar;
