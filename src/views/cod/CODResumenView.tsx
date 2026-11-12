import React, { useMemo, useState } from 'react';
import { useCOD } from '../../context/CODContext';
import { useERP } from '../../context/ERPContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Building2,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CODResumenView: React.FC = () => {
  const {
    companies,
    accounts,
    incomes,
    expenses,
    costCenters,
    selectedCompanyFilter,
    resetCODData,
  } = useCOD();
  const { setActiveModule } = useERP();

  const [taxMode, setTaxMode] = useState<'con_iva' | 'sin_iva'>('con_iva');

  // Dynamic metrics per S.A.
  const companyColumns = useMemo(() => {
    return companies.map((co) => {
      const coIncomes = incomes.filter((i) => i.companyId === co.id);
      const coExpenses = expenses.filter((e) => e.companyId === co.id);
      const coAccounts = accounts.filter((a) => a.companyId === co.id);

      const totalIngresosConIva = coIncomes.reduce((s, i) => s + i.total, 0);
      const totalIngresosSinIva = coIncomes.reduce((s, i) => s + i.subtotal, 0);

      const totalEgresosConIva = coExpenses.reduce((s, e) => s + e.total, 0);
      const totalEgresosSinIva = coExpenses.reduce((s, e) => s + e.subtotal, 0);

      const totalIngresos = taxMode === 'con_iva' ? totalIngresosConIva : totalIngresosSinIva;
      const totalEgresos = taxMode === 'con_iva' ? totalEgresosConIva : totalEgresosSinIva;
      const flujoNeto = totalIngresos - totalEgresos;

      // Bank balance always equals Initial + Real Incomes (c/IVA) - Real Expenses (c/IVA)
      const saldoBancos = coAccounts.reduce((s, a) => s + a.currentBalance, 0);
      const saldoInicial = coAccounts.reduce((s, a) => s + a.initialBalance, 0);

      return {
        company: co,
        incomeCount: coIncomes.length,
        expenseCount: coExpenses.length,
        totalIngresos,
        totalEgresos,
        flujoNeto,
        saldoBancos,
        saldoInicial,
      };
    });
  }, [companies, incomes, expenses, accounts, taxMode]);

  const visibleColumns = useMemo(() => {
    if (selectedCompanyFilter === 'ALL') return companyColumns;
    return companyColumns.filter((c) => c.company.id === selectedCompanyFilter);
  }, [companyColumns, selectedCompanyFilter]);

  const consolidado = useMemo(() => {
    return visibleColumns.reduce(
      (acc, col) => ({
        totalIngresos: acc.totalIngresos + col.totalIngresos,
        totalEgresos: acc.totalEgresos + col.totalEgresos,
        flujoNeto: acc.flujoNeto + col.flujoNeto,
        saldoBancos: acc.saldoBancos + col.saldoBancos,
        incomeCount: acc.incomeCount + col.incomeCount,
        expenseCount: acc.expenseCount + col.expenseCount,
      }),
      {
        totalIngresos: 0,
        totalEgresos: 0,
        flujoNeto: 0,
        saldoBancos: 0,
        incomeCount: 0,
        expenseCount: 0,
      }
    );
  }, [visibleColumns]);

  // Gasto acumulado por Obra (Centro de Costos)
  const costCenterSummary = useMemo(() => {
    return costCenters
      .map((obra) => {
        const companyName = companies.find((c) => c.id === obra.companyId)?.name || '';
        const obraExpenses = expenses.filter((e) => e.projectId === obra.id);
        const spent = obraExpenses.reduce(
          (s, e) => s + (taxMode === 'con_iva' ? e.total : e.subtotal),
          0
        );
        return {
          obra,
          companyName,
          count: obraExpenses.length,
          spent,
        };
      })
      .filter((item) => selectedCompanyFilter === 'ALL' || item.obra.companyId === selectedCompanyFilter);
  }, [costCenters, companies, expenses, selectedCompanyFilter, taxMode]);

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Resumen Financiero Consolidado
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sincronización automática en tiempo real por Sociedad Anónima y Consolidado Global
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle c/IVA vs s/IVA */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setTaxMode('con_iva')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                taxMode === 'con_iva'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Total c/IVA
            </button>
            <button
              onClick={() => setTaxMode('sin_iva')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                taxMode === 'sin_iva'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Base s/IVA
            </button>
          </div>

          <button
            onClick={() => setActiveModule('cod_ingresos')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+ Ingreso</span>
          </button>

          <button
            onClick={() => setActiveModule('cod_egresos')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Egreso</span>
          </button>

          <button
            onClick={resetCODData}
            title="Restablecer datos base del ejemplo"
            className="inline-flex items-center gap-1 px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TOTAL DE INGRESOS (Cobros)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 font-mono tabular-nums">
            ${fmt(consolidado.totalIngresos)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {consolidado.incomeCount} cobros registrados ({taxMode === 'con_iva' ? 'c/IVA' : 's/IVA'})
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TOTAL DE EGRESOS (Gastos / Compras)</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700 font-mono tabular-nums">
            ${fmt(consolidado.totalEgresos)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {consolidado.expenseCount} egresos vinculados a obra ({taxMode === 'con_iva' ? 'c/IVA' : 's/IVA'})
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>FLUJO DE CAJA NETO</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div
            className={`mt-2 text-2xl font-black font-mono tabular-nums ${
              consolidado.flujoNeto >= 0 ? 'text-slate-900' : 'text-rose-700'
            }`}
          >
            ${fmt(consolidado.flujoNeto)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Fórmula: Ingresos − Egresos
          </div>
        </div>

        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>SALDO EN BANCOS Y EFECTIVO</span>
            <Landmark className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono tabular-nums">
            ${fmt(consolidado.saldoBancos)}
          </div>
          <button
            onClick={() => setActiveModule('cod_bancos')}
            className="mt-1 text-[11px] text-slate-300 hover:text-amber-300 underline cursor-pointer"
          >
            Ver conciliación por banco y efectivo →
          </button>
        </div>
      </div>

      {/* Main Consolidated Matrix Table (Exact Spreadsheet Layout) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
          <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wide">
            RESUMEN FINANCIERO CONSOLIDADO (SINCRONIZADO EN TIEMPO REAL)
          </h2>
          <span className="text-[11px] font-mono font-semibold text-slate-500">
            Vista: {taxMode === 'con_iva' ? 'Montos c/IVA 16%' : 'Montos s/IVA (Saldo bancos en flujo real)'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#0B2545] text-white text-xs">
                <th className="py-3 px-4 text-left font-bold min-w-[240px]">Concepto</th>
                {visibleColumns.map((col) => (
                  <th key={col.company.id} className="py-3 px-4 text-right font-bold min-w-[170px]">
                    {col.company.name}
                  </th>
                ))}
                <th className="py-3 px-4 text-right font-black bg-[#061830] text-amber-300 min-w-[180px]">
                  CONSOLIDADO GLOBAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  TOTAL DE INGRESOS (Cobros)
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.company.id}
                    className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700"
                  >
                    ${fmt(col.totalIngresos)}
                  </td>
                ))}
                <td className="py-3.5 px-4 text-right font-mono tabular-nums font-black text-emerald-800 bg-emerald-50/50">
                  ${fmt(consolidado.totalIngresos)}
                </td>
              </tr>

              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  TOTAL DE EGRESOS (Gastos / Compras)
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.company.id}
                    className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-rose-700"
                  >
                    ${fmt(col.totalEgresos)}
                  </td>
                ))}
                <td className="py-3.5 px-4 text-right font-mono tabular-nums font-black text-rose-800 bg-rose-50/50">
                  ${fmt(consolidado.totalEgresos)}
                </td>
              </tr>

              <tr className="bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  FLUJO DE CAJA NETO
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.company.id}
                    className={`py-3.5 px-4 text-right font-mono tabular-nums font-bold ${
                      col.flujoNeto >= 0 ? 'text-slate-900' : 'text-rose-700'
                    }`}
                  >
                    ${fmt(col.flujoNeto)}
                  </td>
                ))}
                <td
                  className={`py-3.5 px-4 text-right font-mono tabular-nums font-black bg-slate-100 ${
                    consolidado.flujoNeto >= 0 ? 'text-slate-950' : 'text-rose-700'
                  }`}
                >
                  ${fmt(consolidado.flujoNeto)}
                </td>
              </tr>

              <tr className="bg-amber-50/40 hover:bg-amber-50/70 transition-colors">
                <td className="py-4 px-4 font-black text-slate-900">
                  SALDO EN BANCOS Y EFECTIVO
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.company.id}
                    className="py-4 px-4 text-right font-mono tabular-nums font-black text-[#0B2545]"
                  >
                    ${fmt(col.saldoBancos)}
                  </td>
                ))}
                <td className="py-4 px-4 text-right font-mono tabular-nums font-black text-[#0B2545] bg-amber-100/70">
                  ${fmt(consolidado.saldoBancos)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Two-Column Operational Breakdown: Banks + Cost Centers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Bank & Cash Snapshot */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#0B2545]" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Saldos por Banco y Efectivo
              </h3>
            </div>
            <button
              onClick={() => setActiveModule('cod_bancos')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Abrir Control Bancario →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {accounts
              .filter((a) => selectedCompanyFilter === 'ALL' || a.companyId === selectedCompanyFilter)
              .map((acc) => (
                <div key={acc.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {acc.type === 'banco' ? 'Banco' : 'Efectivo'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{acc.companyName}</div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-sm font-black text-[#0B2545]">${fmt(acc.currentBalance)}</div>
                    <div className="text-[10px] text-slate-500">
                      +{fmt(acc.totalIncomes)} / -{fmt(acc.totalExpenses)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Cost Centers (Obras) Expense Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0B2545]" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Egresos Acumulados por Obra (Centro de Costos)
              </h3>
            </div>
            <button
              onClick={() => setActiveModule('cod_egresos')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Ir a Egresos →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {costCenterSummary.map((row) => (
              <div key={row.obra.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{row.obra.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {row.companyName} · {row.count} {row.count === 1 ? 'egreso' : 'egresos'}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-sm font-black text-rose-700">${fmt(row.spent)}</div>
                  <div className="text-[10px] text-slate-500">
                    {taxMode === 'con_iva' ? 'c/IVA' : 's/IVA'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
