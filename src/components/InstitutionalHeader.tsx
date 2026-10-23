import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { ExecutivePDFModal } from './ExecutivePDFModal';
import { LogOut, ChevronDown, Building2, User, Printer } from 'lucide-react';
import { UserRole } from '../types/erp';

const ROLE_NAMES: Record<UserRole, { label: string; badgeColor: string }> = {
  socio: { label: 'Socio Director', badgeColor: 'bg-slate-800 text-amber-400' },
  admin: { label: 'Administración & Finanzas', badgeColor: 'bg-blue-900 text-blue-200' },
  residente: { label: 'Residente de Obra', badgeColor: 'bg-amber-600 text-white' },
  compras: { label: 'Compras & Proveedores', badgeColor: 'bg-emerald-700 text-white' },
};

export const InstitutionalHeader: React.FC<{ onToggleSidebar?: () => void }> = () => {
  const [showPDFModal, setShowPDFModal] = useState(false);
  const {
    currentRole,
    setCurrentRole,
    activeCompanyId,
    setActiveCompanyId,
    companies,
  } = useERP();

  const activeRoleData = currentRole ? ROLE_NAMES[currentRole] : null;

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Company Selector */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <BrandLogo size="sm" showText={true} />

          {/* S.A. Filter Selector */}
          <div className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-200 text-xs">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={activeCompanyId}
              onChange={(e) => setActiveCompanyId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">🏢 Consolidado Grupo (3 S.A.)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shortName} ({c.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Active Role, PWA Install & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Role Identifier with quick role switch dropdown */}
          {activeRoleData && (
            <div className="relative group">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer text-xs font-semibold text-slate-800">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentRole === 'socio'
                      ? 'bg-amber-500'
                      : currentRole === 'admin'
                      ? 'bg-blue-600'
                      : currentRole === 'residente'
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                />
                <span className="hidden sm:inline font-bold text-slate-900">
                  {activeRoleData.label}
                </span>
                <span className="sm:hidden font-bold text-slate-900">
                  {currentRole === 'socio'
                    ? 'Socio'
                    : currentRole === 'admin'
                    ? 'Admin'
                    : currentRole === 'residente'
                    ? 'Obra'
                    : 'Compras'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </div>

              {/* Quick switch menu */}
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Cambiar de Rol
                </div>
                {(['socio', 'admin', 'residente', 'compras'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setCurrentRole(r)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentRole === r
                        ? 'font-bold text-amber-600 bg-amber-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{ROLE_NAMES[r].label}</span>
                    {currentRole === r && <span className="text-[10px] text-amber-600 font-bold">Activo</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PDF Dossier for Client */}
          <button
            onClick={() => setShowPDFModal(true)}
            title="Ver / Imprimir Ficha Técnica en PDF para el Cliente"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">PDF Cliente</span>
          </button>

          {/* Quick PWA Install Button */}
          <PWAInstallButton compact={true} />

          {/* Session Logout Button */}
          <button
            onClick={() => setCurrentRole(null)}
            title="Cerrar sesión y volver al selector de roles"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Modal Ficha Técnica en PDF */}
      <ExecutivePDFModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
      />
    </header>
  );
};
