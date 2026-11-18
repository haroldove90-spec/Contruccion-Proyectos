import React from 'react';
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
} from 'lucide-react';

const CDO_MOBILE_TABS = [
  { id: 'cdo_resumen', label: 'Resumen', icon: PieChart },
  { id: 'cdo_ingresos', label: 'Ingresos', icon: TrendingUp },
  { id: 'cdo_egresos', label: 'Egresos', icon: Receipt },
  { id: 'cdo_bancos', label: 'Bancos', icon: Landmark },
  { id: 'cdo_prestamos', label: 'Préstamos', icon: CreditCard },
  { id: 'cdo_notificaciones', label: 'Alertas', icon: Bell },
  { id: 'cdo_catalogos', label: 'Catálogos', icon: FolderCog },
  { id: 'cdo_perfil', label: 'Perfil', icon: UserCircle2 },
];

export const MobileBottomBar: React.FC = () => {
  const { activeModule, setActiveModule, currentRole } = useERP();
  const { unreadNotificationsCount, pendingApprovalsCount } = useCOD();

  const notifCount =
    currentRole === 'admin'
      ? Math.max(unreadNotificationsCount, pendingApprovalsCount)
      : unreadNotificationsCount;

  return (
    <nav
      aria-label="Navegación móvil CDO"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-start sm:justify-around gap-1 overflow-x-auto shadow-lg"
    >
      {CDO_MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeModule === tab.id;
        const isNotif = tab.id === 'cdo_notificaciones';

        return (
          <button
            key={tab.id}
            onClick={() => setActiveModule(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors cursor-pointer min-w-[58px] shrink-0 ${
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
              {isNotif && notifCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-none">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileBottomBar;
