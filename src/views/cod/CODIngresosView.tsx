import React, { useMemo, useState } from 'react';
import { useCOD, CODIncome } from '../../context/CODContext';
import {
  AdvancedFilterBar,
  AdvancedFilterState,
  INITIAL_ADVANCED_FILTER,
  matchesAdvancedFilter,
} from '../../components/AdvancedFilterBar';
import {
  PlusCircle,
  CheckCircle2,
  Trash2,
  Building2,
  Landmark,
  Calculator,
  Users,
  HardHat,
  Edit3,
  Plus,
  Download,
  X,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CODIngresosView: React.FC = () => {
  const {
    companies,
    clients,
    accounts,
    costCenters,
    concepts,
    incomes,
    selectedCompanyFilter,
    addIncome,
    updateIncome,
    deleteIncome,
    addClient,
    addCostCenter,
    addAccount,
    addConcept,
  } = useCOD();

  const incomeConcepts = useMemo(
    () => concepts.filter((c) => c.kind === 'ingreso'),
    [concepts]
  );

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [concept, setConcept] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [subtotalInput, setSubtotalInput] = useState('');
  const [filter, setFilter] = useState<AdvancedFilterState>(INITIAL_ADVANCED_FILTER);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Quick-add inline drawers
  const [quickAdd, setQuickAdd] = useState<'client' | 'project' | 'account' | 'concept' | null>(null);
  const [quickText, setQuickText] = useState('');
  const [quickInitialBal, setQuickInitialBal] = useState('0');

  const numericSubtotal = useMemo(() => {
    const parsed = parseFloat(subtotalInput);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [subtotalInput]);

  const calculatedIva = useMemo(
    () => Math.round((numericSubtotal * 0.16 + Number.EPSILON) * 100) / 100,
    [numericSubtotal]
  );

  const calculatedTotal = useMemo(
    () => Math.round((numericSubtotal + calculatedIva + Number.EPSILON) * 100) / 100,
    [numericSubtotal, calculatedIva]
  );

  const handleCompanyChange = (newCompanyId: string) => {
    setCompanyId(newCompanyId);
    const matchingAccount = accounts.find((a) => a.companyId === newCompanyId);
    if (matchingAccount) {
      setAccountId(matchingAccount.id);
    }
  };

  const handleProjectChange = (newProjId: string) => {
    setProjectId(newProjId);
    const proj = costCenters.find((p) => p.id === newProjId);
    if (proj?.clientId) setClientId(proj.clientId);
    if (proj?.companyId) handleCompanyChange(proj.companyId);
  };

  const handleQuickAddSave = () => {
    if (!quickText.trim()) return;
    if (quickAdd === 'client') {
      const created = addClient(quickText);
      setClientId(created.id);
    } else if (quickAdd === 'project') {
      const created = addCostCenter(quickText, companyId || companies[0]?.id || '', clientId || undefined);
      setProjectId(created.id);
    } else if (quickAdd === 'account') {
      const initBal = parseFloat(quickInitialBal);
      const created = addAccount({
        name: quickText,
        type: 'banco',
        companyId: companyId || companies[0]?.id || '',
        initialBalance: Number.isFinite(initBal) ? initBal : 0,
      });
      setAccountId(created.id);
    } else if (quickAdd === 'concept') {
      const created = addConcept(quickText, 'ingreso');
      setConcept((prev) => (prev ? prev : created.name));
    }
    setQuickText('');
    setQuickInitialBal('0');
    setQuickAdd(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setConcept('');
    setSubtotalInput('');
    setProjectId('');
    setClientId('');
  };

  const handleStartEdit = (row: CODIncome) => {
    setEditingId(row.id);
    setConcept(row.concept);
    setDate(row.date);
    setCompanyId(row.companyId);
    setAccountId(row.accountId);
    setProjectId(row.projectId || '');
    setClientId(row.clientId || '');
    setSubtotalInput(String(row.subtotal));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || numericSubtotal <= 0) return;

    const payload = {
      concept,
      date,
      companyId: companyId || companies[0]?.id || '',
      subtotal: numericSubtotal,
      accountId: accountId || accounts[0]?.id || '',
      projectId: projectId || undefined,
      clientId: clientId || undefined,
    };

    if (editingId) {
      updateIncome(editingId, payload);
      setFeedback(`Ingreso actualizado con recálculo automático: Total c/IVA $${fmt(calculatedTotal)}.`);
      resetForm();
    } else {
      const created = addIncome(payload);
      setFeedback(
        `Movimiento #${created.movNumber} guardado: +$${fmt(created.total)} c/IVA depositado en ${created.accountName} (${created.companyName}).`
      );
      resetForm();
    }
  };

  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      if (selectedCompanyFilter !== 'ALL' && item.companyId !== selectedCompanyFilter) {
        return false;
      }
      const searchableText = [
        item.concept,
        item.clientName || '',
        item.projectName || '',
        item.companyName,
        item.accountName,
      ].join(' ');

      return matchesAdvancedFilter(
        {
          date: item.date,
          projectId: item.projectId,
          clientId: item.clientId,
          amount: item.total,
          searchableText,
        },
        filter
      );
    });
  }, [incomes, selectedCompanyFilter, filter]);

  const totals = useMemo(() => {
    return filteredIncomes.reduce(
      (acc, i) => ({
        subtotal: acc.subtotal + i.subtotal,
        iva: acc.iva + i.iva,
        total: acc.total + i.total,
      }),
      { subtotal: 0, iva: 0, total: 0 }
    );
  }, [filteredIncomes]);

  const handleExportCSV = () => {
    const headers = ['No. Mov', 'Concepto', 'Cliente', 'Proyecto', 'Fecha', 'S.A. Facturadora', 'Monto s/IVA', 'IVA (16%)', 'Total c/IVA', 'Cuenta Depósito'];
    const rows = filteredIncomes.map((r) => [
      r.movNumber,
      `"${r.concept.replace(/"/g, '""')}"`,
      `"${(r.clientName || '').replace(/"/g, '""')}"`,
      `"${(r.projectName || '').replace(/"/g, '""')}"`,
      r.date,
      `"${r.companyName}"`,
      r.subtotal.toFixed(2),
      r.iva.toFixed(2),
      r.total.toFixed(2),
      `"${r.accountName}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CDO_Ingresos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Módulo de Ingresos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Captura Monto s/IVA, selecciona Cliente, Proyecto, Concepto, S.A. Facturadora y Cuenta de Depósito (IVA 16% y Total c/IVA automáticos)
          </p>
        </div>
      </div>

      {/* Registration / Edit Form Card */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 ${
          editingId ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {editingId ? (
              <Edit3 className="w-4 h-4 text-amber-600" />
            ) : (
              <PlusCircle className="w-4 h-4 text-emerald-600" />
            )}
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              {editingId ? 'Editando Ingreso Registrado' : 'Registrar Nuevo Cobro / Ingreso'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar Edición</span>
              </button>
            )}
            <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Sincroniza Bancos y Resumen
            </span>
          </div>
        </div>

        {/* Concept Quick Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Conceptos rápidos:</span>
          {incomeConcepts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setConcept(c.name)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              {c.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setQuickAdd(quickAdd === 'concept' ? null : 'concept')}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Concepto</span>
          </button>
        </div>

        {/* Inline Quick-Add Drawer */}
        {quickAdd && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row items-end gap-2">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-amber-900 mb-1">
                {quickAdd === 'client'
                  ? 'Nuevo Cliente:'
                  : quickAdd === 'project'
                  ? 'Nuevo Proyecto / Obra:'
                  : quickAdd === 'account'
                  ? 'Nueva Cuenta Bancaria:'
                  : 'Nuevo Concepto de Ingreso:'}
              </label>
              <input
                type="text"
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder="Escribe el nombre..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-hidden"
              />
            </div>
            {quickAdd === 'account' && (
              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-bold text-amber-900 mb-1">Saldo Inicial:</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={quickInitialBal}
                  onChange={(e) => setQuickInitialBal(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-amber-300 rounded-lg"
                />
              </div>
            )}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleQuickAddSave}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setQuickAdd(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Concepto / Descripción *
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Estimación 2 - Obra Juárez 150"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Cliente</span>
              </label>
              <button
                type="button"
                onClick={() => setQuickAdd(quickAdd === 'client' ? null : 'client')}
                className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
              >
                + Nuevo
              </button>
            </div>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="">-- Seleccionar cliente --</option>
              {clients.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <HardHat className="w-3.5 h-3.5 text-slate-500" />
                <span>Proyecto / Obra</span>
              </label>
              <button
                type="button"
                onClick={() => setQuickAdd(quickAdd === 'project' ? null : 'project')}
                className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
              >
                + Nuevo
              </button>
            </div>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="">-- Sin proyecto específico --</option>
              {costCenters.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>S.A. Facturadora *</span>
            </label>
            <select
              required
              value={companyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Landmark className="w-3.5 h-3.5 text-slate-500" />
                <span>Cuenta Depósito *</span>
              </label>
              <button
                type="button"
                onClick={() => setQuickAdd(quickAdd === 'account' ? null : 'account')}
                className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer"
              >
                + Cuenta
              </button>
            </div>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} {acc.accountNumber ? `(${acc.accountNumber})` : ''} · Saldo ${fmt(acc.currentBalance)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monto s/IVA *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={subtotalInput}
                onChange={(e) => setSubtotalInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-2.5 py-2 text-xs font-mono font-bold text-slate-900 bg-white border-2 border-emerald-400 rounded-xl focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div className="bg-slate-900 text-white rounded-xl px-2.5 py-1.5 flex flex-col justify-center">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>IVA 16%:</span>
                <span className="font-mono tabular-nums">${fmt(calculatedIva)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-black text-amber-400 mt-0.5">
                <span>Total:</span>
                <span className="font-mono tabular-nums">${fmt(calculatedTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {feedback ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500">
              Cálculo automático: IVA (16%) = Monto s/IVA × 0.16 · Total c/IVA = Monto s/IVA + IVA
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{editingId ? 'Guardar Cambios del Ingreso' : 'Registrar Ingreso y Abonar a Banco'}</span>
          </button>
        </div>
      </form>

      {/* Centralized Incomes Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wide">
            REGISTRO CENTRALIZADO DE INGRESOS ({filteredIncomes.length})
          </h2>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer shrink-0 self-start"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        <AdvancedFilterBar
          filter={filter}
          onChange={setFilter}
          projects={costCenters}
          clients={clients}
          placeholder="Buscar concepto, cliente, proyecto, S.A., banco..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B2545] text-white">
                <th className="py-3 px-3 text-center font-bold w-16">No. Mov</th>
                <th className="py-3 px-3 text-left font-bold min-w-[200px]">Concepto / Cliente / Proyecto</th>
                <th className="py-3 px-3 text-left font-bold whitespace-nowrap">Fecha</th>
                <th className="py-3 px-3 text-left font-bold min-w-[150px]">S.A. Facturadora</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Monto s/IVA</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">IVA (16%)</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Total c/IVA</th>
                <th className="py-3 px-3 text-left font-bold min-w-[130px]">Cuenta Depósito</th>
                <th className="py-3 px-3 text-center font-bold w-20">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredIncomes.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                    {row.movNumber}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div>{row.concept}</div>
                    {(row.clientName || row.projectName) && (
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        {row.clientName ? `Cliente: ${row.clientName}` : ''}
                        {row.clientName && row.projectName ? ' · ' : ''}
                        {row.projectName ? `Proyecto: ${row.projectName}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{row.companyName}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                    ${fmt(row.subtotal)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    ${fmt(row.iva)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                    ${fmt(row.total)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{row.accountName}</td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(row)}
                        title="Editar ingreso"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteIncome(row.id)}
                        title="Eliminar ingreso"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredIncomes.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No hay ingresos registrados. Utiliza el formulario superior para capturar el primero.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900">
                <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px]">
                  Totales ({filteredIncomes.length} movimientos)
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  ${fmt(totals.subtotal)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  ${fmt(totals.iva)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-800">
                  ${fmt(totals.total)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
