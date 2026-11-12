import React, { useState, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Banknote,
  ShieldCheck,
  X,
  Plus,
} from 'lucide-react';

export const TesoreriaView: React.FC = () => {
  const {
    accounts,
    companies,
    activeCompanyId,
    bankMovements,
    transferBetweenAccounts,
    setActiveModule,
  } = useERP();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('ALL');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'ALL' | 'ingreso' | 'egreso' | 'transferencia'>('ALL');
  const [transferData, setTransferData] = useState({
    sourceId: accounts[0]?.id || '',
    destId: accounts[1]?.id || '',
    amount: 50000,
    concept: 'Fondeo operativo entre cuentas',
  });

  const filteredAccounts = useMemo(
    () => accounts.filter((a) => activeCompanyId === 'ALL' || a.companyId === activeCompanyId),
    [accounts, activeCompanyId]
  );

  // Per-account real-time inflows/outflows summary
  const accountMetrics = useMemo(() => {
    const map: Record<
      string,
      { inflows: number; outflows: number; transfersIn: number; transfersOut: number }
    > = {};
    for (const acc of accounts) {
      const movs = bankMovements.filter((m) => m.accountId === acc.id);
      const inflows = movs
        .filter((m) => m.type === 'ingreso')
        .reduce((s, m) => s + m.amount, 0);
      const outflows = movs
        .filter((m) => m.type === 'egreso')
        .reduce((s, m) => s + m.amount, 0);
      const transfersIn = movs
        .filter((m) => m.type === 'transferencia_entrada')
        .reduce((s, m) => s + m.amount, 0);
      const transfersOut = movs
        .filter((m) => m.type === 'transferencia_salida')
        .reduce((s, m) => s + m.amount, 0);
      map[acc.id] = { inflows, outflows, transfersIn, transfersOut };
    }
    return map;
  }, [accounts, bankMovements]);

  const totalLiquidity = filteredAccounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const totalInflowsFiltered = filteredAccounts.reduce(
    (acc, a) => acc + (accountMetrics[a.id]?.inflows || 0),
    0
  );
  const totalOutflowsFiltered = filteredAccounts.reduce(
    (acc, a) => acc + (accountMetrics[a.id]?.outflows || 0),
    0
  );
  const bankAccountsLiquidity = filteredAccounts
    .filter((a) => a.accountType === 'banco')
    .reduce((acc, a) => acc + a.currentBalance, 0);

  const filteredMovements = useMemo(() => {
    return bankMovements.filter((m) => {
      const matchesCompany = activeCompanyId === 'ALL' || m.companyId === activeCompanyId;
      const matchesAcc = selectedAccountFilter === 'ALL' || m.accountId === selectedAccountFilter;
      const matchesType =
        movementTypeFilter === 'ALL'
          ? true
          : movementTypeFilter === 'transferencia'
          ? m.type === 'transferencia_entrada' || m.type === 'transferencia_salida'
          : m.type === movementTypeFilter;
      return matchesCompany && matchesAcc && matchesType;
    });
  }, [bankMovements, activeCompanyId, selectedAccountFilter, movementTypeFilter]);

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
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Tesorería y Bancos</span>
              <span aria-hidden="true">·</span>
              <span>Conciliación Automática en Tiempo Real</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 text-balance">
              Control de Saldos Bancarios y Flujo de Caja
            </h1>
            <p className="text-sm text-slate-600 mt-0.5 max-w-3xl">
              Cada cuenta actualiza automáticamente su saldo disponible sumando ingresos cobrados y restando egresos u órdenes de pago en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveModule('ventas_estimaciones')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Ingreso</span>
            </button>

            <button
              onClick={() => setActiveModule('compras_gastos')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Egreso</span>
            </button>

            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Traspaso</span>
            </button>
          </div>
        </div>

        {/* Global Liquidity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Saldo Total Disponible
            </span>
            <div className="text-base md:text-xl font-black font-mono tabular-nums text-slate-900 mt-1">
              ${totalLiquidity.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">Bancos + Cajas en MXN</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              En Cuentas Bancarias
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-blue-700 mt-1">
              ${bankAccountsLiquidity.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">Banorte, IXE, Banregio</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              (+) Ingresos Sumados
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-emerald-700 mt-1">
              +${totalInflowsFiltered.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">Depósitos c/IVA acreditados</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              (-) Egresos Restados
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-red-700 mt-1">
              -${totalOutflowsFiltered.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">Compras y WhatsApp OCR</span>
          </div>
        </div>
      </div>

      {/* Cuentas Bancarias y Cajas de Obra */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">
            Cuentas Bancarias y Cajas por S.A. ({filteredAccounts.length})
          </h2>
          <span className="text-xs text-slate-500">
            Fórmula: Saldo Inicial + Ingresos − Egresos = Saldo Actual
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => {
            const company = companies.find((c) => c.id === account.companyId);
            const metrics = accountMetrics[account.id] || {
              inflows: 0,
              outflows: 0,
              transfersIn: 0,
              transfersOut: 0,
            };
            const isFiltered = selectedAccountFilter === account.id;

            return (
              <div
                key={account.id}
                onClick={() =>
                  setSelectedAccountFilter((prev) => (prev === account.id ? 'ALL' : account.id))
                }
                className={`bg-white border rounded-2xl p-5 transition-all flex flex-col justify-between cursor-pointer ${
                  isFiltered
                    ? 'border-amber-500 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                        {account.accountType === 'banco' ? (
                          <Landmark className="w-5 h-5 text-blue-700" />
                        ) : (
                          <Banknote className="w-5 h-5 text-emerald-700" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{account.bankName}</h3>
                        <span className="font-mono text-xs text-slate-500">
                          {account.accountNumber} · {company?.shortName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Audit formula breakdown */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Saldo Inicial:</span>
                      <span className="font-mono tabular-nums text-slate-700">
                        ${account.initialBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>(+) Ingresos:</span>
                      <span className="font-mono tabular-nums font-semibold">
                        +${metrics.inflows.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-red-700">
                      <span>(-) Egresos:</span>
                      <span className="font-mono tabular-nums font-semibold">
                        -${metrics.outflows.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {(metrics.transfersIn > 0 || metrics.transfersOut > 0) && (
                      <div className="flex items-center justify-between text-blue-700">
                        <span>(+/-) Traspasos netos:</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {(metrics.transfersIn - metrics.transfersOut) >= 0 ? '+' : '-'}$
                          {Math.abs(metrics.transfersIn - metrics.transfersOut).toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Saldo Actual en Tiempo Real
                    </span>
                    <div className="text-xl font-mono tabular-nums font-black text-slate-900 mt-0.5">
                      ${account.currentBalance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-amber-700">
                    {isFiltered ? 'Filtrando' : 'Ver movimientos'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movimientos y Conciliación en Tiempo Real */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Libro de Movimientos Bancarios en Tiempo Real
            </h2>
            <p className="text-xs text-slate-500">
              Sincronización automática desde Ingresos, Compras/Gastos y WhatsApp OCR.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 cursor-pointer"
            >
              <option value="ALL">Todas las cuentas</option>
              {filteredAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bankName}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              {(['ALL', 'ingreso', 'egreso', 'transferencia'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMovementTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    movementTypeFilter === t
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t === 'ALL'
                    ? 'Todos'
                    : t === 'ingreso'
                    ? 'Ingresos'
                    : t === 'egreso'
                    ? 'Egresos'
                    : 'Traspasos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredMovements.length > 0 ? (
            filteredMovements.map((mov) => {
              const acc = accounts.find((a) => a.id === mov.accountId);
              const company = companies.find((c) => c.id === mov.companyId);
              const isPositive =
                mov.type === 'ingreso' || mov.type === 'transferencia_entrada';

              return (
                <div
                  key={mov.id}
                  className="py-3 px-2 flex items-center justify-between gap-3 text-xs md:text-sm hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
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
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{mov.concept}</div>
                      <div className="text-[11px] text-slate-500">
                        {acc?.bankName} · {company?.shortName} · Ref: {mov.reference} · {mov.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono tabular-nums font-bold ${
                        isPositive ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {isPositive ? '+' : '-'}$
                      {mov.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium">
                      <ShieldCheck className="w-3 h-3 inline mr-0.5 text-emerald-600" />
                      Conciliado
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No hay movimientos registrados para los filtros seleccionados.
            </div>
          )}
        </div>
      </div>

      {/* Modal Traspaso entre Cuentas */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
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
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                aria-label="Cerrar"
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
                      {a.bankName} ({a.companyId} · Saldo: ${a.currentBalance.toLocaleString('es-MX')})
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
                        {a.bankName} ({a.companyId} · Saldo: ${a.currentBalance.toLocaleString('es-MX')})
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
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-800 font-bold"
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
