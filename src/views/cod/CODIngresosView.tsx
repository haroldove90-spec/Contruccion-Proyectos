import React, { useMemo, useState } from 'react';
import { useCOD } from '../../context/CODContext';
import {
  PlusCircle,
  CheckCircle2,
  Trash2,
  Search,
  Building2,
  Landmark,
  Calculator,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CODIngresosView: React.FC = () => {
  const {
    companies,
    accounts,
    costCenters,
    incomes,
    selectedCompanyFilter,
    addIncome,
    deleteIncome,
  } = useCOD();

  const [concept, setConcept] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [companyId, setCompanyId] = useState(companies[0].id);
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [projectId, setProjectId] = useState('');
  const [subtotalInput, setSubtotalInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Automatic 16% IVA calculation
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || numericSubtotal <= 0) return;

    const created = addIncome({
      concept,
      date,
      companyId,
      subtotal: numericSubtotal,
      accountId,
      projectId: projectId || undefined,
    });

    setFeedback(
      `Movimiento #${created.movNumber} guardado: +$${fmt(created.total)} c/IVA depositado en ${created.accountName} (${created.companyName}).`
    );
    setConcept('');
    setSubtotalInput('');
    setProjectId('');
  };

  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      const matchesCo =
        selectedCompanyFilter === 'ALL' || item.companyId === selectedCompanyFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.concept.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.accountName.toLowerCase().includes(q);
      return matchesCo && matchesSearch;
    });
  }, [incomes, selectedCompanyFilter, searchTerm]);

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Módulo de Ingresos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Captura el Monto s/IVA, selecciona la S.A. Facturadora y la Cuenta de Depósito (IVA 16% y Total c/IVA automáticos)
          </p>
        </div>
      </div>

      {/* Registration Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Registrar Nuevo Cobro / Ingreso
            </h2>
          </div>
          <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            Sincroniza Bancos y Resumen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Concepto / Cliente *
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Obra / Centro de Costos (Opcional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              <option value="">-- Sin obra específica --</option>
              {costCenters.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.name}
                </option>
              ))}
            </select>
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
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <Landmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Cuenta Depósito *</span>
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type === 'banco' ? 'Banco' : 'Efectivo'}) · Saldo ${fmt(acc.currentBalance)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Monto s/IVA (MXN) *</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={subtotalInput}
              onChange={(e) => setSubtotalInput(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border-2 border-emerald-400 rounded-xl focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Automatic IVA 16% + Total c/IVA Preview */}
          <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>IVA (16%):</span>
              <span className="font-mono tabular-nums font-semibold">${fmt(calculatedIva)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-black text-amber-400 mt-0.5">
              <span>Total c/IVA:</span>
              <span className="font-mono tabular-nums text-sm">${fmt(calculatedTotal)}</span>
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
              Fórmula automática: IVA (16%) = Monto s/IVA × 0.16 · Total c/IVA = Monto s/IVA + IVA
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Ingreso y Abonar a Banco</span>
          </button>
        </div>
      </form>

      {/* Centralized Incomes Table (Matching Screenshot 2 Columns) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wide">
            REGISTRO CENTRALIZADO DE INGRESOS
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar concepto, S.A. o banco..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B2545] text-white">
                <th className="py-3 px-3 text-center font-bold w-16">No. Mov</th>
                <th className="py-3 px-3 text-left font-bold min-w-[200px]">Concepto / Cliente</th>
                <th className="py-3 px-3 text-left font-bold whitespace-nowrap">Fecha</th>
                <th className="py-3 px-3 text-left font-bold min-w-[150px]">S.A. Facturadora</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Monto s/IVA</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">IVA (16%)</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Total c/IVA</th>
                <th className="py-3 px-3 text-left font-bold min-w-[130px]">Cuenta Depósito</th>
                <th className="py-3 px-3 text-center font-bold w-14">Acción</th>
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
                    {row.projectName && (
                      <div className="text-[10px] text-slate-500 font-normal">
                        Obra: {row.projectName}
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
                    <button
                      onClick={() => deleteIncome(row.id)}
                      title="Eliminar registro"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredIncomes.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No hay ingresos registrados con este filtro.
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
