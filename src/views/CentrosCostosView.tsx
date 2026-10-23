import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Project, ProjectStatus } from '../types/erp';
import {
  Building2,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const CentrosCostosView: React.FC = () => {
  const {
    projects,
    companies,
    activeCompanyId,
    setActiveCompanyId,
    createProject,
    expenses,
    setActiveModule,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);

  // Form State for new Project
  const [formData, setFormData] = useState({
    code: `CC-${Math.floor(Math.random() * 800 + 100)}`,
    name: '',
    client: '',
    companyId: companies[0]?.id || 'EDIF',
    initialBudget: 5000000,
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    residente: 'Ing. Residente de Campo',
    physicalProgress: 0,
    status: 'ejecucion' as ProjectStatus,
  });

  // Filtered list
  const filteredProjects = projects.filter((p) => {
    const matchesCompany = activeCompanyId === 'ALL' || p.companyId === activeCompanyId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesCompany && matchesSearch && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.client) return;

    createProject({
      code: formData.code,
      name: formData.name,
      client: formData.client,
      companyId: formData.companyId,
      initialBudget: Number(formData.initialBudget),
      location: formData.location || 'Ubicación de obra en desarrollo',
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      residente: formData.residente,
      physicalProgress: Number(formData.physicalProgress),
    });

    setShowNewProjectModal(false);
    setFormData({
      code: `CC-${Math.floor(Math.random() * 800 + 100)}`,
      name: '',
      client: '',
      companyId: companies[0]?.id || 'EDIF',
      initialBudget: 5000000,
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      residente: 'Ing. Residente de Campo',
      physicalProgress: 0,
      status: 'ejecucion',
    });
  };

  // Aggregated totals
  const totalBudget = filteredProjects.reduce((acc, p) => acc + p.initialBudget, 0);
  const totalSpent = filteredProjects.reduce((acc, p) => acc + p.spent, 0);
  const totalBilled = filteredProjects.reduce((acc, p) => acc + p.billed, 0);
  const totalCollected = filteredProjects.reduce((acc, p) => acc + p.collected, 0);

  return (
    <div className="space-y-6">
      {/* Header View */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Módulo A</span>
              <span>·</span>
              <span>Centros de Costos Independientes</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Proyectos y Obras de Construcción
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Administración de presupuestos iniciales, asignación por S.A. facturadora y control de gasto diario sin fragmentación.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Alta de Obra / Proyecto</span>
            </button>
          </div>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Presupuesto Contratado
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-slate-900 mt-1">
              ${totalBudget.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">
              {filteredProjects.length} obras registradas
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Gasto Ejercido Real
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-amber-700 mt-1">
              ${totalSpent.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% ejercido
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Estimaciones Facturadas
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-blue-700 mt-1">
              ${totalBilled.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Avance cobrable</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Cobranza Real Bancos
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-emerald-700 mt-1">
              ${totalCollected.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-emerald-600 font-mono">
              ${(totalBilled - totalCollected).toLocaleString('es-MX')} por cobrar
            </span>
          </div>
        </div>
      </div>

      {/* Filtros de Búsqueda y Estado */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre de obra, cliente o clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl overflow-x-auto text-xs">
          {(['all', 'ejecucion', 'cierre', 'por_iniciar'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all'
                ? 'Todas las Obras'
                : st === 'ejecucion'
                ? 'En Ejecución'
                : st === 'cierre'
                ? 'En Cierre'
                : 'Por Iniciar'}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla de Centros de Costos / Obras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const company = companies.find((c) => c.id === project.companyId);
          const isOverBudget = project.financialProgress > project.physicalProgress + 5;
          const pendingToCollect = project.billed - project.collected;
          const availableBudget = project.initialBudget - project.spent;

          return (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      {project.code}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                      {project.name}
                    </h2>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.client}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                      project.status === 'ejecucion'
                        ? 'bg-emerald-100 text-emerald-800'
                        : project.status === 'cierre'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {project.status === 'ejecucion'
                      ? 'En Obra'
                      : project.status === 'cierre'
                      ? 'Cierre'
                      : 'Por Iniciar'}
                  </span>
                </div>

                {/* S.A. Facturadora */}
                <div className="mt-3 flex items-center gap-1 text-xs text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">{company?.shortName}</span>
                </div>

                {/* Avance Físico vs Financiero */}
                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Avance Físico:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {project.physicalProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-slate-900 h-2 rounded-full transition-all"
                        style={{ width: `${project.physicalProgress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium">Gasto Financiero Ejercido:</span>
                      <span
                        className={`font-mono font-bold ${
                          isOverBudget ? 'text-amber-600' : 'text-slate-700'
                        }`}
                      >
                        {project.financialProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverBudget ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, project.financialProgress)}%` }}
                      />
                    </div>
                  </div>

                  {isOverBudget && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Alerta: Gasto financiero supera el avance físico</span>
                    </div>
                  )}
                </div>

                {/* Financial breakdown metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Presupuesto Inicial:</span>
                    <span className="font-mono font-bold text-slate-800">
                      ${project.initialBudget.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gasto Acumulado:</span>
                    <span className="font-mono font-bold text-amber-700">
                      ${project.spent.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Saldo Presupuesto:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      ${availableBudget.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cobranza Real:</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      ${project.collected.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedProjectForDetail(project)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Detalles y Gastos
                </button>

                <button
                  onClick={() => setActiveModule('whatsapp_ocr')}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                >
                  + Cargar Ticket
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Alta de Obra / Centro de Costos */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Alta de Obra / Centro de Costos
                </h3>
              </div>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Código de Obra
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    S.A. Facturadora Asignada
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.shortName} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nombre de la Obra / Proyecto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Obra Juárez 150"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cliente Contratante
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Desarrollos Urbanos MX"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Presupuesto Inicial ($ MXN)
                  </label>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="10000"
                    value={formData.initialBudget}
                    onChange={(e) =>
                      setFormData({ ...formData, initialBudget: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Ubicación de la Obra
                </label>
                <input
                  type="text"
                  placeholder="Dirección o punto de localización"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Ingeniero / Residente de Obra
                  </label>
                  <input
                    type="text"
                    value={formData.residente}
                    onChange={(e) => setFormData({ ...formData, residente: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Avance Físico Inicial (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.physicalProgress}
                    onChange={(e) =>
                      setFormData({ ...formData, physicalProgress: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Guardar Centro de Costos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle de Centro de Costos */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600">
                  {selectedProjectForDetail.code}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedProjectForDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProjectForDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Presupuesto:</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${selectedProjectForDetail.initialBudget.toLocaleString('es-MX')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Gasto:</span>
                  <span className="font-mono font-bold text-amber-700">
                    ${selectedProjectForDetail.spent.toLocaleString('es-MX')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Facturado:</span>
                  <span className="font-mono font-bold text-blue-700">
                    ${selectedProjectForDetail.billed.toLocaleString('es-MX')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Cobrado:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ${selectedProjectForDetail.collected.toLocaleString('es-MX')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Gastos y Tickets Asociados a la Obra
                </h4>
                {expenses.filter((e) => e.projectId === selectedProjectForDetail.id).length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {expenses
                      .filter((e) => e.projectId === selectedProjectForDetail.id)
                      .map((exp) => (
                        <div
                          key={exp.id}
                          className="p-3 flex items-center justify-between text-xs bg-white hover:bg-slate-50"
                        >
                          <div>
                            <div className="font-semibold text-slate-900">{exp.provider}</div>
                            <div className="text-[11px] text-slate-500">
                              {exp.category} · Folio: {exp.invoiceFolio} · {exp.date}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900">
                              ${exp.amount.toLocaleString('es-MX')}
                            </span>
                            <div className="text-[10px] text-emerald-600 font-medium">
                              {exp.capturedVia === 'whatsapp' ? '📲 WhatsApp OCR' : '💻 Manual'}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                    No hay gastos cargados en esta obra aún.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProjectForDetail(null)}
                className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
