import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { BankAccount } from '../types/erp';
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  CreditCard,
  Banknote,
  CheckCircle,
  Building2,
  DollarSign,
  Plus,
  ShieldCheck,
  Calendar,
  X,
} from 'lucide-react';

export const TesoreriaView: React.FC = () => {
  const {
    accounts,
    companies,
    activeCompanyId,
    bankMovements,
    transferBetweenAccounts,
    expenses,
  } = useERP();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    sourceId: accounts[0]?.id || '',
    destId: accounts[1]?.id || '',
    amount: 50000,
    concept: 'Fondeo de caja chica de obra',
  });

  const filteredAccounts = accounts.filter(
    (a) => activeCompanyId === 'ALL' || a.companyId === activeCompanyId
  );

  const totalLiquidity = filteredAccounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const bankAccountsLiquidity = filteredAccounts
    .filter((a) => a.accountType === 'banco')
    .reduce((acc, a) => acc + a.currentBalance, 0);
  const cashLiquidity = filteredAccounts
    .filter((a) => a.accountType === 'efectivo')
    .reduce((acc, a) => acc + a.currentBalance, 0);
  const creditLine = filteredAccounts
    .filter((a) => a.accountType === 'tarjeta')
    .reduce((acc, a) => acc + a.currentBalance, 0);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferData.sourceId === transferData.destId || transferData.amount <= 0) return;

    transferBetweenAccounts(
      transferData.sourceId,
      transferData.destId,
      Number(transferData.amount),
      transferData.concept
    );
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Módulo C</span>
              <span>·</span>
              <span>Tesorería, Cuentas Bancarias y Flujo de Caja</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Control de Tesorería y Conciliación
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Gestión unificada de bancos por S.A., cajas de efectivo de obra, tarjetas de crédito corporativas y transferencias entre cuentas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Traspaso entre Cuentas</span>
            </button>
          </div>
        </div>

        {/* Global Liquidity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Liquidez Total Grupo
            </span>
            <div className="text-base md:text-xl font-black font-mono text-slate-900 mt-1">
              ${totalLiquidity.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Saldo consolidado en MXN</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              En Cuentas Bancarias
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-blue-700 mt-1">
              ${bankAccountsLiquidity.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">BBVA, Banorte, Santander</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Efectivo en Cajas Campo
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-emerald-700 mt-1">
              ${cashLiquidity.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Fondos fijos de obra</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Líneas Tarjetas Crédito
            </span>
            <div className="text-base md:text-lg font-bold font-mono text-amber-700 mt-1">
              ${creditLine.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">AMEX Corporativa Obra</span>
          </div>
        </div>
      </div>

      {/* Cuentas y Cajas Disponibles */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Cuentas Bancarias y Cajas de Obra
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => {
            const company = companies.find((c) => c.id === account.companyId);
            return (
              <div
                key={account.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        {account.accountType === 'banco' ? (
                          <Landmark className="w-5 h-5 text-blue-700" />
                        ) : account.accountType === 'efectivo' ? (
                          <Banknote className="w-5 h-5 text-emerald-700" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-amber-700" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{account.bankName}</h3>
                        <span className="font-mono text-xs text-slate-500">
                          {account.accountNumber}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                      {account.currency}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">S.A. Propietaria:</span>
                    <span className="font-semibold text-slate-800">{company?.shortName}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Tipo de Cuenta:</span>
                    <span className="capitalize font-medium text-slate-700">
                      {account.accountType}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Saldo Disponible
                  </span>
                  <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                    ${account.currentBalance.toLocaleString('es-MX')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flujo Diario y Movimientos Recientes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Movimientos y Conciliación en Tiempo Real
            </h2>
            <p className="text-xs text-slate-500">
              Afectación automática sincronizada por gastos de obra y cobranza de estimaciones.
            </p>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Conciliación Diaria OK</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {bankMovements.length > 0 ? (
            bankMovements.slice(0, 10).map((mov) => {
              const acc = accounts.find((a) => a.id === mov.accountId);
              return (
                <div
                  key={mov.id}
                  className="py-3 px-2 flex items-center justify-between text-xs md:text-sm hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        mov.type === 'ingreso'
                          ? 'bg-emerald-100 text-emerald-700'
                          : mov.type === 'egreso'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {mov.type === 'ingreso' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : mov.type === 'egreso' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{mov.concept}</div>
                      <div className="text-[11px] text-slate-500">
                        {acc?.bankName} · Ref: {mov.reference} · {mov.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        mov.type === 'ingreso'
                          ? 'text-emerald-700'
                          : mov.type === 'egreso'
                          ? 'text-red-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {mov.type === 'ingreso' ? '+' : mov.type === 'egreso' ? '-' : ''}$
                      {mov.amount.toLocaleString('es-MX')}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-medium">
                      ✓ Conciliado
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              Los movimientos se generan automáticamente al registrar gastos desde WhatsApp o al registrar cobranza.
            </div>
          )}
        </div>
      </div>

      {/* Modal Traspaso entre Cuentas */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Traspaso entre Cuentas del Grupo
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Cuenta de Origen
                </label>
                <select
                  value={transferData.sourceId}
                  onChange={(e) =>
                    setTransferData({ ...transferData, sourceId: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} (Saldo: ${a.currentBalance.toLocaleString('es-MX')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Cuenta de Destino
                </label>
                <select
                  value={transferData.destId}
                  onChange={(e) =>
                    setTransferData({ ...transferData, destId: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  {accounts
                    .filter((a) => a.id !== transferData.sourceId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.bankName} (Saldo: ${a.currentBalance.toLocaleString('es-MX')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Monto a Transferir ($ MXN)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferData.amount}
                  onChange={(e) =>
                    setTransferData({ ...transferData, amount: Number(e.target.value) })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Concepto / Motivo
                </label>
                <input
                  type="text"
                  required
                  value={transferData.concept}
                  onChange={(e) =>
                    setTransferData({ ...transferData, concept: e.target.value })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Aplicar Traspaso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
