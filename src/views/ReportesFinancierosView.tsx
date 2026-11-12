import React, { useState, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  Plus,
  TrendingUp,
} from 'lucide-react';

export const ReportesFinancierosView: React.FC = () => {
  const {
    projects,
    companies,
    activeCompanyId,
    setActiveCompanyId,
    accounts,
    incomes,
    expenses,
    payables,
    receivables,
    setActiveModule,
  } = useERP();

  const [reportView, setReportView] = useState<'resumen' | 'pnl' | 'balance_obras' | 'flujo_caja'>('resumen');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [taxDisplayMode, setTaxDisplayMode] = useState<'con_iva' | 'sin_iva'>('con_iva');

  // Dynamic Summary per S.A. + Global Consolidated
  const companySummaries = useMemo(() => {
    return companies.map((co) => {
      const coIncomes = incomes.filter((i) => i.companyId === co.id);
      const coExpenses = expenses.filter((e) => e.companyId === co.id);
      const coAccounts = accounts.filter((a) => a.companyId === co.id);

      const incomeSubtotal = coIncomes.reduce((s, i) => s + i.subtotal, 0);
      const incomeIva = coIncomes.reduce((s, i) => s + i.iva, 0);
      const incomeTotal = coIncomes.reduce((s, i) => s + i.total, 0);

      const expenseSubtotal = coExpenses.reduce((s, e) => s + e.subtotal, 0);
      const expenseIva = coExpenses.reduce((s, e) => s + e.iva, 0);
      const expenseTotal = coExpenses.reduce((s, e) => s + e.amount, 0);

      const netCashFlowConIva = incomeTotal - expenseTotal;
      const netCashFlowSinIva = incomeSubtotal - expenseSubtotal;
      const bankBalance = coAccounts.reduce((s, a) => s + a.currentBalance, 0);

      return {
        company: co,
        incomeCount: coIncomes.length,
        expenseCount: coExpenses.length,
        incomeSubtotal,
        incomeIva,
        incomeTotal,
        expenseSubtotal,
        expenseIva,
        expenseTotal,
        netCashFlowConIva,
        netCashFlowSinIva,
        bankBalance,
      };
    });
  }, [companies, incomes, expenses, accounts]);

  // Global Consolidated Totals
  const globalTotals = useMemo(() => {
    const visible =
      activeCompanyId === 'ALL'
        ? companySummaries
        : companySummaries.filter((c) => c.company.id === activeCompanyId);

    return visible.reduce(
      (acc, item) => ({
        incomeCount: acc.incomeCount + item.incomeCount,
        expenseCount: acc.expenseCount + item.expenseCount,
        incomeSubtotal: acc.incomeSubtotal + item.incomeSubtotal,
        incomeIva: acc.incomeIva + item.incomeIva,
        incomeTotal: acc.incomeTotal + item.incomeTotal,
        expenseSubtotal: acc.expenseSubtotal + item.expenseSubtotal,
        expenseIva: acc.expenseIva + item.expenseIva,
        expenseTotal: acc.expenseTotal + item.expenseTotal,
        netCashFlowConIva: acc.netCashFlowConIva + item.netCashFlowConIva,
        netCashFlowSinIva: acc.netCashFlowSinIva + item.netCashFlowSinIva,
        bankBalance: acc.bankBalance + item.bankBalance,
      }),
      {
        incomeCount: 0,
        expenseCount: 0,
        incomeSubtotal: 0,
        incomeIva: 0,
        incomeTotal: 0,
        expenseSubtotal: 0,
        expenseIva: 0,
        expenseTotal: 0,
        netCashFlowConIva: 0,
        netCashFlowSinIva: 0,
        bankBalance: 0,
      }
    );
  }, [companySummaries, activeCompanyId]);

  const displayedIncome =
    taxDisplayMode === 'con_iva' ? globalTotals.incomeTotal : globalTotals.incomeSubtotal;
  const displayedExpense =
    taxDisplayMode === 'con_iva' ? globalTotals.expenseTotal : globalTotals.expenseSubtotal;
  const displayedNetFlow =
    taxDisplayMode === 'con_iva'
      ? globalTotals.netCashFlowConIva
      : globalTotals.netCashFlowSinIva;

  // P&L and Project Balance calculations (preserved)
  const relevantProjects = projects.filter((p) => {
    const matchesCo = activeCompanyId === 'ALL' || p.companyId === activeCompanyId;
    const matchesProj = selectedProjectId === 'ALL' || p.id === selectedProjectId;
    return matchesCo && matchesProj;
  });

  const totalBilledIncome = relevantProjects.reduce((acc, p) => acc + p.billed, 0);
  const totalCollectedIncome = relevantProjects.reduce((acc, p) => acc + p.collected, 0);
  const totalDirectCosts = relevantProjects.reduce((acc, p) => acc + p.spent, 0);
  const totalIndirectCosts = totalDirectCosts * 0.08;
  const grossProfit = totalBilledIncome - totalDirectCosts;
  const netOperatingProfit = grossProfit - totalIndirectCosts;
  const netMarginPercent =
    totalBilledIncome > 0 ? Number(((netOperatingProfit / totalBilledIncome) * 100).toFixed(1)) : 0;

  const relevantAccounts = accounts.filter(
    (a) => activeCompanyId === 'ALL' || a.companyId === activeCompanyId
  );
  const totalCashOnHand = relevantAccounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const pendingPayables = payables
    .filter((p) => activeCompanyId === 'ALL' || p.companyId === activeCompanyId)
    .reduce((acc, p) => acc + p.balance, 0);
  const pendingReceivables = receivables
    .filter((r) => activeCompanyId === 'ALL' || r.companyId === activeCompanyId)
    .reduce((acc, r) => acc + r.balance, 0);
  const projectedNetCashFlow = totalCashOnHand + pendingReceivables - pendingPayables;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Dashboard Resumen Gerencial</span>
              <span aria-hidden="true">·</span>
              <span>Sincronización en Tiempo Real</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 text-balance">
              Consolidado Financiero por S.A. y Flujo de Caja Neto
            </h1>
            <p className="text-sm text-slate-600 mt-0.5 max-w-3xl">
              Suma dinámicamente los ingresos, egresos y flujo de caja neto por cada Sociedad Anónima y en consolidado global a partir de cada operación registrada.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveModule('ventas_estimaciones')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Cobro</span>
            </button>

            <button
              onClick={() => setActiveModule('compras_gastos')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Egreso</span>
            </button>
          </div>
        </div>

        {/* Sub-selector de Reportes + Toggle Base Fiscal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit overflow-x-auto text-xs">
            <button
              onClick={() => setReportView('resumen')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                reportView === 'resumen'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resumen por S.A. y Global
            </button>
            <button
              onClick={() => setReportView('pnl')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                reportView === 'pnl'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Estado de Resultados (P&L)
            </button>
            <button
              onClick={() => setReportView('balance_obras')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                reportView === 'balance_obras'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Balance por Obra
            </button>
            <button
              onClick={() => setReportView('flujo_caja')}
              className={`px-3.5 py-2 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap ${
                reportView === 'flujo_caja'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proyección CXC / CXP
            </button>
          </div>

          {reportView === 'resumen' ? (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit text-xs">
              <button
                onClick={() => setTaxDisplayMode('con_iva')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  taxDisplayMode === 'con_iva'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flujo Real c/IVA
              </button>
              <button
                onClick={() => setTaxDisplayMode('sin_iva')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  taxDisplayMode === 'sin_iva'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Base s/IVA
              </button>
            </div>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              <option value="ALL">Todas las Obras</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* VIEW 0: DASHBOARD RESUMEN POR S.A. Y CONSOLIDADO GLOBAL */}
      {reportView === 'resumen' && (
        <div className="space-y-6">
          {/* Consolidado Global KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Ingresos Totales ({taxDisplayMode === 'con_iva' ? 'c/IVA' : 's/IVA'})
                </span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl md:text-2xl font-black font-mono tabular-nums text-emerald-700 mt-1.5">
                +${displayedIncome.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                {globalTotals.incomeCount} cobros · IVA 16%: ${globalTotals.incomeIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Egresos Totales ({taxDisplayMode === 'con_iva' ? 'c/IVA' : 's/IVA'})
                </span>
                <ArrowUpRight className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-xl md:text-2xl font-black font-mono tabular-nums text-red-700 mt-1.5">
                -${displayedExpense.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                {globalTotals.expenseCount} gastos · IVA Acred: ${globalTotals.expenseIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Flujo de Caja Neto ({activeCompanyId === 'ALL' ? 'Global' : activeCompanyId})
                </span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div
                className={`text-xl md:text-2xl font-black font-mono tabular-nums mt-1.5 ${
                  displayedNetFlow >= 0 ? 'text-amber-400' : 'text-red-400'
                }`}
              >
                {displayedNetFlow >= 0 ? '+' : '-'}$
                {Math.abs(displayedNetFlow).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                {displayedNetFlow >= 0 ? 'Superávit operativo' : 'Déficit operativo'} (Ingresos − Egresos)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Saldo en Bancos y Cajas
                </span>
                <Landmark className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-xl md:text-2xl font-black font-mono tabular-nums text-slate-900 mt-1.5">
                ${globalTotals.bankBalance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <button
                onClick={() => setActiveModule('tesoreria')}
                className="text-[11px] text-blue-700 hover:underline font-semibold mt-1 cursor-pointer"
              >
                Ver detalle por banco →
              </button>
            </div>
          </div>

          {/* Tarjetas Comparativas por S.A. */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800">
                Desempeño por Sociedad Anónima (Clic para filtrar)
              </h2>
              {activeCompanyId !== 'ALL' && (
                <button
                  onClick={() => setActiveCompanyId('ALL')}
                  className="text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
                >
                  Mostrar Consolidado Global (3 S.A.)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {companySummaries.map((item) => {
                const incVal =
                  taxDisplayMode === 'con_iva' ? item.incomeTotal : item.incomeSubtotal;
                const expVal =
                  taxDisplayMode === 'con_iva' ? item.expenseTotal : item.expenseSubtotal;
                const netVal =
                  taxDisplayMode === 'con_iva' ? item.netCashFlowConIva : item.netCashFlowSinIva;
                const maxBar = Math.max(incVal, expVal, 1);
                const isSelected = activeCompanyId === item.company.id;

                return (
                  <div
                    key={item.company.id}
                    onClick={() =>
                      setActiveCompanyId(isSelected ? 'ALL' : item.company.id)
                    }
                    className={`bg-white border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="text-xs font-mono text-amber-700 font-bold">
                            {item.company.id} · RFC {item.company.rfc}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-0.5">
                            {item.company.shortName}
                          </h3>
                        </div>
                        <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                      </div>

                      {/* Bars Ingresos vs Egresos */}
                      <div className="mt-4 space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-600 font-medium">
                              Ingresos ({item.incomeCount})
                            </span>
                            <span className="font-mono tabular-nums font-bold text-emerald-700">
                              +${incVal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-emerald-600 rounded-full"
                              style={{ width: `${Math.min(100, (incVal / maxBar) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-slate-600 font-medium">
                              Egresos ({item.expenseCount})
                            </span>
                            <span className="font-mono tabular-nums font-bold text-red-700">
                              -${expVal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-red-600 rounded-full"
                              style={{ width: `${Math.min(100, (expVal / maxBar) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Flujo de Caja Neto:</span>
                        <span
                          className={`font-mono tabular-nums font-extrabold text-sm ${
                            netVal >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {netVal >= 0 ? '+' : '-'}$
                          {Math.abs(netVal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Saldo Actual Bancos:</span>
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          ${item.bankBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla Matriz Consolidado por S.A. + Global */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Matriz Consolidada por S.A. y Total del Grupo
              </h2>
              <span className="text-xs text-slate-500 font-mono">MXN · Tiempo Real</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Sociedad Anónima (S.A.)</th>
                    <th className="py-3 px-4 text-right">Ingresos s/IVA</th>
                    <th className="py-3 px-4 text-right">IVA 16% Cobrado</th>
                    <th className="py-3 px-4 text-right">Total Ingresos c/IVA</th>
                    <th className="py-3 px-4 text-right">Total Egresos c/IVA</th>
                    <th className="py-3 px-4 text-right">Flujo de Caja Neto</th>
                    <th className="py-3 px-4 text-right">Saldo en Bancos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companySummaries.map((row) => (
                    <tr key={row.company.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{row.company.shortName}</div>
                        <div className="text-[11px] text-slate-500">{row.company.name}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        ${row.incomeSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        ${row.incomeIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                        +${row.incomeTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-red-700">
                        -${row.expenseTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono tabular-nums font-extrabold ${
                          row.netCashFlowConIva >= 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {row.netCashFlowConIva >= 0 ? '+' : '-'}$
                        {Math.abs(row.netCashFlowConIva).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                        ${row.bankBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold">
                  <tr>
                    <td className="py-3.5 px-4">
                      CONSOLIDADO GLOBAL ({companies.length} S.A.)
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      ${companySummaries
                        .reduce((s, r) => s + r.incomeSubtotal, 0)
                        .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-300">
                      ${companySummaries
                        .reduce((s, r) => s + r.incomeIva, 0)
                        .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-300">
                      +${companySummaries
                        .reduce((s, r) => s + r.incomeTotal, 0)
                        .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-red-300">
                      -${companySummaries
                        .reduce((s, r) => s + r.expenseTotal, 0)
                        .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-amber-400">
                      {(() => {
                        const netAll = companySummaries.reduce((s, r) => s + r.netCashFlowConIva, 0);
                        return `${netAll >= 0 ? '+' : '-'}$${Math.abs(netAll).toLocaleString('es-MX', {
                          minimumFractionDigits: 2,
                        })}`;
                      })()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                      ${companySummaries
                        .reduce((s, r) => s + r.bankBalance, 0)
                        .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: ESTADO DE RESULTADOS (P&L) */}
      {reportView === 'pnl' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Estado de Resultados Integral (P&L)
              </h2>
              <p className="text-xs text-slate-500">
                {activeCompanyId === 'ALL'
                  ? 'Consolidado Grupo Constructor (3 S.A.)'
                  : `Reporte de ${companies.find((c) => c.id === activeCompanyId)?.name}`}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              Al día de hoy · MXN
            </span>
          </div>

          <div className="space-y-3 max-w-3xl text-xs md:text-sm">
            <div className="flex justify-between items-center py-2.5 font-bold text-slate-900 border-b border-slate-200">
              <span className="text-sm">1. Ingresos Totales por Estimaciones y Obras</span>
              <span className="font-mono tabular-nums text-base text-emerald-700">
                ${totalBilledIncome.toLocaleString('es-MX')}
              </span>
            </div>

            <div className="pl-4 space-y-2 text-slate-600 text-xs">
              <div className="flex justify-between">
                <span>Cobranza Efectiva Depositada en Bancos</span>
                <span className="font-mono tabular-nums">${totalCollectedIncome.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimaciones en Tránsito por Cobrar (CXC)</span>
                <span className="font-mono tabular-nums">
                  ${(totalBilledIncome - totalCollectedIncome).toLocaleString('es-MX')}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-2.5 font-bold text-slate-900 border-b border-slate-200 mt-4">
              <span className="text-sm">2. Costos Directos de Construcción</span>
              <span className="font-mono tabular-nums text-base text-red-700">
                -${totalDirectCosts.toLocaleString('es-MX')}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-xl font-black text-slate-900 my-4">
              <span>UTILIDAD BRUTA DEL PROYECTO</span>
              <span className="font-mono tabular-nums text-base text-slate-900">
                ${grossProfit.toLocaleString('es-MX')} (
                {totalBilledIncome > 0 ? ((grossProfit / totalBilledIncome) * 100).toFixed(1) : 0}%)
              </span>
            </div>

            <div className="flex justify-between items-center py-2 font-bold text-slate-800">
              <span>3. Gastos Indirectos y Administrativos (8%)</span>
              <span className="font-mono tabular-nums text-red-700">
                -${totalIndirectCosts.toLocaleString('es-MX')}
              </span>
            </div>

            <div className="flex justify-between items-center py-3.5 bg-slate-900 text-white px-4 rounded-xl font-black text-sm md:text-base mt-6">
              <span>UTILIDAD NETA REAL DE OPERACIÓN</span>
              <span className="font-mono tabular-nums text-amber-400">
                ${netOperatingProfit.toLocaleString('es-MX')} ({netMarginPercent}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BALANCE DE CADA CENTRO DE COSTO */}
      {reportView === 'balance_obras' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Balance por Centro de Costos: Presupuestado vs Gastado vs Cobrado
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {relevantProjects.length} proyectos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Centro de Costo / Obra</th>
                  <th className="py-3 px-4">S.A.</th>
                  <th className="py-3 px-4 text-right">Presupuestado</th>
                  <th className="py-3 px-4 text-right">Gastado (Costos)</th>
                  <th className="py-3 px-4 text-right">Facturado</th>
                  <th className="py-3 px-4 text-right">Cobrado Bancos</th>
                  <th className="py-3 px-4 text-right">Utilidad Real</th>
                  <th className="py-3 px-4 text-center">Margen %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relevantProjects.map((p) => {
                  const company = companies.find((c) => c.id === p.companyId);
                  const projectProfit = p.billed - p.spent;
                  const projectMargin =
                    p.billed > 0 ? Number(((projectProfit / p.billed) * 100).toFixed(1)) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">{p.code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {company?.shortName || p.companyId}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        ${p.initialBudget.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-amber-700">
                        ${p.spent.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-blue-700">
                        ${p.billed.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                        ${p.collected.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                        ${projectProfit.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono tabular-nums font-bold text-xs ${
                            projectMargin >= 15
                              ? 'text-emerald-700'
                              : projectMargin > 0
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}
                        >
                          {projectMargin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: FLUJO DE EFECTIVO PROYECTADO */}
      {reportView === 'flujo_caja' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Posición Inmediata de Flujo de Efectivo (CXC vs CXP)
              </h2>
              <p className="text-xs text-slate-500">
                Disponibilidad líquida en cuentas bancarias frente a compromisos de pago y cobranza en tránsito.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              Corte Inmediato
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">
                (+) Liquidez Inmediata (Bancos + Cajas)
              </span>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                ${totalCashOnHand.toLocaleString('es-MX')}
              </div>
              <span className="text-[11px] text-slate-400">Saldo listo para dispersión</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">
                (+) Cobranza Estimaciones por Entrar (CXC)
              </span>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
                +${pendingReceivables.toLocaleString('es-MX')}
              </div>
              <span className="text-[11px] text-emerald-700">Facturas vigentes clientes</span>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <span className="text-xs text-red-800 font-semibold block">
                (-) Pasivos Comprometidos Proveedores (CXP)
              </span>
              <div className="text-xl font-bold font-mono tabular-nums text-red-700 mt-1">
                -${pendingPayables.toLocaleString('es-MX')}
              </div>
              <span className="text-[11px] text-red-700">Materiales y renta de equipo</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">
                Flujo Neto Proyectado a 30 Días
              </span>
              <div className="text-2xl font-black font-mono tabular-nums text-amber-400 mt-0.5">
                ${projectedNetCashFlow.toLocaleString('es-MX')} MXN
              </div>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-emerald-400 font-semibold">
              Solvencia Operativa
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
