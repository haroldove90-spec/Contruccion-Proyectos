import React from 'react';
import { useERP } from '../context/ERPContext';
import { UserRole } from '../types/erp';
import { BrandLogo } from './BrandLogo';
import { Briefcase, Landmark, HardHat, ShoppingCart } from 'lucide-react';

interface RoleCardData {
  id: UserRole;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROLES: RoleCardData[] = [
  {
    id: 'socio',
    name: 'Socio Director',
    icon: Briefcase,
  },
  {
    id: 'admin',
    name: 'Administración & Finanzas',
    icon: Landmark,
  },
  {
    id: 'residente',
    name: 'Residente de Obra',
    icon: HardHat,
  },
  {
    id: 'compras',
    name: 'Compras & Proveedores',
    icon: ShoppingCart,
  },
];

export const RoleSelectionScreen: React.FC = () => {
  const { setCurrentRole } = useERP();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 md:p-12">
      {/* Logo del sistema sin encapsular, centrado en el inicio */}
      <div className="mb-12 md:mb-16 flex flex-col items-center">
        <BrandLogo size="xl" showText={true} />
      </div>

      {/* Cuadrícula 2 Columnas Móvil / 4 Columnas Escritorio */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setCurrentRole(role.id)}
                className="group relative flex flex-col items-center justify-center p-6 md:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-lg hover:border-amber-500/80 hover:-translate-y-1 transition-all duration-200 text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500 active:scale-[0.98]"
              >
                {/* Logo / Icono del rol */}
                <div className="w-16 h-16 md:w-20 md:h-20 mb-5 flex items-center justify-center text-slate-700 group-hover:text-amber-600 transition-colors">
                  <Icon className="w-12 h-12 md:w-14 md:h-14 stroke-[1.6]" />
                </div>

                {/* Solo nombre del rol */}
                <h2 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {role.name}
                </h2>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
