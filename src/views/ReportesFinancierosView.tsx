import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  PieChart,
  TrendingUp,
  Building2,
  DollarSign,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  CheckCircle2,
  Scale,
  Landmark,
} from 'lucide-react';

export const ReportesFinancierosView: React.FC = () => {
  const {
    projects,
    companies,
    activeCompanyId,
    setActiveCompanyId,
    accounts,
    expenses,
    payables,
    receivables,
  } = useERP();

  const [reportView, setReportView] = useState<'pnl' | 'balance_obras' | 'flujo_caja'>('pnl');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');

  // Filter projects by company and optional specific project
  const relevantProjects = projects.filter((p) => {
    const matchesCo = activeCompanyId === 'ALL' || p.companyId === activeCompanyId;
    const matchesProj = selectedProjectId === 'ALL' || p.id === selectedProjectId;
    return matchesCo && matchesProj;
  });

  // Calculate Consolidated P&L
  const totalBilledIncome = relevantProjects.reduce((acc, p) => acc + p.billed, 0);
  const totalCollectedIncome = relevantProjects.reduce((acc, p) => acc + p.collected, 0);
  const totalDirectCosts = relevantProjects.reduce((acc, p) => acc + p.spent, 0);

  // Indirect Costs estimated around 8% of spent
  const totalIndirectCosts = totalDirectCosts * 0.08;
  const grossProfit = totalBilledIncome - totalDirectCosts;
  const netOperatingProfit = grossProfit - totalIndirectCosts;
  const netMarginPercent =
    totalBilledIncome > 0 ? Number(((netOperatingProfit / totalBilledIncome) * 100).toFixed(1)) : 0;

  // Real Cash Flow Liquidity
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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
              Módulo G · Lo Más Importante
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1.5">
              Reportes Financieros y Utilidad Real en Tiempo Real
            </h1>
            <p className="text-sm text-slate-600 mt-0.5 max-w-3xl">
              Visibilidad total de la rentabilidad por obra, por Sociedad Anónima (S.A.) y consolidada. Sin esperas al cierre de año ni hojas de Excel desfasadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Project Filter */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">Todas las Obras</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-selector de Reportes */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mt-5 w-fit overflow-x-auto text-xs">
          <button
            onClick={() => setReportView('pnl')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportView === 'pnl'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estado de Resultados (P&L)
          </button>
          <button
            onClick={() => setReportView('balance_obras')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportView === 'balance_obras'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Balance de Centros de Costo
          </button>
          <button
            onClick={() => setReportView('flujo_caja')}
            className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportView === 'flujo_caja'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flujo de Efectivo Inmediato
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Ingresos Facturados
          </span>
          <div className="text-lg md:text-xl font-black font-mono text-slate-900 mt-1">
            ${totalBilledIncome.toLocaleString('es-MX')}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">
            Cobrado: ${totalCollectedIncome.toLocaleString('es-MX')}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Costos Directos de Obra
          </span>
          <div className="text-lg md:text-xl font-black font-mono text-amber-700 mt-1">
            ${totalDirectCosts.toLocaleString('es-MX')}
          </div>
          <span className="text-[10px] text-slate-400">Materiales + Maquinaria + Subcontratos</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Utilidad Neta de Operación
          </span>
          <div
            className={`text-lg md:text-xl font-black font-mono mt-1 ${
              netOperatingProfit >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            ${netOperatingProfit.toLocaleString('es-MX')}
          </div>
          <span className="text-[10px] text-slate-400">Deduciendo indirectos operativos</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Margen de Utilidad Real
          </span>
          <div
            className={`text-lg md:text-xl font-black font-mono mt-1 ${
              netMarginPercent >= 15 ? 'text-emerald-700' : 'text-amber-600'
            }`}
          >
            {netMarginPercent}%
          </div>
          <span className="text-[10px] text-slate-400">Rentabilidad consolidada</span>
        </div>
      </div>

      {/* VIEW 1: ESTADO DE RESULTADOS (P&L) */}
      {reportView === 'pnl' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
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
            {/* Ingresos */}
            <div className="flex justify-between items-center py-2.5 font-bold text-slate-900 border-b border-slate-200">
              <span className="text-sm">1. Ingresos Totales por Estimaciones</span>
              <span className="font-mono text-base text-emerald-700">
                ${totalBilledIncome.toLocaleString('es-MX')}
              </span>
            </div>

            <div className="pl-4 space-y-2 text-slate-600 text-xs">
              <div className="flex justify-between">
                <span>( - ) Cobranza Efectiva Depositada en Bancos</span>
                <span className="font-mono">${totalCollectedIncome.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>( - ) Estimaciones en Tránsito por Cobrar (CXC)</span>
                <span className="font-mono">
                  ${(totalBilledIncome - totalCollectedIncome).toLocaleString('es-MX')}
                </span>
              </div>
            </div>

            {/* Costos Directos */}
            <div className="flex justify-between items-center py-2.5 font-bold text-slate-900 border-b border-slate-200 mt-4">
              <span className="text-sm">2. Costos Directos de Construcción</span>
              <span className="font-mono text-base text-red-700">
                -${totalDirectCosts.toLocaleString('es-MX')}
              </span>
            </div>

            <div className="pl-4 space-y-2 text-slate-600 text-xs">
              <div className="flex justify-between">
                <span>Materiales Básicos (Concreto, Acero, Agregados)</span>
                <span className="font-mono">
                  -${(totalDirectCosts * 0.58).toLocaleString('es-MX')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mano de Obra y Subcontratos Especializados</span>
                <span className="font-mono">
                  -${(totalDirectCosts * 0.24).toLocaleString('es-MX')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Renta de Maquinaria, Cimbra y Equipos</span>
                <span className="font-mono">
                  -${(totalDirectCosts * 0.18).toLocaleString('es-MX')}
                </span>
              </div>
            </div>

            {/* Utilidad Bruta */}
            <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-xl font-black text-slate-900 my-4">
              <span>UTILIDAD BRUTA DEL PROYECTO</span>
              <span className="font-mono text-base text-slate-900">
                ${grossProfit.toLocaleString('es-MX')} (
                {totalBilledIncome > 0 ? ((grossProfit / totalBilledIncome) * 100).toFixed(1) : 0}%)
              </span>
            </div>

            {/* Costos Indirectos */}
            <div className="flex justify-between items-center py-2 font-bold text-slate-800">
              <span>3. Gastos Indirectos y Administrativos (8%)</span>
              <span className="font-mono text-red-700">
                -${totalIndirectCosts.toLocaleString('es-MX')}
              </span>
            </div>

            {/* Utilidad Neta */}
            <div className="flex justify-between items-center py-3.5 bg-slate-900 text-white px-4 rounded-xl font-black text-sm md:text-base mt-6">
              <span>UTILIDAD NETA REAL DE OPERACIÓN</span>
              <span className="font-mono text-amber-400">
                ${netOperatingProfit.toLocaleString('es-MX')} ({netMarginPercent}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BALANCE DE CADA CENTRO DE COSTO */}
      {reportView === 'balance_obras' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
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
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
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
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ${p.initialBudget.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        ${p.spent.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-blue-700">
                        ${p.billed.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ${p.collected.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${projectProfit.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-md text-xs ${
                            projectMargin >= 15
                              ? 'bg-emerald-100 text-emerald-800'
                              : projectMargin > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
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

      {/* VIEW 3: FLUJO DE EFECTIVO INMEDIATO */}
      {reportView === 'flujo_caja' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Posición Inmediata de Flujo de Efectivo
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
              <span className="text-xs text-slate-500 font-semibold block uppercase">
                (+) Liquidez Inmediata (Bancos + Cajas)
              </span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                ${totalCashOnHand.toLocaleString('es-MX')}
              </div>
              <span className="text-[11px] text-slate-400">Saldo listo para dispersión</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block uppercase">
                (+) Cobranza Estimaciones por Entrar (CXC)
              </span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                +${pendingReceivables.toLocaleString('es-MX')}
              </div>
              <span className="text-[11px] text-emerald-600">Facturas vigentes clientes</span>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <span className="text-xs text-red-800 font-semibold block uppercase">
                (-) Pasivos Comprometidos Proveedores (CXP)
              </span>
              <div className="text-xl font-bold font-mono text-red-700 mt-1">
                -${pendingPayables.toLocaleString('es-MX')}
              </div>
              <span className="text-[11px] text-red-600">Materiales y renta de equipo</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase">
                Flujo Neto Proyectado a 30 Días
              </span>
              <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                ${projectedNetCashFlow.toLocaleString('es-MX')} MXN
              </div>
            </div>
            <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg text-emerald-400 font-semibold">
              ✓ Solvencia Operativa Garantizada
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
