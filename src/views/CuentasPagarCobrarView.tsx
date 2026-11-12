import React, { useState, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import { Estimation } from '../types/erp';
import { X, ArrowDownLeft } from 'lucide-react';

export const CuentasPagarCobrarView: React.FC = () => {
  const {
    payables,
    receivables,
    projects,
    companies,
    activeCompanyId,
    accounts,
    collectEstimationPayment,
    estimations,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'cxp' | 'cxc'>('cxp');
  const [collectingEst, setCollectingEst] = useState<Estimation | null>(null);
  const [collectCompanyId, setCollectCompanyId] = useState<string>('');
  const [collectAccountId, setCollectAccountId] = useState<string>('');
  const [collectSubtotal, setCollectSubtotal] = useState<number>(0);

  const filteredPayables = payables.filter(
    (p) => activeCompanyId === 'ALL' || p.companyId === activeCompanyId
  );
  const filteredReceivables = receivables.filter(
    (r) => activeCompanyId === 'ALL' || r.companyId === activeCompanyId
  );

  const totalCXP = filteredPayables.reduce((acc, p) => acc + p.balance, 0);
  const totalCXC = filteredReceivables.reduce((acc, r) => acc + r.balance, 0);

  const selectableAccounts = useMemo(() => {
    const filtered = accounts.filter(
      (a) => a.companyId === collectCompanyId && a.accountType === 'banco'
    );
    return filtered.length > 0 ? filtered : accounts;
  }, [accounts, collectCompanyId]);

  const openCollectModal = (est: Estimation) => {
    const acc =
      accounts.find((a) => a.companyId === est.companyId && a.accountType === 'banco') ||
      accounts[0];
    setCollectingEst(est);
    setCollectCompanyId(est.companyId);
    setCollectAccountId(acc?.id || '');
    setCollectSubtotal(Number((est.netAmount / 1.16).toFixed(2)));
  };

  const handleConfirmCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingEst || !collectAccountId || collectSubtotal <= 0) return;
    collectEstimationPayment(
      collectingEst.id,
      collectAccountId,
      collectCompanyId,
      collectSubtotal
    );
    setCollectingEst(null);
  };

  const calcIva = Number((collectSubtotal * 0.16).toFixed(2));
  const calcTotal = Number((collectSubtotal + calcIva).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Pasivos y Activos Corrientes</span>
              <span aria-hidden="true">·</span>
              <span>Cartera CXP / CXC</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1">
              Cuentas por Pagar y por Cobrar
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Control de obligaciones con proveedores de materiales y cobranza de estimaciones hacia cuentas bancarias.
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('cxp')}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'cxp'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CXP Proveedores (${totalCXP.toLocaleString('es-MX')})
            </button>
            <button
              onClick={() => setActiveTab('cxc')}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'cxc'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CXC Clientes (${totalCXC.toLocaleString('es-MX')})
            </button>
          </div>
        </div>

        {/* Global Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Total por Cobrar (Clientes)
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-emerald-700 mt-1">
              ${totalCXC.toLocaleString('es-MX')}
            </div>
            <span className="text-[11px] text-slate-500">Estimaciones emitidas</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Total por Pagar (Proveedores)
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-red-700 mt-1">
              ${totalCXP.toLocaleString('es-MX')}
            </div>
            <span className="text-[11px] text-slate-500">Pasivos con vencimiento</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Saldo Neto Proyectado
            </span>
            <div
              className={`text-base md:text-lg font-bold font-mono tabular-nums mt-1 ${
                totalCXC >= totalCXP ? 'text-blue-700' : 'text-amber-700'
              }`}
            >
              ${(totalCXC - totalCXP).toLocaleString('es-MX')}
            </div>
            <span className="text-[11px] text-slate-500">Diferencial CXC - CXP</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Garantía de Anticipos
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-slate-800 mt-1">
              5% Retención
            </div>
            <span className="text-[11px] text-slate-500">Fondo de garantía obra</span>
          </div>
        </div>
      </div>

      {/* Content depending on Tab */}
      {activeTab === 'cxp' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Cuentas por Pagar a Proveedores de Materiales y Servicios
            </h2>
            <span className="text-xs text-slate-500">
              {filteredPayables.length} compromisos registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Factura / Folio</th>
                  <th className="py-3 px-4">Obra / S.A.</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4 text-right">Monto Original</th>
                  <th className="py-3 px-4 text-right">Saldo Pendiente</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayables.map((item) => {
                  const proj = projects.find((p) => p.id === item.projectId);
                  const co = companies.find((c) => c.id === item.companyId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.provider}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{proj?.name || 'Obra General'}</div>
                        <div className="text-[11px] text-slate-400">{co?.shortName || item.companyId}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 tabular-nums">{item.dueDate}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        ${item.amount.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-red-700">
                        ${item.balance.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[11px] font-bold capitalize ${
                            item.status === 'pagada'
                              ? 'text-emerald-700'
                              : item.status === 'vencida'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Cuentas por Cobrar a Clientes (Estimaciones de Avance)
            </h2>
            <span className="text-xs text-slate-500">
              {filteredReceivables.length} estimaciones por cobrar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Cliente Contratante</th>
                  <th className="py-3 px-4">Estimación</th>
                  <th className="py-3 px-4">Obra / S.A.</th>
                  <th className="py-3 px-4">Emisión / Vence</th>
                  <th className="py-3 px-4 text-right">Saldo por Cobrar</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceivables.map((item) => {
                  const proj = projects.find((p) => p.id === item.projectId);
                  const co = companies.find((c) => c.id === item.companyId);
                  const matchingEst = estimations.find(
                    (e) => e.projectId === item.projectId && e.estimationNumber === item.estimationNumber
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.client}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                        {item.estimationNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{proj?.name}</div>
                        <div className="text-[11px] text-slate-400">{co?.shortName || item.companyId}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs tabular-nums">
                        {item.issueDate} / {item.dueDate}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                        ${item.balance.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[11px] font-bold capitalize ${
                            item.status === 'cobrado'
                              ? 'text-emerald-700'
                              : item.status === 'vencido'
                              ? 'text-red-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.balance > 0 && matchingEst ? (
                          <button
                            onClick={() => openCollectModal(matchingEst)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Cobrar en Banco
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Completado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal confirmar S.A. Facturadora y Cuenta de Depósito al cobrar CXC */}
      {collectingEst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Depositar Cobro {collectingEst.estimationNumber}
                </h3>
              </div>
              <button
                onClick={() => setCollectingEst(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCollect} className="mt-4 space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monto s/IVA ($ MXN)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={collectSubtotal}
                  onChange={(e) => setCollectSubtotal(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums font-bold text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Monto s/IVA:</span>
                  <span className="font-mono tabular-nums">${collectSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA 16% (auto):</span>
                  <span className="font-mono tabular-nums">+${calcIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total c/IVA a Banco:</span>
                  <span className="font-mono tabular-nums text-emerald-700">
                    ${calcTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  S.A. Facturadora
                </label>
                <select
                  value={collectCompanyId}
                  onChange={(e) => {
                    const coId = e.target.value;
                    setCollectCompanyId(coId);
                    const acc = accounts.find((a) => a.companyId === coId && a.accountType === 'banco');
                    if (acc) setCollectAccountId(acc.id);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortName} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cuenta de Depósito (Banco)
                </label>
                <select
                  value={collectAccountId}
                  onChange={(e) => setCollectAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  {selectableAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} (Saldo: ${a.currentBalance.toLocaleString('es-MX')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCollectingEst(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Confirmar Depósito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
