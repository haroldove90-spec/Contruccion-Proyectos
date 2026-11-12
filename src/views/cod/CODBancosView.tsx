import React, { useMemo, useState } from 'react';
import { useCOD } from '../../context/CODContext';
import {
  Landmark,
  Banknote,
  PlusCircle,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Edit3,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CODBancosView: React.FC = () => {
  const {
    companies,
    accounts,
    incomes,
    expenses,
    selectedCompanyFilter,
    addAccount,
    updateAccountInitialBalance,
  } = useCOD();

  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);

  // New account form
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'banco' | 'efectivo'>('banco');
  const [newAccCompanyId, setNewAccCompanyId] = useState(companies[0].id);
  const [newAccInitial, setNewAccInitial] = useState('0');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Inline edit initial balance
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingBalanceVal, setEditingBalanceVal] = useState<string>('');

  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (a) => selectedCompanyFilter === 'ALL' || a.companyId === selectedCompanyFilter
    );
  }, [accounts, selectedCompanyFilter]);

  const totals = useMemo(() => {
    return filteredAccounts.reduce(
      (acc, item) => ({
        initialBalance: acc.initialBalance + item.initialBalance,
        totalIncomes: acc.totalIncomes + item.totalIncomes,
        totalExpenses: acc.totalExpenses + item.totalExpenses,
        currentBalance: acc.currentBalance + item.currentBalance,
      }),
      { initialBalance: 0, totalIncomes: 0, totalExpenses: 0, currentBalance: 0 }
    );
  }, [filteredAccounts]);

  // Unified real-time ledger combining Incomes (+) and Expenses (-)
  const ledgerMovements = useMemo(() => {
    const incRows = incomes.map((i) => ({
      id: i.id,
      date: i.date,
      kind: 'ingreso' as const,
      concept: i.concept,
      companyId: i.companyId,
      companyName: i.companyName,
      accountId: i.accountId,
      accountName: i.accountName,
      extra: i.projectName ? `Obra: ${i.projectName}` : 'Cobro directo',
      amount: i.total,
      timestamp: i.timestamp,
    }));

    const expRows = expenses.map((e) => ({
      id: e.id,
      date: e.date,
      kind: 'egreso' as const,
      concept: e.concept,
      companyId: e.companyId,
      companyName: e.companyName,
      accountId: e.accountId,
      accountName: e.accountName,
      extra: `Obra: ${e.projectName} · ${e.capturedVia}`,
      amount: e.total,
      timestamp: e.timestamp,
    }));

    return [...incRows, ...expRows]
      .filter((m) => {
        const matchCo =
          selectedCompanyFilter === 'ALL' || m.companyId === selectedCompanyFilter;
        const matchAcc =
          selectedAccountId === 'ALL' || m.accountId === selectedAccountId;
        return matchCo && matchAcc;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.timestamp - a.timestamp);
  }, [incomes, expenses, selectedCompanyFilter, selectedAccountId]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    const initialNum = parseFloat(newAccInitial);
    const created = addAccount({
      name: newAccName,
      type: newAccType,
      companyId: newAccCompanyId,
      initialBalance: Number.isFinite(initialNum) ? initialNum : 0,
    });
    setFeedback(
      `Cuenta "${created.name}" (${created.type === 'banco' ? 'Banco' : 'Efectivo'}) dada de alta con Saldo Inicial $${fmt(created.initialBalance)}.`
    );
    setNewAccName('');
    setNewAccInitial('0');
    setShowNewAccountForm(false);
  };

  const handleSaveInitialBalance = (accId: string) => {
    const parsed = parseFloat(editingBalanceVal);
    if (Number.isFinite(parsed) && parsed >= 0) {
      updateAccountInitialBalance(accId, parsed);
    }
    setEditingAccountId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Control Bancario y Efectivo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Saldos actualizados automáticamente en tiempo real: Saldo Inicial + Total Ingresos (+) − Total Egresos (−)
          </p>
        </div>

        <button
          onClick={() => setShowNewAccountForm(!showNewAccountForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer self-start"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>{showNewAccountForm ? 'Cerrar Formulario' : '+ Nueva Cuenta / Caja Efectivo'}</span>
        </button>
      </div>

      {/* Add New Bank / Cash Account Form */}
      {showNewAccountForm && (
        <form
          onSubmit={handleCreateAccount}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4"
        >
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2.5">
            Alta de Cuenta Bancaria o Caja de Efectivo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de Cuenta / Banco *
              </label>
              <input
                type="text"
                required
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                placeholder="Ej. BBVA Empresarial o Caja Obra"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo *</label>
              <select
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value as 'banco' | 'efectivo')}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
              >
                <option value="banco">Cuenta Bancaria</option>
                <option value="efectivo">Efectivo / Caja Chica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                S.A. Asociada *
              </label>
              <select
                value={newAccCompanyId}
                onChange={(e) => setNewAccCompanyId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Saldo Inicial (MXN) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={newAccInitial}
                onChange={(e) => setNewAccInitial(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Guardar Cuenta en Control Bancario
            </button>
          </div>
        </form>
      )}

      {feedback && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Reconciliation Table (Matching Screenshot 4 Columns + Saldo Actual) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
          <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wide">
            CONTROL Y CONCILIACIÓN DE CUENTAS BANCARIAS Y EFECTIVO
          </h2>
          <span className="text-[11px] text-slate-500">
            Haz clic en una fila para filtrar su historial de movimientos abajo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B2545] text-white">
                <th className="py-3 px-4 text-left font-bold min-w-[170px]">Cuenta / Banco</th>
                <th className="py-3 px-3 text-center font-bold whitespace-nowrap">Tipo</th>
                <th className="py-3 px-4 text-left font-bold min-w-[160px]">S.A. Asociada</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">Saldo Inicial</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">Total Ingresos (+)</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">Total Egresos (−)</th>
                <th className="py-3 px-4 text-right font-black bg-[#061830] text-amber-300 whitespace-nowrap">
                  Saldo Actual
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAccounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                const isEditing = editingAccountId === acc.id;

                return (
                  <tr
                    key={acc.id}
                    onClick={() =>
                      setSelectedAccountId((prev) => (prev === acc.id ? 'ALL' : acc.id))
                    }
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {acc.type === 'banco' ? (
                          <Landmark className="w-4 h-4 text-[#0B2545] shrink-0" />
                        ) : (
                          <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                        )}
                        <span>{acc.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          acc.type === 'banco'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {acc.type === 'banco' ? 'Banco' : 'Efectivo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{acc.companyName}</td>
                    <td
                      className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingBalanceVal}
                            onChange={(e) => setEditingBalanceVal(e.target.value)}
                            className="w-28 px-2 py-1 text-xs text-right font-mono border border-amber-500 rounded bg-white"
                          />
                          <button
                            onClick={() => handleSaveInitialBalance(acc.id)}
                            className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded cursor-pointer"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <span>${fmt(acc.initialBalance)}</span>
                          <button
                            onClick={() => {
                              setEditingAccountId(acc.id);
                              setEditingBalanceVal(String(acc.initialBalance));
                            }}
                            title="Editar saldo inicial"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      +${fmt(acc.totalIncomes)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-rose-700">
                      −${fmt(acc.totalExpenses)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-black text-[#0B2545] bg-slate-50/70">
                      ${fmt(acc.currentBalance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900">
                <td colSpan={3} className="py-3.5 px-4 text-right uppercase text-[11px]">
                  Consolidado Bancos y Efectivo ({filteredAccounts.length} cuentas)
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                  ${fmt(totals.initialBalance)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-800">
                  +${fmt(totals.totalIncomes)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-rose-800">
                  −${fmt(totals.totalExpenses)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#0B2545] bg-amber-100/70">
                  ${fmt(totals.currentBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Real-time Synchronized Movements Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Movimientos Sincronizados en Tiempo Real
            </h3>
            <p className="text-[11px] text-slate-500">
              {selectedAccountId === 'ALL'
                ? 'Mostrando todas las cuentas bancarias y de efectivo'
                : `Filtrado por: ${accounts.find((a) => a.id === selectedAccountId)?.name}`}
            </p>
          </div>
          {selectedAccountId !== 'ALL' && (
            <button
              onClick={() => setSelectedAccountId('ALL')}
              className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
            >
              Mostrar todas las cuentas
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {ledgerMovements.map((mov) => (
            <div key={`${mov.kind}-${mov.id}`} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    mov.kind === 'ingreso'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {mov.kind === 'ingreso' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{mov.concept}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {mov.date} · {mov.accountName} · {mov.companyName} · {mov.extra}
                  </div>
                </div>
              </div>

              <div
                className={`text-sm font-mono tabular-nums font-black shrink-0 ${
                  mov.kind === 'ingreso' ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {mov.kind === 'ingreso' ? '+' : '−'}${fmt(mov.amount)}
              </div>
            </div>
          ))}
          {ledgerMovements.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No hay movimientos en esta cuenta.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
