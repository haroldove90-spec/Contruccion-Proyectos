import React, { useMemo, useState } from 'react';
import { useCOD } from '../../context/CODContext';
import {
  AdvancedFilterBar,
  AdvancedFilterState,
  INITIAL_ADVANCED_FILTER,
  matchesAdvancedFilter,
} from '../../components/AdvancedFilterBar';
import {
  Landmark,
  Banknote,
  PlusCircle,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Edit3,
  Trash2,
  Check,
  X,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CODBancosView: React.FC = () => {
  const {
    companies,
    clients,
    costCenters,
    accounts,
    incomes,
    expenses,
    selectedCompanyFilter,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useCOD();

  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [ledgerFilter, setLedgerFilter] = useState<AdvancedFilterState>(INITIAL_ADVANCED_FILTER);
  const [showNewAccountForm, setShowNewAccountForm] = useState(false);

  // New account form
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccType, setNewAccType] = useState<'banco' | 'efectivo'>('banco');
  const [newAccCompanyId, setNewAccCompanyId] = useState(companies[0]?.id || '');
  const [newAccInitial, setNewAccInitial] = useState('0');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Inline edit account
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    accountNumber: '',
    type: 'banco' as 'banco' | 'efectivo',
    companyId: '',
    initialBalance: '0',
  });

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
      projectId: i.projectId,
      clientId: i.clientId,
      extra: i.projectName ? `Obra: ${i.projectName}` : i.clientName ? `Cliente: ${i.clientName}` : 'Cobro directo',
      amount: i.total,
      timestamp: i.timestamp,
    }));

    const expRows = expenses
      .filter((e) => e.approvalStatus === 'autorizado')
      .map((e) => ({
        id: e.id,
        date: e.date,
        kind: 'egreso' as const,
        concept: e.concept,
        companyId: e.companyId,
        companyName: e.companyName,
        accountId: e.accountId,
        accountName: e.accountName,
        projectId: e.projectId,
        clientId: e.clientId,
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
        if (!matchCo || !matchAcc) return false;

        return matchesAdvancedFilter(
          {
            date: m.date,
            projectId: m.projectId,
            clientId: m.clientId,
            amount: m.amount,
            searchableText: `${m.concept} ${m.accountName} ${m.companyName} ${m.extra}`,
          },
          ledgerFilter
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.timestamp - a.timestamp);
  }, [incomes, expenses, selectedCompanyFilter, selectedAccountId, ledgerFilter]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;
    const initialNum = parseFloat(newAccInitial);
    const created = addAccount({
      name: newAccName,
      accountNumber: newAccNumber,
      type: newAccType,
      companyId: newAccCompanyId || companies[0]?.id || '',
      initialBalance: Number.isFinite(initialNum) ? initialNum : 0,
    });
    setFeedback(
      `Cuenta "${created.name}" (${created.type === 'banco' ? 'Banco' : 'Efectivo'}) dada de alta con Saldo Inicial $${fmt(created.initialBalance)}.`
    );
    setNewAccName('');
    setNewAccNumber('');
    setNewAccInitial('0');
    setShowNewAccountForm(false);
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
            Administra tus 8 o más cuentas bancarias y cajas de efectivo · Saldo Actual = Saldo Inicial + Ingresos (+) − Egresos (−)
          </p>
        </div>

        <button
          onClick={() => setShowNewAccountForm(!showNewAccountForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer self-start"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>{showNewAccountForm ? 'Cerrar Formulario' : '+ Nueva Cuenta Bancaria / Efectivo'}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Banco o Cuenta *
              </label>
              <input
                type="text"
                required
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                placeholder="Ej. BBVA Cuenta 1 / Santander"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. Cuenta / CLABE
              </label>
              <input
                type="text"
                value={newAccNumber}
                onChange={(e) => setNewAccNumber(e.target.value)}
                placeholder="Ej. *9921"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
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

      {/* Main Reconciliation Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
          <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wide">
            CONTROL Y CONCILIACIÓN DE CUENTAS BANCARIAS Y EFECTIVO ({filteredAccounts.length})
          </h2>
          <span className="text-[11px] text-slate-500">
            Haz clic en una cuenta para ver sus movimientos · Puedes editar o eliminar cualquier cuenta
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B2545] text-white">
                <th className="py-3 px-4 text-left font-bold min-w-[170px]">Cuenta / Banco</th>
                <th className="py-3 px-3 text-left font-bold whitespace-nowrap">No. Cuenta</th>
                <th className="py-3 px-3 text-center font-bold whitespace-nowrap">Tipo</th>
                <th className="py-3 px-4 text-left font-bold min-w-[150px]">S.A. Asociada</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">Saldo Inicial</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">Total Ingresos (+)</th>
                <th className="py-3 px-4 text-right font-bold whitespace-nowrap">Total Egresos (−)</th>
                <th className="py-3 px-4 text-right font-black bg-[#061830] text-amber-300 whitespace-nowrap">
                  Saldo Actual
                </th>
                <th className="py-3 px-3 text-center font-bold w-20">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAccounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                const isEditing = editingAccountId === acc.id;

                return (
                  <tr
                    key={acc.id}
                    onClick={() => {
                      if (!isEditing) {
                        setSelectedAccountId((prev) => (prev === acc.id ? 'ALL' : acc.id));
                      }
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50/70' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 border border-amber-500 rounded bg-white text-xs"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {acc.type === 'banco' ? (
                            <Landmark className="w-4 h-4 text-[#0B2545] shrink-0" />
                          ) : (
                            <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                          <span>{acc.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.accountNumber}
                          onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                          className="w-24 px-2 py-1 border border-amber-500 rounded bg-white text-xs font-mono"
                        />
                      ) : (
                        acc.accountNumber || '—'
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'banco' | 'efectivo' })}
                          className="px-2 py-1 border border-amber-500 rounded bg-white text-xs"
                        >
                          <option value="banco">Banco</option>
                          <option value="efectivo">Efectivo</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            acc.type === 'banco'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {acc.type === 'banco' ? 'Banco' : 'Efectivo'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium" onClick={(e) => isEditing && e.stopPropagation()}>
                      {isEditing ? (
                        <select
                          value={editForm.companyId}
                          onChange={(e) => setEditForm({ ...editForm, companyId: e.target.value })}
                          className="w-full px-2 py-1 border border-amber-500 rounded bg-white text-xs"
                        >
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        acc.companyName
                      )}
                    </td>
                    <td
                      className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700"
                      onClick={(e) => isEditing && e.stopPropagation()}
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.initialBalance}
                          onChange={(e) => setEditForm({ ...editForm, initialBalance: e.target.value })}
                          className="w-28 px-2 py-1 text-xs text-right font-mono border border-amber-500 rounded bg-white"
                        />
                      ) : (
                        `$${fmt(acc.initialBalance)}`
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
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => {
                                const parsed = parseFloat(editForm.initialBalance);
                                updateAccount(acc.id, {
                                  name: editForm.name.trim() || acc.name,
                                  accountNumber: editForm.accountNumber.trim() || undefined,
                                  type: editForm.type,
                                  companyId: editForm.companyId,
                                  initialBalance: Number.isFinite(parsed) ? parsed : acc.initialBalance,
                                });
                                setEditingAccountId(null);
                              }}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingAccountId(null)}
                              className="p-1 text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingAccountId(acc.id);
                                setEditForm({
                                  name: acc.name,
                                  accountNumber: acc.accountNumber || '',
                                  type: acc.type,
                                  companyId: acc.companyId,
                                  initialBalance: String(acc.initialBalance),
                                });
                              }}
                              title="Editar cuenta"
                              className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteAccount(acc.id)}
                              disabled={accounts.length <= 1}
                              title="Eliminar cuenta"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900">
                <td colSpan={4} className="py-3.5 px-4 text-right uppercase text-[11px]">
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
                <td />
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

        <AdvancedFilterBar
          filter={ledgerFilter}
          onChange={setLedgerFilter}
          projects={costCenters}
          clients={clients}
          placeholder="Buscar movimiento, cuenta, obra, S.A..."
        />

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
