import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { SubmoduleTipo1Key, SubmoduleTipo4DKey } from '../context/ERPContext';
import { UnifiedReportModal } from './UnifiedReportModal';
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
  HardHat,
  Truck,
  Package,
  ShoppingBag,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Printer,
  PlusCircle,
  Briefcase,
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const {
    currentRole,
    activeModule,
    setActiveModule,
    activeSubTipo1,
    setActiveSubTipo1,
    activeSubTipo4D,
    setActiveSubTipo4D,
    lastSingleEntryImpact,
    controlledProjects,
    activeControlledProjectId,
    setActiveControlledProjectId,
    activeControlledProject,
    controlTipo1Data,
    controlTipo4DData,
  } = useERP();

  const [collapsed, setCollapsed] = useState(false);
  const [expandTipo1, setExpandTipo1] = useState(true);
  const [expandTipo3M, setExpandTipo3M] = useState(true);
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);

  // Submodules config for Control_Tipo1_P0-00
  const TIPO1_SUBMODULES: { id: SubmoduleTipo1Key; label: string; badge: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'control_general', label: 'Control General', badge: '01', icon: FolderKanban },
    { id: 'presupuesto_aditivas', label: 'Presupuesto y aditivas', badge: '02', icon: Calculator },
    { id: 'mano_obra', label: 'Mano de obra', badge: '03', icon: HardHat },
    { id: 'subcontratos', label: 'Sub-C y Prov', badge: '04', icon: Truck },
    { id: 'materiales', label: 'Materiales', badge: '05', icon: Package },
    { id: 'materiales_cliente', label: 'Materiales compras cliente', badge: '06', icon: ShoppingBag },
  ];

  // Submodules config for Control_Tipo3M_P0-00
  const TIPO3M_SUBMODULES: { id: SubmoduleTipo4DKey; label: string; badge: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'control_general_4d', label: 'Control General (TIR)', badge: '01', icon: Calculator },
    { id: 'bitacora_observaciones', label: 'Bitácora observaciones', badge: '02', icon: BookOpen },
    { id: 'materiales_cliente_4d', label: 'Materiales compras cliente', badge: '03', icon: ShoppingBag },
  ];

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
          {/* If Role is Proyectos: Multi-Project Switcher + Exclusive Modules */}
          {isProyectosRole ? (
            <div className="space-y-3">
              {/* ================= PROJECT SELECTOR CARD ================= */}
              {!collapsed ? (
                <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Obra Seleccionada
                    </span>
                    <button
                      onClick={() => setActiveModule('historial_proyectos')}
                      className="text-[10px] text-slate-300 hover:text-white underline font-semibold"
                      title="Ver todas las obras registradas"
                    >
                      Ver Catálogo
                    </button>
                  </div>

                  <select
                    value={activeControlledProjectId}
                    onChange={(e) => setActiveControlledProjectId(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    {controlledProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} · {p.name}
                      </option>
                    ))}
                  </select>

                  {/* Quick Unified Report Button */}
                  <button
                    onClick={() => setShowUnifiedModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[11px] font-black transition-all shadow-2xs cursor-pointer"
                    title="Generar un solo reporte uniendo todos los submódulos de esta obra"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Reporte Unificado Completo</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveModule('historial_proyectos')}
                  className="w-full p-2 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center"
                  title="Catálogo de Proyectos"
                >
                  <Briefcase className="w-5 h-5" />
                </button>
              )}

              {/* Catálogo de Obras Link */}
              <button
                onClick={() => setActiveModule('historial_proyectos')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                  activeModule === 'historial_proyectos'
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                title={collapsed ? 'Historial y Catálogo de Proyectos' : undefined}
              >
                <FolderKanban className={`w-4 h-4 shrink-0 ${activeModule === 'historial_proyectos' ? 'text-amber-400' : 'text-slate-500'}`} />
                {!collapsed && (
                  <div className="flex-1 truncate">
                    <div className="font-bold">Historial de Proyectos</div>
                    <div className="text-[10px] text-slate-400">Catálogo y Reportes Unificados</div>
                  </div>
                )}
              </button>

              {/* ================= GROUP 1: Control_Tipo1_P0-00 ================= */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-1.5 overflow-hidden">
                <button
                  onClick={() => {
                    setActiveModule('control_tipo1');
                    if (collapsed) setCollapsed(false);
                    else setExpandTipo1(!expandTipo1);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                    activeModule === 'control_tipo1'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FolderKanban className={`w-4 h-4 shrink-0 ${activeModule === 'control_tipo1' ? 'text-slate-950' : 'text-amber-600'}`} />
                    {!collapsed && (
                      <div className="text-left truncate">
                        <div className="text-xs font-bold tracking-tight">Control_Tipo1_P0-00</div>
                        <div className={`text-[10px] truncate ${activeModule === 'control_tipo1' ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                          6 Submódulos de Obra
                        </div>
                      </div>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="shrink-0 text-slate-500">
                      {expandTipo1 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </button>

                {/* Submodules list for Tipo 1 */}
                {!collapsed && expandTipo1 && (
                  <div className="mt-1 pl-2 pr-1 space-y-0.5 border-l-2 border-amber-300 ml-3 py-1">
                    {TIPO1_SUBMODULES.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeModule === 'control_tipo1' && activeSubTipo1 === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveModule('control_tipo1');
                            setActiveSubTipo1(sub.id);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                            isSubActive
                              ? 'bg-slate-900 text-white font-bold shadow-2xs'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                              isSubActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {sub.badge}
                          </span>
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ================= GROUP 2: Control_Tipo3M_P0-00 ================= */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-1.5 overflow-hidden">
                <button
                  onClick={() => {
                    setActiveModule('control_tipo4d');
                    if (collapsed) setCollapsed(false);
                    else setExpandTipo3M(!expandTipo3M);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                    activeModule === 'control_tipo4d'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Calculator className={`w-4 h-4 shrink-0 ${activeModule === 'control_tipo4d' ? 'text-white' : 'text-indigo-600'}`} />
                    {!collapsed && (
                      <div className="text-left truncate">
                        <div className="text-xs font-bold tracking-tight">Control_Tipo3M_P0-00</div>
                        <div className={`text-[10px] truncate ${activeModule === 'control_tipo4d' ? 'text-indigo-200 font-semibold' : 'text-slate-400'}`}>
                          TIR = A - B - C · 3 Submódulos
                        </div>
                      </div>
                    )}
                  </div>
                  {!collapsed && (
                    <div className="shrink-0 text-slate-400">
                      {expandTipo3M ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </button>

                {/* Submodules list for Tipo 3M */}
                {!collapsed && expandTipo3M && (
                  <div className="mt-1 pl-2 pr-1 space-y-0.5 border-l-2 border-indigo-400 ml-3 py-1">
                    {TIPO3M_SUBMODULES.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = activeModule === 'control_tipo4d' && activeSubTipo4D === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveModule('control_tipo4d');
                            setActiveSubTipo4D(sub.id);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                            isSubActive
                              ? 'bg-slate-900 text-white font-bold shadow-2xs'
                              : 'text-slate-600 hover:bg-white hover:text-slate-900'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                              isSubActive ? 'bg-indigo-400 text-slate-950' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {sub.badge}
                          </span>
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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

      {/* Unified Report Modal preview triggered from sidebar */}
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
export default DesktopSidebar;
