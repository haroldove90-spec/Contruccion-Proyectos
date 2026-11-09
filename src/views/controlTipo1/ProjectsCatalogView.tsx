import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ControlledProject, ControlType } from '../../types/projectControl';
import { UnifiedReportModal } from '../../components/UnifiedReportModal';
import {
  FolderKanban,
  Calculator,
  Plus,
  Printer,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Search,
  X,
  Layers,
} from 'lucide-react';

interface ProjectsCatalogViewProps {
  filterType?: 'tipo1' | 'tipo3m' | 'all';
  onSelectProject?: (project: ControlledProject) => void;
  titleOverride?: string;
  subtitleOverride?: string;
}

export const ProjectsCatalogView: React.FC<ProjectsCatalogViewProps> = ({
  filterType = 'all',
  onSelectProject,
  titleOverride,
  subtitleOverride,
}) => {
  const {
    controlledProjects,
    activeControlledProjectId,
    setActiveControlledProjectId,
    addControlledProject,
    deleteControlledProject,
    controlTipo1Data,
    controlTipo4DData,
    setActiveModule,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedReportProject, setSelectedReportProject] = useState<ControlledProject | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ControlledProject | null>(null);

  const initialType: ControlType = filterType === 'tipo3m' ? 'tipo3m' : 'tipo1';

  // Form State
  const [form, setForm] = useState({
    code: `P0-0${controlledProjects.length}`,
    name: '',
    client: '',
    billingCompany: 'Proyectos y Edificaciones Santa Fe S.A. de C.V.',
    controlType: initialType,
    initialBudget: 3500000,
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleOpenNew = () => {
    setForm({
      code: `P0-0${controlledProjects.length}`,
      name: '',
      client: '',
      billingCompany: 'Proyectos y Edificaciones Santa Fe S.A. de C.V.',
      controlType: initialType,
      initialBudget: 3500000,
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowNewModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;

    const newProj = addControlledProject({
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      client: form.client.trim() || 'Cliente Particular',
      billingCompany: form.billingCompany,
      controlType: form.controlType,
      status: 'en_captura',
      initialBudget: Number(form.initialBudget) || 0,
      startDate: form.startDate,
      notes: form.notes,
    });

    setShowNewModal(false);

    if (onSelectProject) {
      onSelectProject(newProj);
    }
  };

  const handleOpenProject = (proj: ControlledProject) => {
    setActiveControlledProjectId(proj.id);
    if (onSelectProject) {
      onSelectProject(proj);
    } else {
      if (proj.controlType === 'tipo1') {
        setActiveModule('control_tipo1');
      } else {
        setActiveModule('control_tipo4d');
      }
    }
  };

  // Filter projects by filterType and search
  const filteredProjects = controlledProjects.filter((p) => {
    const matchType = filterType === 'all' ? true : p.controlType === filterType;
    const q = searchTerm.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const displayTitle =
    titleOverride ||
    (filterType === 'tipo1'
      ? 'Obras y Proyectos (Control Tipo 1)'
      : filterType === 'tipo3m'
      ? 'Proyectos de Diseño y Obra (Control Tipo 3M)'
      : 'Historial y Catálogo de Proyectos');

  const displaySubtitle =
    subtitleOverride ||
    (filterType === 'tipo1'
      ? 'Seleccione una obra para consultar y capturar sus 6 submódulos operativos, o genere su reporte unificado.'
      : filterType === 'tipo3m'
      ? 'Seleccione un proyecto para consultar y capturar sus 3 submódulos (TIR, Bitácora y Materiales Cliente).'
      : 'Capture independientemente cada obra por submódulos y genere un solo reporte unificado consolidado en PDF y Excel.');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-5 md:p-6 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 rounded-lg">
              ROL: PROYECTOS
            </span>
            <span className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {filterType === 'tipo1'
                ? 'Plantilla de 6 Submódulos'
                : filterType === 'tipo3m'
                ? 'Plantilla de 3 Submódulos (TIR)'
                : 'Gestión Centralizada de Obras'}
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-white mt-1.5">
            {displayTitle}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            {displaySubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Agregar Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código de obra (P0-00), nombre del proyecto o cliente..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-slate-500 px-2">
          {filteredProjects.length} obra(s) encontrada(s)
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-2xs">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No hay proyectos en esta sección</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Utilice el botón superior para dar de alta un nuevo proyecto y comenzar a capturar sus submódulos.
            </p>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const isActive = proj.id === activeControlledProjectId;
            const isT1 = proj.controlType === 'tipo1';

            return (
              <div
                key={proj.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'border-amber-400 shadow-md ring-2 ring-amber-400/30'
                    : 'border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-900 text-amber-400 font-mono font-black text-xs rounded-lg">
                        {proj.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isT1
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {isT1 ? 'Control_Tipo1 (6 Submódulos)' : 'Control_Tipo3M (3 Submódulos)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <CheckCircle2 className="w-3 h-3 text-amber-600" />
                          Seleccionado
                        </span>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(proj)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors ml-1"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mt-2 line-clamp-1">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    Cliente: <span className="font-semibold text-slate-700">{proj.client}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Presupuesto Base
                      </span>
                      <span className="font-mono font-black text-slate-800 text-sm">
                        ${proj.initialBudget.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        S.A. Facturadora
                      </span>
                      <span className="text-slate-700 font-medium text-[11px] truncate block">
                        {proj.billingCompany}
                      </span>
                    </div>
                  </div>

                  {/* Submodule Checklist Pills */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                      Submódulos Asignados:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {isT1 ? (
                        <>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">01. Control Gral.</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">02. Presupuesto</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">03. Mano Obra (5%)</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">04. Sub-C</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">05. Materiales</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">06. Mat. Cliente</span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">01. Control Gral TIR (A-B-C)</span>
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium">02. Bitácora Observaciones</span>
                          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md font-medium">03. Materiales Cliente</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedReportProject(proj)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="Ver y descargar el informe único con todos los submódulos unidos"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reporte Unificado</span>
                  </button>

                  <button
                    onClick={() => handleOpenProject(proj)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Abrir Submódulos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: + Nuevo Proyecto */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dar de Alta Nuevo Proyecto</h3>
                  <span className="text-xs text-slate-500">Configuración y asignación de submódulos</span>
                </div>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código de Obra *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="P0-02"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 uppercase"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Proyecto *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej. Torre Corporativa del Parque"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cliente / Desarrollador *</label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="Ej. Inmobiliaria Diamante S.A. de C.V."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">S.A. Facturadora del Grupo *</label>
                <select
                  value={form.billingCompany}
                  onChange={(e) => setForm({ ...form, billingCompany: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                >
                  <option value="Proyectos y Edificaciones Santa Fe S.A. de C.V.">
                    Proyectos y Edificaciones Santa Fe S.A. de C.V.
                  </option>
                  <option value="Constructora e Inmobiliaria Metropolitana S.A.">
                    Constructora e Inmobiliaria Metropolitana S.A.
                  </option>
                  <option value="Mobiliario, Diseño y Cimbra del Bajío S.A.">
                    Mobiliario, Diseño y Cimbra del Bajío S.A.
                  </option>
                </select>
              </div>

              {/* Selection of Control Template */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800">
                  Tipo de Control y Plantilla de Submódulos:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, controlType: 'tipo1' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.controlType === 'tipo1'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-black">Control_Tipo1</div>
                    <div className="text-[10px] mt-0.5 opacity-90">
                      6 Submódulos: Control Gral, Presupuesto, Mano de Obra (5%), Sub-C, Materiales y Mat. Cliente.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, controlType: 'tipo3m' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.controlType === 'tipo3m'
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-black">Control_Tipo3M</div>
                    <div className="text-[10px] mt-0.5 opacity-90">
                      3 Submódulos: Control Gral TIR (A-B-C), Bitácora Observaciones y Materiales Cliente.
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Presupuesto Inicial ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.initialBudget}
                    onChange={(e) => setForm({ ...form, initialBudget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs"
                >
                  Guardar y Abrir Submódulos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-11 h-11 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              ¿Eliminar proyecto {deleteConfirm.code}?
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Está a punto de eliminar <span className="font-bold text-slate-800">{deleteConfirm.name}</span>.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteControlledProject(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Report Modal Preview */}
      {selectedReportProject && (
        <UnifiedReportModal
          project={selectedReportProject}
          tipo1Data={controlTipo1Data}
          tipo3mData={controlTipo4DData}
          onClose={() => setSelectedReportProject(null)}
        />
      )}
    </div>
  );
};
export default ProjectsCatalogView;
