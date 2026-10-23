import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Sliders,
  Save,
  Clock,
  HardHat,
} from 'lucide-react';

export const ProgramaObraView: React.FC = () => {
  const { projects, updatePhysicalProgress, activeCompanyId } = useERP();
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);

  const filteredProjects = projects.filter(
    (p) => activeCompanyId === 'ALL' || p.companyId === activeCompanyId
  );

  const handleStartEdit = (projectId: string, current: number) => {
    setEditingProjectId(projectId);
    setTempProgress(current);
  };

  const handleSaveProgress = (projectId: string) => {
    updatePhysicalProgress(projectId, tempProgress);
    setEditingProjectId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Módulo F</span>
              <span>·</span>
              <span>Control Operativo y Calendario de Obra</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Programa de Obra: Avance Físico vs Gasto Ejercido
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Supervisión en tiempo real de la relación entre el avance constructivo ejecutado en campo y el presupuesto financiero ejercido.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>Vista de Campo / Residentes</span>
            </span>
          </div>
        </div>
      </div>

      {/* Lista Comparativa de Obras */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const isOvercost = project.financialProgress > project.physicalProgress + 4;
          const isEfficient = project.physicalProgress >= project.financialProgress;
          const variance = Number((project.financialProgress - project.physicalProgress).toFixed(1));
          const isEditing = editingProjectId === project.id;

          return (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      {project.code}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{project.name}</h2>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600">{project.client}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>Residente: {project.residente}</span>
                    <span>·</span>
                    <span>
                      Vigencia: {project.startDate} al {project.endDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOvercost ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Alerta Sobrecosto (+{variance}%)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>En Paridad / Eficiente</span>
                    </span>
                  )}

                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(project.id, project.physicalProgress)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Actualizar Avance</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveProgress(project.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Slider de Edición de Avance si está activo */}
              {isEditing && (
                <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Ajustar Avance Físico:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={tempProgress}
                    onChange={(e) => setTempProgress(Number(e.target.value))}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-base text-slate-900 w-12 text-right">
                    {tempProgress}%
                  </span>
                </div>
              )}

              {/* Barras de Comparación Gráfica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Avance Físico Real */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-slate-700" />
                      <span>Avance Físico de Obra</span>
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900">
                      {project.physicalProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-slate-900 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${project.physicalProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Trabajos ejecutados y avalados en bitácora
                  </span>
                </div>

                {/* Gasto Financiero Ejercido */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>Gasto Financiero Ejercido</span>
                    </span>
                    <span
                      className={`font-mono font-black text-sm ${
                        isOvercost ? 'text-amber-600' : 'text-blue-700'
                      }`}
                    >
                      {project.financialProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isOvercost ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, project.financialProgress)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ${project.spent.toLocaleString('es-MX')} ejercidos de $
                    {project.initialBudget.toLocaleString('es-MX')} contratados
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
