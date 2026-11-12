import React, { useState, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import { Estimation } from '../types/erp';
import {
  TrendingUp,
  Plus,
  FileCheck2,
  CheckCircle,
  Landmark,
  X,
  Zap,
  Building2,
  ArrowDownLeft,
  Search,
} from 'lucide-react';

export const VentasEstimacionesView: React.FC = () => {
  const {
    incomes,
    estimations,
    projects,
    companies,
    accounts,
    createEstimation,
    registerSingleEntryIncome,
    activeCompanyId,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'cobros' | 'estimaciones'>('cobros');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showNewEstModal, setShowNewEstModal] = useState(false);

  // Modal state for registering an Income (Carga Única)
  const defaultCompanyId = activeCompanyId !== 'ALL' ? activeCompanyId : companies[0]?.id || 'EDIF';
  const [collectForm, setCollectForm] = useState({
    subtotalSinIva: 100000,
    companyId: defaultCompanyId,
    accountId:
      accounts.find((a) => a.companyId === defaultCompanyId && a.accountType === 'banco')?.id ||
      accounts[0]?.id ||
      '',
    projectId: projects.find((p) => p.companyId === defaultCompanyId)?.id || projects[0]?.id || '',
    estimationId: '' as string | undefined,
    client:
      projects.find((p) => p.companyId === defaultCompanyId)?.client ||
      projects[0]?.client ||
      'Cliente Corporativo',
    concept: 'Cobro de avance / factura de obra',
    invoiceNumber: `FAC-${defaultCompanyId}-${Math.floor(Math.random() * 8000 + 1000)}`,
    date: new Date().toISOString().split('T')[0],
  });

  // Form for creating an estimation
  const [estFormData, setEstFormData] = useState({
    projectId: projects[0]?.id || '',
    period: 'Quincena 2 Octubre 2026',
    advancePercent: 5.5,
    grossAmount: 950000,
  });

  // Automatic 16% IVA & Total c/IVA math
  const calculatedIva = useMemo(
    () => Number((Number(collectForm.subtotalSinIva || 0) * 0.16).toFixed(2)),
    [collectForm.subtotalSinIva]
  );
  const calculatedTotal = useMemo(
    () => Number((Number(collectForm.subtotalSinIva || 0) + calculatedIva).toFixed(2)),
    [collectForm.subtotalSinIva, calculatedIva]
  );

  // Accounts available for selected S.A. facturadora (plus option to view all if needed)
  const companyAccounts = useMemo(
    () => accounts.filter((a) => a.companyId === collectForm.companyId && a.accountType === 'banco'),
    [accounts, collectForm.companyId]
  );

  const selectableAccounts = companyAccounts.length > 0 ? companyAccounts : accounts;

  const handleCompanyChange = (newCompanyId: string) => {
    const matchingAcc = accounts.find(
      (a) => a.companyId === newCompanyId && a.accountType === 'banco'
    );
    const matchingProj = projects.find((p) => p.companyId === newCompanyId);
    setCollectForm((prev) => ({
      ...prev,
      companyId: newCompanyId,
      accountId: matchingAcc?.id || accounts[0]?.id || '',
      projectId: matchingProj?.id || prev.projectId,
      client: matchingProj?.client || prev.client,
    }));
  };

  const handleProjectChange = (newProjectId: string) => {
    const proj = projects.find((p) => p.id === newProjectId);
    if (!proj) {
      setCollectForm((prev) => ({ ...prev, projectId: '' }));
      return;
    }
    const matchingAcc = accounts.find(
      (a) => a.companyId === proj.companyId && a.accountType === 'banco'
    );
    setCollectForm((prev) => ({
      ...prev,
      projectId: proj.id,
      client: proj.client,
      companyId: proj.companyId,
      accountId: matchingAcc?.id || prev.accountId,
    }));
  };

  const openDirectCollectModal = () => {
    const coId = activeCompanyId !== 'ALL' ? activeCompanyId : companies[0]?.id || 'EDIF';
    const matchingAcc = accounts.find((a) => a.companyId === coId && a.accountType === 'banco');
    const matchingProj = projects.find((p) => p.companyId === coId) || projects[0];
    setCollectForm({
      subtotalSinIva: 150000,
      companyId: coId,
      accountId: matchingAcc?.id || accounts[0]?.id || '',
      projectId: matchingProj?.id || '',
      estimationId: undefined,
      client: matchingProj?.client || '',
      concept: matchingProj ? `Cobro de Obra - ${matchingProj.name}` : 'Cobro de servicios',
      invoiceNumber: `FAC-${coId}-${Math.floor(Math.random() * 8000 + 1000)}`,
      date: new Date().toISOString().split('T')[0],
    });
    setShowCollectModal(true);
  };

  const openEstimationCollectModal = (est: Estimation) => {
    const proj = projects.find((p) => p.id === est.projectId);
    const matchingAcc = accounts.find(
      (a) => a.companyId === est.companyId && a.accountType === 'banco'
    );
    const subtotalSugerido = Number((est.netAmount / 1.16).toFixed(2));
    setCollectForm({
      subtotalSinIva: subtotalSugerido,
      companyId: est.companyId,
      accountId: matchingAcc?.id || accounts[0]?.id || '',
      projectId: est.projectId,
      estimationId: est.id,
      client: proj?.client || 'Cliente de Obra',
      concept: `Cobro ${est.estimationNumber} - ${est.projectName}`,
      invoiceNumber: est.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
    });
    setShowCollectModal(true);
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collectForm.subtotalSinIva <= 0 || !collectForm.companyId || !collectForm.accountId) return;

    registerSingleEntryIncome({
      subtotal: Number(collectForm.subtotalSinIva),
      companyId: collectForm.companyId,
      accountId: collectForm.accountId,
      projectId: collectForm.projectId || undefined,
      estimationId: collectForm.estimationId,
      client: collectForm.client,
      concept: collectForm.concept,
      invoiceNumber: collectForm.invoiceNumber,
      date: collectForm.date,
    });

    setShowCollectModal(false);
    setActiveTab('cobros');
  };

  const handleCreateEstSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estFormData.projectId || estFormData.grossAmount <= 0) return;

    createEstimation({
      projectId: estFormData.projectId,
      period: estFormData.period,
      advancePercent: Number(estFormData.advancePercent),
      grossAmount: Number(estFormData.grossAmount),
    });

    setShowNewEstModal(false);
    setActiveTab('estimaciones');
  };

  // Filtered lists
  const filteredIncomes = incomes.filter((inc) => {
    const matchesCompany = activeCompanyId === 'ALL' || inc.companyId === activeCompanyId;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      inc.client.toLowerCase().includes(q) ||
      inc.concept.toLowerCase().includes(q) ||
      inc.invoiceNumber.toLowerCase().includes(q) ||
      inc.companyName.toLowerCase().includes(q) ||
      inc.accountName.toLowerCase().includes(q);
    return matchesCompany && matchesSearch;
  });

  const filteredEstimations = estimations.filter((e) => {
    const matchesCompany = activeCompanyId === 'ALL' || e.companyId === activeCompanyId;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      e.projectName.toLowerCase().includes(q) ||
      e.invoiceNumber.toLowerCase().includes(q) ||
      e.estimationNumber.toLowerCase().includes(q);
    return matchesCompany && matchesSearch;
  });

  const totalSubtotalIncomes = filteredIncomes.reduce((acc, i) => acc + i.subtotal, 0);
  const totalIvaIncomes = filteredIncomes.reduce((acc, i) => acc + i.iva, 0);
  const totalCollectedIncomes = filteredIncomes.reduce((acc, i) => acc + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Módulo de Ingresos</span>
              <span aria-hidden="true">·</span>
              <span>Cobros, Facturación por S.A. y Estimaciones</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 text-balance">
              Registro de Ingresos y Cobranza Bancaria
            </h1>
            <p className="text-sm text-slate-600 mt-0.5 max-w-3xl">
              Captura el Monto s/IVA; el sistema calcula automáticamente el IVA (16%) y Total c/IVA, asignando la S.A. facturadora y acreditando el depósito en la cuenta bancaria correspondiente en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowNewEstModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Nueva Estimación</span>
            </button>

            <button
              onClick={openDirectCollectModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Cobro</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Ingresos s/IVA
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-slate-900 mt-1">
              ${totalSubtotalIncomes.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">Base gravable acumulada</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              IVA Trasladado (16%)
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-slate-700 mt-1">
              ${totalIvaIncomes.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500">Cálculo automático 16%</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Total Cobrado c/IVA
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-emerald-700 mt-1">
              ${totalCollectedIncomes.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {filteredIncomes.length} depósitos en banco
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Estimaciones por Cobrar
            </span>
            <div className="text-base md:text-lg font-bold font-mono tabular-nums text-amber-700 mt-1">
              ${filteredEstimations
                .filter((e) => e.status !== 'cobrada')
                .reduce((acc, e) => acc + e.netAmount, 0)
                .toLocaleString('es-MX')}
            </div>
            <span className="text-[11px] text-slate-500">
              {filteredEstimations.filter((e) => e.status !== 'cobrada').length} pendientes de depósito
            </span>
          </div>
        </div>
      </div>

      {/* Controls: Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('cobros')}
            className={`px-3.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'cobros'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cobros Registrados ({filteredIncomes.length})
          </button>
          <button
            onClick={() => setActiveTab('estimaciones')}
            className={`px-3.5 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'estimaciones'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estimaciones de Obra ({filteredEstimations.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, S.A., banco o factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* TAB 1: COBROS REGISTRADOS (INGRESOS CON DESGLOSE FISCAL) */}
      {activeTab === 'cobros' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Libro de Ingresos Depositados en Bancos
            </h2>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Total c/IVA: ${totalCollectedIncomes.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </span>
          </div>

          {filteredIncomes.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm text-slate-600">
                No hay cobros registrados para el filtro seleccionado.
              </p>
              <button
                onClick={openDirectCollectModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primer Cobro</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Fecha / Folio</th>
                    <th className="py-3 px-4">Concepto / Cliente</th>
                    <th className="py-3 px-4">S.A. Facturadora</th>
                    <th className="py-3 px-4">Cuenta de Depósito</th>
                    <th className="py-3 px-4 text-right">Monto s/IVA</th>
                    <th className="py-3 px-4 text-right">IVA (16%)</th>
                    <th className="py-3 px-4 text-right">Total c/IVA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncomes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 tabular-nums">{inc.date}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {inc.folio} · {inc.invoiceNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{inc.concept}</div>
                        <div className="text-[11px] text-slate-500">
                          {inc.client}
                          {inc.projectName ? ` · ${inc.projectName}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{inc.companyName}</span>
                        <span className="block text-[10px] font-mono text-slate-400">
                          {inc.companyId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{inc.accountName}</div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Póliza: {inc.accountingSeatId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        ${inc.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        ${inc.iva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                        +${inc.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: ESTIMACIONES DE AVANCE */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Historial de Estimaciones Emitidas
            </h2>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {filteredEstimations.length} estimaciones
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] tracking-wider">
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
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        ${est.grossAmount.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                        -${est.retentionGuarantee.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                        ${est.netAmount.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[11px] font-bold ${
                            est.status === 'cobrada' ? 'text-emerald-700' : 'text-blue-700'
                          }`}
                        >
                          {est.status === 'cobrada' ? 'Cobrada' : 'Facturada'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {est.status !== 'cobrada' ? (
                          <button
                            onClick={() => openEstimationCollectModal(est)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Cobrar en Banco
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
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
      )}

      {/* MODAL: REGISTRAR COBRO (CARGA ÚNICA DE INGRESOS) */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Registrar Cobro / Ingreso (Carga Única)
                </h3>
              </div>
              <button
                onClick={() => setShowCollectModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="mt-4 space-y-4 text-xs md:text-sm">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Ingresa el <strong>Monto s/IVA</strong>. El sistema calculará el <strong>16% de IVA</strong> y el <strong>Total c/IVA</strong>, sumándolo automáticamente al banco de depósito elegido y al flujo de la S.A. facturadora.
                </span>
              </div>

              {/* Monto s/IVA + Desglose Automático */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Monto s/IVA ($ MXN) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={collectForm.subtotalSinIva}
                    onChange={(e) =>
                      setCollectForm({
                        ...collectForm,
                        subtotalSinIva: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900 font-bold text-base focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal s/IVA:</span>
                    <span className="font-mono tabular-nums font-semibold">
                      ${Number(collectForm.subtotalSinIva || 0).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA (16% auto):</span>
                    <span className="font-mono tabular-nums font-semibold">
                      +${calculatedIva.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
                    <span>Total c/IVA a Banco:</span>
                    <span className="font-mono tabular-nums text-emerald-700">
                      ${calculatedTotal.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* S.A. Facturadora y Cuenta de Depósito */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    S.A. Facturadora *
                  </label>
                  <select
                    required
                    value={collectForm.companyId}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
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
                    Cuenta de Depósito (Banco) *
                  </label>
                  <select
                    required
                    value={collectForm.accountId}
                    onChange={(e) => setCollectForm({ ...collectForm, accountId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  >
                    {selectableAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.bankName} (Saldo: ${a.currentBalance.toLocaleString('es-MX')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Obra y Cliente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Obra / Centro de Costos (Opcional)
                  </label>
                  <select
                    value={collectForm.projectId}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="">Ingreso general / Sin obra específica</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.companyId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    required
                    value={collectForm.client}
                    onChange={(e) => setCollectForm({ ...collectForm, client: e.target.value })}
                    placeholder="Nombre o razón social del cliente"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Concepto, Folio CFDI y Fecha */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Concepto del Cobro
                </label>
                <input
                  type="text"
                  required
                  value={collectForm.concept}
                  onChange={(e) => setCollectForm({ ...collectForm, concept: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Folio Factura (CFDI)
                  </label>
                  <input
                    type="text"
                    required
                    value={collectForm.invoiceNumber}
                    onChange={(e) =>
                      setCollectForm({ ...collectForm, invoiceNumber: e.target.value })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Fecha de Depósito
                  </label>
                  <input
                    type="date"
                    required
                    value={collectForm.date}
                    onChange={(e) => setCollectForm({ ...collectForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Confirmar Depósito en Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Generar Nueva Estimación */}
      {showNewEstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
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
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEstSubmit} className="mt-4 space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Obra a Estimar</label>
                <select
                  value={estFormData.projectId}
                  onChange={(e) => setEstFormData({ ...estFormData, projectId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.companyId} · {p.client})
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
                    value={estFormData.period}
                    onChange={(e) => setEstFormData({ ...estFormData, period: e.target.value })}
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
                    value={estFormData.advancePercent}
                    onChange={(e) =>
                      setEstFormData({ ...estFormData, advancePercent: Number(e.target.value) })
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
                  value={estFormData.grossAmount}
                  onChange={(e) =>
                    setEstFormData({ ...estFormData, grossAmount: Number(e.target.value) })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Importe Bruto:</span>
                  <span className="font-mono font-semibold tabular-nums">
                    ${estFormData.grossAmount.toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Fondo de Garantía (5%):</span>
                  <span className="font-mono tabular-nums">
                    -${(estFormData.grossAmount * 0.05).toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Neto Facturado a Cobrar:</span>
                  <span className="font-mono tabular-nums text-emerald-700">
                    ${(estFormData.grossAmount * 0.95).toLocaleString('es-MX')}
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
