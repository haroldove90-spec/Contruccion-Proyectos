import React from 'react';
import { useERP } from '../context/ERPContext';
import { PieChart, TrendingUp, Receipt, Landmark } from 'lucide-react';

const COD_MOBILE_TABS = [
  { id: 'cod_resumen', label: 'Resumen', icon: PieChart },
  { id: 'cod_ingresos', label: 'Ingresos', icon: TrendingUp },
  { id: 'cod_egresos', label: 'Egresos', icon: Receipt },
  { id: 'cod_bancos', label: 'Bancos', icon: Landmark },
];

export const MobileBottomBar: React.FC = () => {
  const { activeModule, setActiveModule } = useERP();

  return (
    <nav
      aria-label="Navegación móvil COD"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
    >
      {COD_MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeModule === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveModule(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-colors cursor-pointer min-w-[64px] ${
              isActive
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                isActive ? 'text-amber-600 stroke-[2.2]' : 'text-slate-500'
              }`}
            />
            <span className="text-[10px] mt-0.5 leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomBar;
