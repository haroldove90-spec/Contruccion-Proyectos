import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { useCOD } from '../context/CODContext';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { ExecutivePDFModal } from './ExecutivePDFModal';
import { LogOut, Building2, Printer, UserCircle2 } from 'lucide-react';
import { UserRole } from '../types/erp';

const ROLE_NAMES: Record<UserRole, { label: string; badgeClass: string }> = {
  admin: { label: 'Admin', badgeClass: 'bg-amber-400 text-slate-950' },
  administracion: { label: 'Administración', badgeClass: 'bg-blue-500 text-white' },
};

export const InstitutionalHeader: React.FC<{ onToggleSidebar?: () => void }> = () => {
  const [showPDFModal, setShowPDFModal] = useState(false);
  const { currentRole, setCurrentRole, setActiveModule } = useERP();
  const {
    companies,
    selectedCompanyFilter,
    setSelectedCompanyFilter,
    currentUser,
    logout,
  } = useCOD();

  const activeRoleData = currentRole ? ROLE_NAMES[currentRole] : null;

  const handleLogout = () => {
    logout();
    setCurrentRole(null);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & S.A. Filter */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <BrandLogo size="sm" showText={true} />

          <div className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-200 text-xs">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Consolidado Grupo ({companies.length} S.A.)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Active User + Role, Profile Shortcut, PDF, PWA Install & Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {currentUser && activeRoleData && (
            <button
              type="button"
              onClick={() => setActiveModule('cdo_perfil')}
              title="Ir a Mi Perfil y Configuración Personal"
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              <UserCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline truncate max-w-[140px]">
                {currentUser.fullName}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide ${activeRoleData.badgeClass}`}
              >
                {activeRoleData.label}
              </span>
            </button>
          )}

          <button
            onClick={() => setShowPDFModal(true)}
            title="Ver / Imprimir Ficha Técnica en PDF para el Cliente"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">PDF Cliente</span>
          </button>

          <PWAInstallButton compact={true} />

          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      <ExecutivePDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
      />
    </header>
  );
};
