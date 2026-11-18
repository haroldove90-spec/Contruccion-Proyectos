import React, { useMemo, useState } from 'react';
import { useCOD, CDOLoanCredit } from '../../context/CODContext';
import {
  AdvancedFilterBar,
  AdvancedFilterState,
  INITIAL_ADVANCED_FILTER,
  matchesAdvancedFilter,
} from '../../components/AdvancedFilterBar';
import {
  CreditCard,
  HandCoins,
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  DollarSign,
  Building2,
  HardHat,
  Users,
  Download,
  Landmark,
  X,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const CODPrestamosView: React.FC = () => {
  const {
    currentUser,
    companies,
    clients,
    costCenters,
    accounts,
    loansCredits,
    selectedCompanyFilter,
    addLoanCredit,
    registerLoanPayment,
    approveLoanDirect,
    rejectLoanDirect,
    deleteLoanCredit,
  } = useCOD();

  const isAdmin = currentUser?.role === 'admin';

  // Form state
  const [kind, setKind] = useState<'prestamo' | 'credito_bancario'>('prestamo');
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [originalAmount, setOriginalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Payment inline drawer
  const [payingLoanId, setPayingLoanId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDeductAccountId, setPaymentDeductAccountId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Filters
  const [kindFilter, setKindFilter] = useState<'ALL' | 'prestamo' | 'credito_bancario'>('ALL');
  const [filter, setFilter] = useState<AdvancedFilterState>(INITIAL_ADVANCED_FILTER);

  const handleProjectChange = (newProjId: string) => {
    setProjectId(newProjId);
    const proj = costCenters.find((p) => p.id === newProjId);
    if (proj?.clientId) setClientId(proj.clientId);
    if (proj?.companyId) setCompanyId(proj.companyId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(originalAmount);
    if (!title.trim() || !institution.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const created = addLoanCredit({
      kind,
      title,
      institution,
      cardLast4: kind === 'credito_bancario' ? cardLast4 : undefined,
      date,
      dueDate: dueDate || undefined,
      companyId: companyId || companies[0]?.id || '',
      clientId: clientId || undefined,
      projectId: projectId || undefined,
      accountId: accountId || undefined,
      originalAmount: parsedAmount,
      notes: notes || undefined,
    });

    setFeedback(
      isAdmin
        ? `${created.kind === 'prestamo' ? 'Préstamo' : 'Crédito / Tarjeta Bancaria'} "${created.title}" registrado por $${fmt(created.originalAmount)}.`
        : `Solicitud de ${created.kind === 'prestamo' ? 'Préstamo' : 'Crédito Bancario'} "${created.title}" enviada al Admin para su autorización.`
    );
    setTitle('');
    setInstitution('');
    setCardLast4('');
    setOriginalAmount('');
    setNotes('');
    setDueDate('');
  };

  const handleConfirmPayment = (loan: CDOLoanCredit) => {
    const val = parseFloat(paymentAmount);
    if (!Number.isFinite(val) || val <= 0) return;

    registerLoanPayment(loan.id, val, {
      deductFromAccountId: paymentDeductAccountId || undefined,
      date: new Date().toISOString().split('T')[0],
      notes: paymentNotes || undefined,
    });

    setFeedback(
      paymentDeductAccountId && !isAdmin
        ? `Solicitud de abono de $${fmt(val)} enviada al Admin para autorizar retiro bancario.`
        : `Abono de $${fmt(val)} registrado en "${loan.title}".`
    );
    setPayingLoanId(null);
    setPaymentAmount('');
    setPaymentDeductAccountId('');
    setPaymentNotes('');
  };

  const filteredLoans = useMemo(() => {
    return loansCredits.filter((item) => {
      if (selectedCompanyFilter !== 'ALL' && item.companyId !== selectedCompanyFilter) {
        return false;
      }
      if (kindFilter !== 'ALL' && item.kind !== kindFilter) {
        return false;
      }
      const searchableText = [
        item.title,
        item.institution,
        item.cardLast4 || '',
        item.companyName,
        item.clientName || '',
        item.projectName || '',
        item.accountName || '',
        item.notes || '',
        item.status,
      ].join(' ');

      return matchesAdvancedFilter(
        {
          date: item.date,
          projectId: item.projectId,
          clientId: item.clientId,
          amount: item.remainingAmount > 0 ? item.remainingAmount : item.originalAmount,
          searchableText,
        },
        filter
      );
    });
  }, [loansCredits, selectedCompanyFilter, kindFilter, filter]);

  const summary = useMemo(() => {
    const activeItems = loansCredits.filter(
      (l) =>
        (selectedCompanyFilter === 'ALL' || l.companyId === selectedCompanyFilter) &&
        l.status !== 'rechazado'
    );
    const loansDebt = activeItems
      .filter((l) => l.kind === 'prestamo' && l.status !== 'pendiente_autorizacion')
      .reduce((s, l) => s + l.remainingAmount, 0);
    const cardsDebt = activeItems
      .filter((l) => l.kind === 'credito_bancario' && l.status !== 'pendiente_autorizacion')
      .reduce((s, l) => s + l.remainingAmount, 0);
    const totalPaid = activeItems
      .filter((l) => l.status !== 'pendiente_autorizacion')
      .reduce((s, l) => s + l.paidAmount, 0);
    const pendingCount = activeItems.filter((l) => l.status === 'pendiente_autorizacion').length;

    return {
      loansDebt,
      cardsDebt,
      totalDebt: loansDebt + cardsDebt,
      totalPaid,
      pendingCount,
    };
  }, [loansCredits, selectedCompanyFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Tipo',
      'Concepto',
      'Banco / Institución',
      'Tarjeta',
      'Fecha',
      'Vencimiento',
      'S.A.',
      'Cliente',
      'Proyecto',
      'Monto Original',
      'Abonado',
      'Saldo Pendiente',
      'Estatus',
    ];
    const rows = filteredLoans.map((r) => [
      r.kind === 'prestamo' ? 'Préstamo' : 'Crédito / Tarjeta',
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.institution.replace(/"/g, '""')}"`,
      r.cardLast4 ? `*${r.cardLast4}` : '',
      r.date,
      r.dueDate || '',
      `"${r.companyName}"`,
      `"${r.clientName || ''}"`,
      `"${r.projectName || ''}"`,
      r.originalAmount.toFixed(2),
      r.paidAmount.toFixed(2),
      r.remainingAmount.toFixed(2),
      r.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CDO_Prestamos_Tarjetas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Préstamos y Tarjetas Bancarias
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de préstamos y créditos bancarios por Cliente o Proyecto · Sincronizado automáticamente con Egresos
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>SALDO TOTAL ADEUDADO</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono tabular-nums">
            ${fmt(summary.totalDebt)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Préstamos + Créditos vigentes por liquidar
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>PRÉSTAMOS PENDIENTES</span>
            <HandCoins className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono tabular-nums">
            ${fmt(summary.loansDebt)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Saldo pendiente en préstamos por obra/cliente
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TARJETAS Y CRÉDITOS BANCARIOS</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-700 font-mono tabular-nums">
            ${fmt(summary.cardsDebt)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Saldo dispuesto pendiente de pago
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TOTAL ABONADO / PAGADO</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 font-mono tabular-nums">
            ${fmt(summary.totalPaid)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {summary.pendingCount > 0
              ? `${summary.pendingCount} solicitud(es) por autorizar`
              : 'Pagos aplicados a capital y tarjetas'}
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-[#0B2545]" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Registrar Préstamo o Tarjeta / Crédito Bancario
            </h2>
          </div>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setKind('prestamo')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold cursor-pointer ${
                kind === 'prestamo'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HandCoins className="w-3.5 h-3.5" />
              <span>Préstamo</span>
            </button>
            <button
              type="button"
              onClick={() => setKind('credito_bancario')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold cursor-pointer ${
                kind === 'credito_bancario'
                  ? 'bg-indigo-700 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tarjeta / Crédito Bancario</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {kind === 'prestamo' ? 'Concepto del Préstamo *' : 'Nombre de Tarjeta o Crédito Bancario *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                kind === 'prestamo'
                  ? 'Ej. Préstamo Liquidez Obra Juárez 150'
                  : 'Ej. Tarjeta Empresarial Banorte / Crédito Puente'
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Banco / Acreedor *
            </label>
            <input
              type="text"
              required
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Ej. Banorte / Banregio / Financiera"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
            />
          </div>

          {kind === 'credito_bancario' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Últimos 4 dígitos Tarjeta
              </label>
              <input
                type="text"
                maxLength={4}
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej. 4421"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha de Solicitud *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
          )}

          {kind === 'credito_bancario' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fecha de Disposición *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <HardHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Proyecto / Obra Asociada</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="">-- General / Sin obra --</option>
              {costCenters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Cliente Asociado</span>
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="">-- Sin cliente específico --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>S.A. Responsable *</span>
            </label>
            <select
              required
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
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
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <Landmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Cuenta Bancaria Vinculada</span>
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 cursor-pointer"
            >
              <option value="">-- Sin cuenta vinculada --</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Monto Total Solicitado (MXN) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={originalAmount}
              onChange={(e) => setOriginalAmount(e.target.value)}
              placeholder="Ej. 50000"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border-2 border-amber-400 rounded-xl focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fecha Límite / Vencimiento
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className={kind === 'credito_bancario' ? 'lg:col-span-2' : 'lg:col-span-1'}>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notas / Condiciones</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tasa, plazo o referencia..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500"
            />
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
              {isAdmin
                ? 'También puedes registrar préstamos y créditos bancarios directo desde Egresos para sincronización automática.'
                : 'Al enviar, el Admin recibirá una notificación automática para autorizar esta solicitud.'}
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>
              {isAdmin
                ? kind === 'prestamo'
                  ? 'Registrar Préstamo'
                  : 'Registrar Tarjeta / Crédito'
                : 'Enviar Solicitud al Admin'}
            </span>
          </button>
        </div>
      </form>

      {/* Loans & Credit Cards Table with Advanced Multi-Criteria Search */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wide">
              CONTROL DE PRÉSTAMOS Y CRÉDITOS ({filteredLoans.length})
            </h2>
            <div className="inline-flex bg-white border border-slate-200 rounded-lg p-0.5 text-[11px]">
              {(
                [
                  { id: 'ALL', label: 'Todos' },
                  { id: 'prestamo', label: 'Préstamos' },
                  { id: 'credito_bancario', label: 'Tarjetas / Créditos' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setKindFilter(t.id)}
                  className={`px-2.5 py-1 rounded-md font-bold cursor-pointer ${
                    kindFilter === t.id
                      ? 'bg-[#0B2545] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer self-start"
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
          placeholder="Buscar banco, tarjeta, concepto, cliente..."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B2545] text-white">
                <th className="py-3 px-3 text-left font-bold">Tipo</th>
                <th className="py-3 px-3 text-left font-bold min-w-[190px]">Concepto / Banco</th>
                <th className="py-3 px-3 text-left font-bold whitespace-nowrap">Fecha</th>
                <th className="py-3 px-3 text-left font-bold min-w-[160px]">Proyecto / Cliente</th>
                <th className="py-3 px-3 text-left font-bold">S.A. / Cuenta</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Original</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Abonado</th>
                <th className="py-3 px-3 text-right font-black bg-[#061830] text-amber-300 whitespace-nowrap">
                  Saldo Pendiente
                </th>
                <th className="py-3 px-3 text-center font-bold">Estatus</th>
                <th className="py-3 px-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLoans.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.kind === 'prestamo'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {row.kind === 'prestamo' ? (
                          <HandCoins className="w-3 h-3" />
                        ) : (
                          <CreditCard className="w-3 h-3" />
                        )}
                        {row.kind === 'prestamo' ? 'Préstamo' : 'Tarjeta / Crédito'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{row.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {row.institution}
                        {row.cardLast4 ? ` · Tarjeta *${row.cardLast4}` : ''}
                        {row.sourceExpenseId ? ' · Sincronizado desde Egresos' : ''}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      <div>{row.date}</div>
                      {row.dueDate && (
                        <div className="text-[10px] text-slate-400">Vence: {row.dueDate}</div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-amber-800">
                        {row.projectName || 'General'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {row.clientName || 'Sin cliente asignado'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{row.companyName}</div>
                      <div className="text-[11px] text-slate-500">{row.accountName || '—'}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                      ${fmt(row.originalAmount)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                      ${fmt(row.paidAmount)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-black text-[#0B2545] bg-slate-50/70">
                      ${fmt(row.remainingAmount)}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {row.status === 'activo' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          Vigente
                        </span>
                      )}
                      {row.status === 'liquidado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Liquidado
                        </span>
                      )}
                      {row.status === 'pendiente_autorizacion' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          Por Autorizar
                        </span>
                      )}
                      {row.status === 'rechazado' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          Rechazado
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {row.status === 'pendiente_autorizacion' && isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveLoanDirect(row.id)}
                              title="Autorizar solicitud"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Autorizar
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectLoanDirect(row.id)}
                              title="Rechazar solicitud"
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </>
                        )}

                        {row.status === 'activo' && row.remainingAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPayingLoanId(payingLoanId === row.id ? null : row.id);
                              setPaymentAmount(String(row.remainingAmount));
                              setPaymentDeductAccountId(row.accountId || '');
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            + Abonar
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => deleteLoanCredit(row.id)}
                            title="Eliminar registro"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {payingLoanId === row.id && (
                    <tr className="bg-amber-50/70">
                      <td colSpan={10} className="px-4 py-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">
                              Monto del Abono (Pendiente: ${fmt(row.remainingAmount)})
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="w-36 px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-amber-400 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">
                              Descontar de Cuenta Bancaria (Opcional)
                            </label>
                            <select
                              value={paymentDeductAccountId}
                              onChange={(e) => setPaymentDeductAccountId(e.target.value)}
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg cursor-pointer"
                            >
                              <option value="">-- Solo registrar abono sin descontar banco --</option>
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name} (Saldo ${fmt(a.currentBalance)})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1 min-w-[180px]">
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">
                              Nota / Referencia
                            </label>
                            <input
                              type="text"
                              value={paymentNotes}
                              onChange={(e) => setPaymentNotes(e.target.value)}
                              placeholder="Ej. Parcialidad 2 / Pago mensual tarjeta"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(row)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Aplicar Abono
                            </button>
                            <button
                              type="button"
                              onClick={() => setPayingLoanId(null)}
                              className="p-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No se encontraron préstamos o créditos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
