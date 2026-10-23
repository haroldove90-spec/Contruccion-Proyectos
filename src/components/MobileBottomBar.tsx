import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Building2,
  MessageSquare,
  Landmark,
  PieChart,
  Menu,
  X,
  Receipt,
  Scale,
  TrendingUp,
  BarChart3,
  FileCode2,
} from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const { activeModule, setActiveModule } = useERP();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: 'centros_costos', label: 'Obras', icon: Building2 },
    { id: 'whatsapp_ocr', label: 'OCR WhatsApp', icon: MessageSquare, highlight: true },
    { id: 'tesoreria', label: 'Tesorería', icon: Landmark },
    { id: 'reportes_financieros', label: 'Finanzas', icon: PieChart },
  ];

  const secondaryModules = [
    { id: 'compras_gastos', label: 'Compras y Gastos', icon: Receipt },
    { id: 'cuentas_pagar_cobrar', label: 'Cuentas x Pagar / Cobrar', icon: Scale },
    { id: 'ventas_estimaciones', label: 'Ventas y Estimaciones', icon: TrendingUp },
    { id: 'programa_obra', label: 'Programa de Obra', icon: BarChart3 },
    { id: 'propuesta_tecnica', label: 'Propuesta Técnica ERP', icon: FileCode2 },
  ];

  return (
    <>
      {/* Modal Menú "Más Módulos" en móvil */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-2xl p-4 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800">Todos los Módulos</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 grid grid-cols-1 gap-1">
              {[...mainTabs, ...secondaryModules].map((m) => {
                const Icon = m.icon;
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveModule(m.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Barra de Navegación Fija Inferior */}
      <nav
        aria-label="Navegación móvil"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg"
      >
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors cursor-pointer min-w-[60px] ${
                isActive
                  ? 'text-amber-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-amber-600 stroke-[2.2]' : 'text-slate-500'
                  }`}
                />
                {tab.highlight && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-none">{tab.label}</span>
            </button>
          );
        })}

        {/* Botón Más */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors cursor-pointer min-w-[60px] ${
            showMoreMenu ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-none font-medium">Más</span>
        </button>
      </nav>
    </>
  );
};
