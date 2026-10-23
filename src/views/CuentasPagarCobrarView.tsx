import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Scale,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  User,
  DollarSign,
} from 'lucide-react';

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

  const filteredPayables = payables.filter(
    (p) => activeCompanyId === 'ALL' || p.companyId === activeCompanyId
  );
  const filteredReceivables = receivables.filter(
    (r) => activeCompanyId === 'ALL' || r.companyId === activeCompanyId
  );

  const totalCXP = filteredPayables.reduce((acc, p) => acc + p.balance, 0);
  const totalCXC = filteredReceivables.reduce((acc, r) => acc + r.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Módulo D</span>
              <span>·</span>
              <span>Pasivos y Activos Corrientes</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Cuentas por Pagar y por Cobrar
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Control de obligaciones con proveedores de materiales y cobranza de estimaciones por avance de obra.
            </p>
          </div>

          {/* Segmented Control Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('cxp')}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'cxp'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CXP Proveedores (${totalCXP.toLocaleString('es-MX')})
            </button>
            <button
              onClick={() => setActiveTab('cxc')}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'cxc'
                  ? 'bg-white text-slate-900 shadow-xs'
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
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total por Cobrar (Clientes)
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-emerald-700 mt-1">
              ${totalCXC.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Estimaciones emitidas</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total por Pagar (Proveedores)
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-red-700 mt-1">
              ${totalCXP.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Pasivos con vencimiento</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Saldo Neto Proyectado
            </span>
            <div
              className={`text-base md:text-lg font-bold font-mono mt-1 ${
                totalCXC >= totalCXP ? 'text-blue-700' : 'text-amber-700'
              }`}
            >
              ${(totalCXC - totalCXP).toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Diferencial favorable</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Garantía de Anticipos
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-slate-800 mt-1">
              5% Retención
            </div>
            <span className="text-[10px] text-slate-400">Fondo de garantía obra</span>
          </div>
        </div>
      </div>

      {/* Content depending on Tab */}
      {activeTab === 'cxp' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
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
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Factura / Folio</th>
                  <th className="py-3 px-4">Obra Asignada</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4 text-right">Monto Original</th>
                  <th className="py-3 px-4 text-right">Saldo Pendiente</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayables.map((item) => {
                  const proj = projects.find((p) => p.id === item.projectId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.provider}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{item.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-700">{proj?.name || 'Obra General'}</td>
                      <td className="py-3 px-4 text-slate-600">{item.dueDate}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ${item.amount.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-700">
                        ${item.balance.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'pagada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'vencida'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
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
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Cliente Contratante</th>
                  <th className="py-3 px-4">Estimación</th>
                  <th className="py-3 px-4">Obra</th>
                  <th className="py-3 px-4">Fecha Emisión / Vence</th>
                  <th className="py-3 px-4 text-right">Saldo por Cobrar</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceivables.map((item) => {
                  const proj = projects.find((p) => p.id === item.projectId);
                  const matchingEst = estimations.find(
                    (e) => e.projectId === item.projectId && e.estimationNumber === item.estimationNumber
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.client}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                        {item.estimationNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{proj?.name}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {item.issueDate} / {item.dueDate}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ${item.balance.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'cobrado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'vencido'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.balance > 0 && matchingEst ? (
                          <button
                            onClick={() =>
                              collectEstimationPayment(matchingEst.id, accounts[0].id)
                            }
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Registrar Cobro Banco
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
    </div>
  );
};
