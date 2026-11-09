import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Tipo4DBitacoraEntry } from '../../types/controlTipo4D';
import { exportToCSV, triggerPrintPDF } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Printer,
  Plus,
  Edit2,
  Trash2,
  Search,
  BookOpen,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react';

export const SubBitacoraObservaciones: React.FC = () => {
  const { controlTipo4DData, updateControlTipo4DData } = useERP();
  const bitacora = controlTipo4DData.bitacora;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterPrioridad, setFilterPrioridad] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Tipo4DBitacoraEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Tipo4DBitacoraEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    comentariosObservaciones: '',
    autor: 'Arq. Residente / Proyectos',
    prioridad: 'media' as 'baja' | 'media' | 'alta',
    estado: 'pendiente' as 'pendiente' | 'en_proceso' | 'atendida',
  });

  const handleOpenNew = () => {
    setEditingEntry(null);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      comentariosObservaciones: '',
      autor: 'Arq. Residente / Proyectos',
      prioridad: 'media',
      estado: 'pendiente',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (entry: Tipo4DBitacoraEntry) => {
    setEditingEntry(entry);
    setFormData({
      fecha: entry.fecha,
      comentariosObservaciones: entry.comentariosObservaciones,
      autor: entry.autor || 'Arq. Residente / Proyectos',
      prioridad: entry.prioridad || 'media',
      estado: entry.estado || 'pendiente',
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      const updated = bitacora.map((b) =>
        b.id === editingEntry.id
          ? {
              ...b,
              fecha: formData.fecha,
              comentariosObservaciones: formData.comentariosObservaciones,
              autor: formData.autor,
              prioridad: formData.prioridad,
              estado: formData.estado,
            }
          : b
      );
      updateControlTipo4DData({ bitacora: updated });
    } else {
      const newEntry: Tipo4DBitacoraEntry = {
        id: `bit-${Date.now()}`,
        fecha: formData.fecha,
        comentariosObservaciones: formData.comentariosObservaciones,
        autor: formData.autor,
        prioridad: formData.prioridad,
        estado: formData.estado,
      };
      updateControlTipo4DData({ bitacora: [newEntry, ...bitacora] });
    }
    setShowModal(false);
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    const updated = bitacora.filter((b) => b.id !== deleteConfirm.id);
    updateControlTipo4DData({ bitacora: updated });
    setDeleteConfirm(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha', 'Autor / Responsable', 'Comentarios y Observaciones', 'Prioridad', 'Estado'];
    const rows = bitacora.map((b, i) => [
      `BIT-${String(i + 1).padStart(3, '0')}`,
      b.fecha,
      b.autor || 'N/A',
      b.comentariosObservaciones,
      b.prioridad || 'media',
      b.estado || 'pendiente',
    ]);
    exportToCSV(`Bitacora_Observaciones_Tipo4D_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  // Filtered List
  const filteredBitacora = bitacora.filter((b) => {
    const matchSearch =
      b.comentariosObservaciones.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.autor && b.autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.fecha.includes(searchTerm);
    const matchEstado = filterEstado === 'todos' || b.estado === filterEstado;
    const matchPrioridad = filterPrioridad === 'todos' || b.prioridad === filterPrioridad;
    return matchSearch && matchEstado && matchPrioridad;
  });

  const countTotal = bitacora.length;
  const countAtendidas = bitacora.filter((b) => b.estado === 'atendida').length;
  const countEnProceso = bitacora.filter((b) => b.estado === 'en_proceso').length;
  const countPendientes = bitacora.filter((b) => b.estado === 'pendiente').length;

  return (
    <div className="space-y-6 printable-dossier">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 rounded-lg">
              Submódulo 02
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              Control_Tipo4D_P0-00 / Bitácora Observaciones
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Bitácora de Obra y Observaciones de Diseño
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico oficial de acuerdos, aclaraciones técnicas, incidencias y notas de campo
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exportar Excel
          </button>
          <button
            onClick={() => triggerPrintPDF('Bitácora de Observaciones - Tipo 4D')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir / PDF
          </button>
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nueva Observación
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Anotaciones
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {countTotal}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Historial acumulado</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Atendidas / Resueltas
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            {countAtendidas}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Conformes al proyecto</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            En Proceso
          </span>
          <div className="text-2xl font-black font-mono text-amber-600 mt-1">
            {countEnProceso}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">En revisión o trámite</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pendientes
          </span>
          <div className="text-2xl font-black font-mono text-red-600 mt-1">
            {countPendientes}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Requieren atención</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en bitácora por palabras clave, autor o fecha..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        <div className="flex items-center gap-2">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_proceso">En Proceso</option>
            <option value="atendida">Atendidas</option>
          </select>

          <select
            value={filterPrioridad}
            onChange={(e) => setFilterPrioridad(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="todos">Todas las prioridades</option>
            <option value="alta">Prioridad Alta</option>
            <option value="media">Prioridad Media</option>
            <option value="baja">Prioridad Baja</option>
          </select>
        </div>
      </div>

      {/* Bitacora Entries List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
              REGISTROS DE BITÁCORA Y OBSERVACIONES
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredBitacora.length} de {bitacora.length} entradas
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredBitacora.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic text-xs">
              No se encontraron anotaciones en la bitácora con los filtros seleccionados.
            </div>
          ) : (
            filteredBitacora.map((entry, index) => {
              const badgeColors = {
                alta: 'bg-red-100 text-red-700 border-red-200',
                media: 'bg-amber-100 text-amber-700 border-amber-200',
                baja: 'bg-slate-100 text-slate-700 border-slate-200',
              };

              const estadoColors = {
                atendida: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
                pendiente: 'bg-rose-100 text-rose-800 border-rose-200',
              };

              return (
                <div key={entry.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-900 text-white">
                        # {String(bitacora.length - index).padStart(2, '0')}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {entry.fecha}
                      </span>
                      {entry.autor && (
                        <span className="flex items-center gap-1 text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          <User className="w-3 h-3 text-slate-400" />
                          {entry.autor}
                        </span>
                      )}
                      {entry.prioridad && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            badgeColors[entry.prioridad]
                          }`}
                        >
                          {entry.prioridad}
                        </span>
                      )}
                      {entry.estado && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            estadoColors[entry.estado]
                          }`}
                        >
                          {entry.estado === 'atendida'
                            ? '✓ Atendida'
                            : entry.estado === 'en_proceso'
                            ? '⏳ En Proceso'
                            : '⚠ Pendiente'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-auto no-print">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-1 text-slate-400 hover:text-purple-600 rounded transition-colors"
                        title="Editar entrada"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(entry)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Eliminar entrada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-xs md:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap pl-2 border-l-2 border-purple-300">
                    {entry.comentariosObservaciones}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: New / Edit Bitacora */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingEntry ? 'Editar Anotación en Bitácora' : 'Nueva Anotación en Bitácora'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Autor / Responsable</label>
                  <input
                    type="text"
                    value={formData.autor}
                    onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                    placeholder="Ej. Arq. Residente, Ing. Estructural..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Comentarios y Observaciones *
                </label>
                <textarea
                  value={formData.comentariosObservaciones}
                  onChange={(e) => setFormData({ ...formData, comentariosObservaciones: e.target.value })}
                  placeholder="Describa el acuerdo, especificación técnica, ajuste en diseño o incidencia..."
                  rows={5}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) =>
                      setFormData({ ...formData, prioridad: e.target.value as 'baja' | 'media' | 'alta' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estado: e.target.value as 'pendiente' | 'en_proceso' | 'atendida',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="atendida">Atendida / Resuelta</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Guardar Anotación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-11 h-11 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">¿Eliminar anotación de bitácora?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Esta acción no se puede deshacer. Se eliminará permanentemente la anotación del {deleteConfirm.fecha}.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
