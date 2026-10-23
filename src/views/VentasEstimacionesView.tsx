import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  TrendingUp,
  Plus,
  FileCheck2,
  Building2,
  DollarSign,
  CheckCircle,
  Landmark,
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';

export const VentasEstimacionesView: React.FC = () => {
  const {
    estimations,
    projects,
    companies,
    accounts,
    createEstimation,
    collectEstimationPayment,
    activeCompanyId,
  } = useERP();

  const [showNewEstModal, setShowNewEstModal] = useState(false);
  const [formData, setFormData] = useState({
    projectId: projects[0]?.id || '',
    period: 'Quincena 2 Octubre 2026',
    advancePercent: 5.5,
    grossAmount: 950000,
  });

  const filteredEstimations = estimations.filter(
    (e) => activeCompanyId === 'ALL' || e.companyId === activeCompanyId
  );

  const totalGrossEstimations = filteredEstimations.reduce((acc, e) => acc + e.grossAmount, 0);
  const totalCollectedEstimations = filteredEstimations
    .filter((e) => e.status === 'cobrada')
    .reduce((acc, e) => acc + e.netAmount, 0);

  const handleCreateEstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || formData.grossAmount <= 0) return;

    createEstimation({
      projectId: formData.projectId,
      period: formData.period,
      advancePercent: Number(formData.advancePercent),
      grossAmount: Number(formData.grossAmount),
    });

    setShowNewEstModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Módulo E</span>
              <span>·</span>
              <span>Ventas, Estimaciones y Facturación por S.A.</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Estimaciones de Avance a Clientes
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Genera estimaciones fundamentadas en el avance físico de obra con fondo de garantía y facturación emitida por la S.A. asignada.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewEstModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generar Nueva Estimación</span>
            </button>
          </div>
        </div>

        {/* Flujo de Oficina Explicativo */}
        <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Ciclo Operativo de Ingresos y Cobranza</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block">1. Avance de Obra</span>
              <span className="text-slate-500">Residente registra % físico en campo.</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block">2. Estimación Cliente</span>
              <span className="text-slate-500">Admin genera cálculo y factura CFDI.</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block">3. Cuentas por Cobrar</span>
              <span className="text-slate-500">Se actualiza saldo por cobrar automáticamente.</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block">4. Cobro Bancario</span>
              <span className="text-slate-500">Ingreso a banco concilia y calcula Utilidad Real.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Estimaciones */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Historial de Estimaciones Emitidas</h2>
          <span className="text-xs text-slate-500 font-mono">
            Total bruto: ${totalGrossEstimations.toLocaleString('es-MX')} MXN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Estimación / Factura</th>
                <th className="py-3 px-4">Obra / Centro de Costos</th>
                <th className="py-3 px-4">S.A. Emisora</th>
                <th className="py-3 px-4">Período / Avance</th>
                <th className="py-3 px-4 text-right">Importe Bruto</th>
                <th className="py-3 px-4 text-right">Retención 5%</th>
                <th className="py-3 px-4 text-right">Neto a Cobrar</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEstimations.map((est) => {
                const company = companies.find((c) => c.id === est.companyId);
                return (
                  <tr key={est.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">
                        {est.estimationNumber}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {est.invoiceNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{est.projectName}</td>
                    <td className="py-3 px-4 text-slate-600">{company?.shortName}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{est.period}</div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        +{est.physicalAdvancePercent}% físico (Acum: {est.cumulativeAdvancePercent}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      ${est.grossAmount.toLocaleString('es-MX')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      -${est.retentionGuarantee.toLocaleString('es-MX')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${est.netAmount.toLocaleString('es-MX')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          est.status === 'cobrada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {est.status === 'cobrada' ? '✓ Cobrada' : 'Facturada'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {est.status !== 'cobrada' ? (
                        <button
                          onClick={() => collectEstimationPayment(est.id, accounts[0].id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          Cobrar en Banco
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Depositado</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Generar Nueva Estimación */}
      {showNewEstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Emitir Estimación de Avance
                </h3>
              </div>
              <button
                onClick={() => setShowNewEstModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEstSubmit} className="mt-4 space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Obra a Estimar</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Cliente: {p.client})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Período de Ejecución
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Avance Físico del Período (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={formData.advancePercent}
                    onChange={(e) =>
                      setFormData({ ...formData, advancePercent: Number(e.target.value) })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Monto Bruto a Facturar ($ MXN)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="5000"
                  value={formData.grossAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, grossAmount: Number(e.target.value) })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Importe Bruto:</span>
                  <span className="font-mono font-semibold">
                    ${formData.grossAmount.toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Fondo de Garantía (5%):</span>
                  <span className="font-mono">
                    -${(formData.grossAmount * 0.05).toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Neto Facturado a Cobrar:</span>
                  <span className="font-mono text-emerald-700">
                    ${(formData.grossAmount * 0.95).toLocaleString('es-MX')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewEstModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Generar y Registrar en CXC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
