import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { PresupuestoAditivaItem } from '../../types/controlTipo1';
import { exportToCSV, triggerPrintPDF } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Printer,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';

export const SubPresupuestoAditivas: React.FC = () => {
  const { controlTipo1Data, updateControlTipo1Data } = useERP();
  const data = controlTipo1Data.presupuestoAditivas;

  const [activeTab, setActiveTab] = useState<'aditivas' | 'deductivas'>('aditivas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PresupuestoAditivaItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    tipo: 'aditiva' as 'aditiva' | 'deductiva',
    fecha: new Date().toISOString().split('T')[0],
    numero: 'AD-03',
    concepto: '',
    comprobante: '',
    cantSinIva: 50000,
    iva: 8000,
    total: 58000,
  });

  const totalAditivasSinIva = data.aditivas.reduce((acc, a) => acc + a.cantSinIva, 0);
  const totalAditivasIva = data.aditivas.reduce((acc, a) => acc + a.iva, 0);
  const totalAditivas = data.aditivas.reduce((acc, a) => acc + a.total, 0);

  const totalDeductivasSinIva = data.deductivas.reduce((acc, d) => acc + d.cantSinIva, 0);
  const totalDeductivasIva = data.deductivas.reduce((acc, d) => acc + d.iva, 0);
  const totalDeductivas = data.deductivas.reduce((acc, d) => acc + d.total, 0);

  const presupuestoFinalTotal = data.presupuestoInicialTotal + totalAditivas - totalDeductivas;

  const handleOpenNew = (tipo: 'aditiva' | 'deductiva') => {
    setEditingItem(null);
    const count = tipo === 'aditiva' ? data.aditivas.length + 1 : data.deductivas.length + 1;
    setFormData({
      tipo,
      fecha: new Date().toISOString().split('T')[0],
      numero: tipo === 'aditiva' ? `AD-${count < 10 ? '0' + count : count}` : `DE-${count < 10 ? '0' + count : count}`,
      concepto: '',
      comprobante: '',
      cantSinIva: 45000,
      iva: 7200,
      total: 52200,
    });
    setShowItemModal(true);
  };

  const handleOpenEdit = (item: PresupuestoAditivaItem) => {
    setEditingItem(item);
    setFormData({
      tipo: item.tipo,
      fecha: item.fecha,
      numero: item.numero,
      concepto: item.concepto,
      comprobante: item.comprobante,
      cantSinIva: item.cantSinIva,
      iva: item.iva,
      total: item.total,
    });
    setShowItemModal(true);
  };

  const handleDelete = (id: string, tipo: 'aditiva' | 'deductiva') => {
    if (!window.confirm('¿Deseas eliminar este registro de variación presupuestal?')) return;
    updateControlTipo1Data((prev) => ({
      ...prev,
      presupuestoAditivas: {
        ...prev.presupuestoAditivas,
        aditivas: tipo === 'aditiva' ? prev.presupuestoAditivas.aditivas.filter((i) => i.id !== id) : prev.presupuestoAditivas.aditivas,
        deductivas: tipo === 'deductiva' ? prev.presupuestoAditivas.deductivas.filter((i) => i.id !== id) : prev.presupuestoAditivas.deductivas,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cantSinIva = Number(formData.cantSinIva);
    const iva = Number(formData.iva);
    const total = Number(formData.total || cantSinIva + iva);

    if (editingItem) {
      updateControlTipo1Data((prev) => ({
        ...prev,
        presupuestoAditivas: {
          ...prev.presupuestoAditivas,
          aditivas:
            editingItem.tipo === 'aditiva'
              ? prev.presupuestoAditivas.aditivas.map((item) =>
                  item.id === editingItem.id
                    ? { ...item, fecha: formData.fecha, numero: formData.numero, concepto: formData.concepto, comprobante: formData.comprobante, cantSinIva, iva, total }
                    : item
                )
              : prev.presupuestoAditivas.aditivas,
          deductivas:
            editingItem.tipo === 'deductiva'
              ? prev.presupuestoAditivas.deductivas.map((item) =>
                  item.id === editingItem.id
                    ? { ...item, fecha: formData.fecha, numero: formData.numero, concepto: formData.concepto, comprobante: formData.comprobante, cantSinIva, iva, total }
                    : item
                )
              : prev.presupuestoAditivas.deductivas,
        },
      }));
    } else {
      const newItem: PresupuestoAditivaItem = {
        id: `pad-${Date.now()}`,
        tipo: formData.tipo,
        fecha: formData.fecha,
        numero: formData.numero,
        concepto: formData.concepto,
        comprobante: formData.comprobante,
        cantSinIva,
        iva,
        total,
      };
      updateControlTipo1Data((prev) => ({
        ...prev,
        presupuestoAditivas: {
          ...prev.presupuestoAditivas,
          aditivas: formData.tipo === 'aditiva' ? [newItem, ...prev.presupuestoAditivas.aditivas] : prev.presupuestoAditivas.aditivas,
          deductivas: formData.tipo === 'deductiva' ? [newItem, ...prev.presupuestoAditivas.deductivas] : prev.presupuestoAditivas.deductivas,
        },
      }));
    }
    setShowItemModal(false);
  };

  const handleExportCSV = () => {
    const isAditivas = activeTab === 'aditivas';
    const headers = ['Fecha', isAditivas ? 'No. AD' : 'No. DE', 'Concepto', isAditivas ? 'Factura' : 'Nota de Crédito', 'Cant. s/IVA', 'IVA', 'Total'];
    const list = isAditivas ? data.aditivas : data.deductivas;
    const rows = list.map((i) => [i.fecha, i.numero, i.concepto, i.comprobante, i.cantSinIva, i.iva, i.total]);
    exportToCSV(`PRESUPUESTO_${activeTab.toUpperCase()}`, headers, rows);
  };

  const currentList = activeTab === 'aditivas' ? data.aditivas : data.deductivas;
  const filteredList = currentList.filter(
    (item) =>
      item.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comprobante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
              Submódulo 2 · Control de Presupuesto y Aditivas
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Presupuesto Inicial, Aditivas y Deductivas
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              Control contractual de ampliaciones y deducciones de obra según modelo de hoja de cálculo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerPrintPDF('Presupuesto_y_Aditivas_Tipo1')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => handleOpenNew(activeTab === 'aditivas' ? 'aditiva' : 'deductiva')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'aditivas' ? '+ Registrar Aditiva' : '+ Registrar Deductiva'}</span>
            </button>
          </div>
        </div>

        {/* Global Formula Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Presupuesto Inicial
            </span>
            <div className="text-base md:text-lg font-black font-mono text-slate-900 mt-1">
              ${data.presupuestoInicialTotal.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Contrato base de obra</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              (+) Acumulado de Aditivas
            </span>
            <div className="text-base md:text-lg font-black font-mono text-emerald-700 mt-1">
              +${totalAditivas.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-emerald-600">{data.aditivas.length} conceptos autorizados</span>
          </div>

          <div className="p-3 bg-red-50 rounded-xl border border-red-100">
            <span className="text-[11px] font-semibold text-red-800 uppercase tracking-wider block">
              (-) Acumulado de Deductivas
            </span>
            <div className="text-base md:text-lg font-black font-mono text-red-700 mt-1">
              -${totalDeductivas.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-red-600">{data.deductivas.length} notas de crédito</span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
              (=) Presupuesto Final Actualizado
            </span>
            <div className="text-base md:text-lg font-black font-mono text-blue-700 mt-1">
              ${presupuestoFinalTotal.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-blue-600">Importe neto vigente</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector: Aditivas vs Deductivas */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('aditivas')}
            className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'aditivas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Aditivas de Obra ({data.aditivas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('deductivas')}
            className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'deductivas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span>Deductivas de Obra ({data.deductivas.length})</span>
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por concepto o folio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">{activeTab === 'aditivas' ? 'No. AD' : 'No. DE'}</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">{activeTab === 'aditivas' ? 'Factura' : 'Nota de Crédito'}</th>
                <th className="py-3 px-4 text-right">Cant. s/IVA</th>
                <th className="py-3 px-4 text-right">IVA (16%)</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No hay {activeTab === 'aditivas' ? 'aditivas' : 'deductivas'} registradas. Presione "+ Registrar {activeTab === 'aditivas' ? 'Aditiva' : 'Deductiva'}" para capturar la primera.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">{item.fecha}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{item.numero}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 max-w-md">{item.concepto}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.comprobante}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ${item.cantSinIva.toLocaleString('es-MX')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      ${item.iva.toLocaleString('es-MX')}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        activeTab === 'aditivas' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      ${item.total.toLocaleString('es-MX')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.tipo)}
                          className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-slate-900 uppercase tracking-wider">
                  S U M A S
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  ${(activeTab === 'aditivas' ? totalAditivasSinIva : totalDeductivasSinIva).toLocaleString('es-MX')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-700">
                  ${(activeTab === 'aditivas' ? totalAditivasIva : totalDeductivasIva).toLocaleString('es-MX')}
                </td>
                <td
                  className={`py-3 px-4 text-right font-mono text-sm ${
                    activeTab === 'aditivas' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  ${(activeTab === 'aditivas' ? totalAditivas : totalDeductivas).toLocaleString('es-MX')}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Editar Registro' : formData.tipo === 'aditiva' ? 'Registrar Aditiva' : 'Registrar Deductiva'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3.5 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {formData.tipo === 'aditiva' ? 'No. AD' : 'No. DE'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Concepto de Obra</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Descripción detallada de la ampliación o deductiva..."
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {formData.tipo === 'aditiva' ? 'Factura de Respaldo' : 'Nota de Crédito'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. FAC-9901 / NC-104"
                  value={formData.comprobante}
                  onChange={(e) => setFormData({ ...formData, comprobante: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cant. s/IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cantSinIva}
                    onChange={(e) => {
                      const sinIva = Number(e.target.value);
                      const iva = Number((sinIva * 0.16).toFixed(2));
                      setFormData({
                        ...formData,
                        cantSinIva: sinIva,
                        iva,
                        total: Number((sinIva + iva).toFixed(2)),
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">IVA (16%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.iva}
                    onChange={(e) => {
                      const iva = Number(e.target.value);
                      setFormData({
                        ...formData,
                        iva,
                        total: Number((formData.cantSinIva + iva).toFixed(2)),
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
