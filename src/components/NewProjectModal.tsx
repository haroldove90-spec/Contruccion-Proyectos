import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { ControlledProject, ControlType } from '../types/projectControl';
import { FolderKanban, X, Sparkles, Plus, Calculator } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ControlType;
  onCreated?: (project: ControlledProject) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'tipo1',
  onCreated,
}) => {
  const {
    controlledProjects,
    addControlledProject,
    setActiveControlledProjectId,
    setActiveModule,
  } = useERP();

  const [form, setForm] = useState({
    code: `P0-0${controlledProjects.length}`,
    name: '',
    client: '',
    billingCompany: 'Proyectos y Edificaciones Santa Fe S.A. de C.V.',
    controlType: defaultType,
    initialBudget: 3500000,
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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

    setActiveControlledProjectId(newProj.id);
    if (newProj.controlType === 'tipo1') {
      setActiveModule('control_tipo1');
    } else {
      setActiveModule('control_tipo4d');
    }

    if (onCreated) {
      onCreated(newProj);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Agregar Nuevo Proyecto</h3>
              <span className="text-xs text-slate-500">
                Seleccione el tipo de control (Tipo 1 o Tipo 3M) y capture sus datos iniciales
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Selection of Control Template */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-black text-slate-800 uppercase tracking-wider text-[11px]">
              Seleccione Módulo de Control:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, controlType: 'tipo1' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.controlType === 'tipo1'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 shrink-0" />
                  <div className="text-xs font-black">Control_Tipo1</div>
                </div>
                <div className="text-[10px] mt-1 opacity-90 leading-tight">
                  6 Submódulos: Control Gral, Presupuesto, Mano de Obra (5%), Sub-C, Materiales y Mat. Cliente.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, controlType: 'tipo3m' })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  form.controlType === 'tipo3m'
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 shrink-0" />
                  <div className="text-xs font-black">Control_Tipo3M</div>
                </div>
                <div className="text-[10px] mt-1 opacity-90 leading-tight">
                  3 Submódulos: Control Gral TIR (A-B-C), Bitácora Observaciones y Materiales Cliente.
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Código de Obra *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="P0-02"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nombre del Proyecto / Obra *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Residencia Lomas del Valle"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cliente / Propietario *</label>
            <input
              type="text"
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="Ej. Inmobiliaria Diamante S.A. de C.V."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">S.A. Facturadora del Grupo *</label>
            <select
              value={form.billingCompany}
              onChange={(e) => setForm({ ...form, billingCompany: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Presupuesto Inicial ($ MXN)</label>
              <input
                type="number"
                step="0.01"
                value={form.initialBudget}
                onChange={(e) => setForm({ ...form, initialBudget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guardar y Abrir Submódulos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default NewProjectModal;
