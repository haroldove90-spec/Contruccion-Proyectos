import React, { useMemo, useState } from 'react';
import {
  useCOD,
  CODExpense,
  ExpenseKind,
  ExpenseApprovalStatus,
} from '../../context/CODContext';
import {
  AdvancedFilterBar,
  AdvancedFilterState,
  INITIAL_ADVANCED_FILTER,
  matchesAdvancedFilter,
} from '../../components/AdvancedFilterBar';
import {
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Building2,
  Landmark,
  HardHat,
  Receipt,
  Sparkles,
  Plus,
  Edit3,
  Download,
  X,
  HandCoins,
  CreditCard,
  Users,
  Clock,
  XCircle,
  ShieldCheck,
  Bell,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface OCRTicketPreset {
  id: string;
  label: string;
  provider: string;
  rawText: string;
  totalWithIva: number;
  suggestedObraId: string;
  suggestedCompanyId: string;
}

const OCR_PRESETS: OCRTicketPreset[] = [
  {
    id: 'ocr-1',
    label: 'Ferretería / Cemento',
    provider: 'Materiales El Constructor SA · Ticket #8814',
    rawText: '40 bultos cemento gris + malla electrosoldada · Obra Juárez 150',
    totalWithIva: 18560,
    suggestedObraId: 'obra-juarez',
    suggestedCompanyId: 'sa-1',
  },
  {
    id: 'ocr-2',
    label: 'Renta Maquinaria',
    provider: 'Maquinaria Pesada del Centro · Factura #3092',
    rawText: 'Renta retroexcavadora 3 días · Corporativo Reforma',
    totalWithIva: 27840,
    suggestedObraId: 'obra-corp',
    suggestedCompanyId: 'sa-2',
  },
  {
    id: 'ocr-3',
    label: 'Herrajes y Pintura',
    provider: 'Comex / Herrajes Técnicos · Nota #1209',
    rawText: 'Sellador poliuretano y pintura electrostática · Mobiliario Especial',
    totalWithIva: 11600,
    suggestedObraId: 'obra-mob',
    suggestedCompanyId: 'sa-3',
  },
];

const EXPENSE_KIND_LABELS: Record<ExpenseKind, string> = {
  gasto: 'Gasto Operativo',
  prestamo: 'Préstamo',
  credito_bancario: 'Crédito / Tarjeta',
  abono_prestamo: 'Abono a Préstamo',
};

export const CODEgresosView: React.FC = () => {
  const {
    currentUser,
    companies,
    clients,
    costCenters,
    accounts,
    concepts,
    expenses,
    loansCredits,
    selectedCompanyFilter,
    addExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense,
    addClient,
    addCostCenter,
    addAccount,
    addConcept,
  } = useCOD();

  const isAdmin = currentUser?.role === 'admin';

  const expenseConcepts = useMemo(
    () => concepts.filter((c) => c.kind === 'egreso'),
    [concepts]
  );

  const activeLoansForPayment = useMemo(
    () => loansCredits.filter((l) => l.status === 'activo' && l.remainingAmount > 0),
    [loansCredits]
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<'Manual' | 'WhatsApp OCR'>('Manual');
  const [expenseKind, setExpenseKind] = useState<ExpenseKind>('gasto');
  const [concept, setConcept] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState(costCenters[0]?.id || '');
  const [clientId, setClientId] = useState(costCenters[0]?.clientId || '');
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amountInput, setAmountInput] = useState('');
  const [amountInputType, setAmountInputType] = useState<'sin_iva' | 'con_iva'>('sin_iva');

  // Conditional loan / credit fields
  const [loanInstitution, setLoanInstitution] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [linkedLoanId, setLinkedLoanId] = useState('');

  const [selectedPresetId, setSelectedPresetId] = useState<string>(OCR_PRESETS[0].id);
  const [whatsappRawText, setWhatsappRawText] = useState('');

  // Quick-add inline drawers
  const [quickAdd, setQuickAdd] = useState<'client' | 'project' | 'account' | 'concept' | null>(null);
  const [quickText, setQuickText] = useState('');
  const [quickInitialBal, setQuickInitialBal] = useState('0');

  // Advanced Filters
  const [filter, setFilter] = useState<AdvancedFilterState>(INITIAL_ADVANCED_FILTER);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExpenseApprovalStatus>('ALL');
  const [kindFilter, setKindFilter] = useState<'ALL' | ExpenseKind>('ALL');
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'pending'; text: string } | null>(null);

  const parsedAmount = useMemo(() => {
    const val = parseFloat(amountInput);
    return Number.isFinite(val) && val > 0 ? val : 0;
  }, [amountInput]);

  const subtotal = useMemo(() => {
    if (amountInputType === 'sin_iva') return Math.round((parsedAmount + Number.EPSILON) * 100) / 100;
    return Math.round(((parsedAmount / 1.16) + Number.EPSILON) * 100) / 100;
  }, [parsedAmount, amountInputType]);

  const iva = useMemo(
    () => Math.round((subtotal * 0.16 + Number.EPSILON) * 100) / 100,
    [subtotal]
  );

  const total = useMemo(
    () => Math.round((subtotal + iva + Number.EPSILON) * 100) / 100,
    [subtotal, iva]
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

  const handleLinkedLoanSelect = (loanId: string) => {
    setLinkedLoanId(loanId);
    const loan = loansCredits.find((l) => l.id === loanId);
    if (loan) {
      if (loan.projectId) setProjectId(loan.projectId);
      if (loan.clientId) setClientId(loan.clientId);
      if (loan.companyId) handleCompanyChange(loan.companyId);
      if (!concept.trim()) {
        setConcept(`Abono a ${loan.title}`);
      }
    }
  };

  const handleLoadOCRPreset = (preset: OCRTicketPreset) => {
    setSelectedPresetId(preset.id);
    setConcept(preset.provider);
    setAmountInputType('con_iva');
    setAmountInput(String(preset.totalWithIva));
    setWhatsappRawText(preset.rawText);
    if (costCenters.some((o) => o.id === preset.suggestedObraId)) {
      handleProjectChange(preset.suggestedObraId);
    }
    if (companies.some((c) => c.id === preset.suggestedCompanyId)) {
      handleCompanyChange(preset.suggestedCompanyId);
    }
  };

  const handleSimulateCustomWhatsApp = () => {
    const text = whatsappRawText.trim();
    if (!text) return;
    const numMatch = text.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
    if (numMatch) {
      setAmountInputType('con_iva');
      setAmountInput(numMatch[1]);
    }
    setConcept(`Ticket WhatsApp OCR · ${text.slice(0, 48)}`);
  };

  const handleQuickAddSave = () => {
    if (!quickText.trim()) return;
    if (quickAdd === 'client') {
      const created = addClient(quickText);
      setClientId(created.id);
    } else if (quickAdd === 'project') {
      const created = addCostCenter(
        quickText,
        companyId || companies[0]?.id || '',
        clientId || undefined
      );
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
      const created = addConcept(quickText, 'egreso');
      setConcept((prev) => (prev ? prev : created.name));
    }
    setQuickText('');
    setQuickInitialBal('0');
    setQuickAdd(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setConcept('');
    setAmountInput('');
    setWhatsappRawText('');
    setLoanInstitution('');
    setCardLast4('');
    setDueDate('');
    setLinkedLoanId('');
  };

  const handleStartEdit = (row: CODExpense) => {
    setEditingId(row.id);
    setCaptureMode(row.capturedVia);
    setExpenseKind(row.expenseKind || 'gasto');
    setConcept(row.concept);
    setDate(row.date);
    setProjectId(row.projectId);
    setClientId(row.clientId || '');
    setCompanyId(row.companyId);
    setAccountId(row.accountId);
    setAmountInputType('sin_iva');
    setAmountInput(String(row.subtotal));
    setLinkedLoanId(row.linkedLoanId || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !projectId || !companyId || !accountId || subtotal <= 0) return;

    const payload = {
      concept,
      date,
      projectId,
      clientId: clientId || undefined,
      companyId,
      accountId,
      subtotal,
      capturedVia: captureMode,
      expenseKind,
      loanInstitution:
        expenseKind === 'prestamo' || expenseKind === 'credito_bancario'
          ? loanInstitution || undefined
          : undefined,
      cardLast4: expenseKind === 'credito_bancario' ? cardLast4 || undefined : undefined,
      dueDate:
        expenseKind === 'prestamo' || expenseKind === 'credito_bancario'
          ? dueDate || undefined
          : undefined,
      linkedLoanId: expenseKind === 'abono_prestamo' ? linkedLoanId || undefined : undefined,
    };

    if (editingId) {
      updateExpense(editingId, payload);
      setFeedback({
        kind: 'success',
        text: `Egreso actualizado: Total c/IVA $${fmt(total)} recalculado en tiempo real.`,
      });
      resetForm();
    } else {
      const created = addExpense(payload);
      if (created.approvalStatus === 'pendiente') {
        setFeedback({
          kind: 'pending',
          text: `Solicitud #${created.movNumber} enviada al Admin: $${fmt(created.total)} c/IVA desde ${created.accountName} (${created.projectName}). Se reflejará en bancos al ser autorizada.`,
        });
      } else {
        const loanExtra =
          created.expenseKind === 'prestamo' || created.expenseKind === 'credito_bancario'
            ? ' · Sincronizado también en Préstamos y Tarjetas Bancarias.'
            : created.expenseKind === 'abono_prestamo'
            ? ' · Abono aplicado al saldo pendiente en Préstamos y Tarjetas.'
            : '';
        setFeedback({
          kind: 'success',
          text: `Egreso #${created.movNumber} (${created.capturedVia}) aplicado: -$${fmt(created.total)} c/IVA descontado de ${created.accountName} · Obra: ${created.projectName} (${created.companyName})${loanExtra}`,
        });
      }
      resetForm();
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      if (selectedCompanyFilter !== 'ALL' && item.companyId !== selectedCompanyFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && item.approvalStatus !== statusFilter) {
        return false;
      }
      if (kindFilter !== 'ALL' && item.expenseKind !== kindFilter) {
        return false;
      }
      const searchableText = [
        item.concept,
        item.projectName,
        item.clientName || '',
        item.companyName,
        item.accountName,
        item.capturedVia,
        EXPENSE_KIND_LABELS[item.expenseKind],
        item.approvalStatus,
        item.requestedByName || '',
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
  }, [expenses, selectedCompanyFilter, statusFilter, kindFilter, filter]);

  const totals = useMemo(() => {
    return filteredExpenses.reduce(
      (acc, e) => ({
        subtotal: acc.subtotal + e.subtotal,
        iva: acc.iva + e.iva,
        total: acc.total + e.total,
      }),
      { subtotal: 0, iva: 0, total: 0 }
    );
  }, [filteredExpenses]);

  const pendingCount = useMemo(
    () => expenses.filter((e) => e.approvalStatus === 'pendiente').length,
    [expenses]
  );

  const handleExportCSV = () => {
    const headers = [
      'No. Mov',
      'Tipo',
      'Concepto / Proveedor',
      'Fecha',
      'Obra',
      'Cliente',
      'S.A. Pagadora',
      'Monto s/IVA',
      'IVA (16%)',
      'Total c/IVA',
      'Cuenta Origen',
      'Vía',
      'Estatus',
    ];
    const rows = filteredExpenses.map((r) => [
      r.movNumber,
      `"${EXPENSE_KIND_LABELS[r.expenseKind]}"`,
      `"${r.concept.replace(/"/g, '""')}"`,
      r.date,
      `"${r.projectName.replace(/"/g, '""')}"`,
      `"${(r.clientName || '').replace(/"/g, '""')}"`,
      `"${r.companyName}"`,
      r.subtotal.toFixed(2),
      r.iva.toFixed(2),
      r.total.toFixed(2),
      `"${r.accountName}"`,
      r.capturedVia,
      r.approvalStatus,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CDO_Egresos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Módulo de Egresos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registra gastos, préstamos o créditos bancarios ligados a Obra, Cliente, S.A. y Cuenta de Origen · Con flujo de autorización
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start">
          <button
            type="button"
            onClick={() => setCaptureMode('Manual')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              captureMode === 'Manual'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Captura Manual</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCaptureMode('WhatsApp OCR');
              if (!concept && !editingId) handleLoadOCRPreset(OCR_PRESETS[0]);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              captureMode === 'WhatsApp OCR'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Simulador WhatsApp OCR</span>
          </button>
        </div>
      </div>

      {/* Role Workflow Banner */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs text-amber-900">
          <Bell className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Flujo de Autorización Activo:</strong> Al registrar un egreso, préstamo o crédito bancario, se enviará una notificación automática al <strong>Admin</strong> indicando la cuenta bancaria de origen para su autorización antes de descontar el saldo.
          </span>
        </div>
      )}

      {/* Form Card */}
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
            ) : captureMode === 'WhatsApp OCR' ? (
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <PlusCircle className="w-4 h-4 text-rose-600" />
            )}
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              {editingId
                ? 'Editando Egreso Registrado'
                : captureMode === 'WhatsApp OCR'
                ? 'Simulador WhatsApp OCR → Egreso Sincronizado'
                : 'Registrar Nuevo Egreso / Préstamo / Crédito'}
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
            <span className="text-[11px] font-mono font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
              Vínculo Obligatorio: Obra + S.A. + Cuenta
            </span>
          </div>
        </div>

        {/* Expense Classification Selector (Syncs with Préstamos y Tarjetas Bancarias) */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Clasificación del Movimiento:
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'gasto', label: 'Gasto / Compra de Obra', icon: Receipt },
                { id: 'prestamo', label: 'Préstamo (Sincroniza a Préstamos)', icon: HandCoins },
                { id: 'credito_bancario', label: 'Crédito / Tarjeta Bancaria', icon: CreditCard },
                { id: 'abono_prestamo', label: 'Abono a Préstamo / Tarjeta', icon: CheckCircle2 },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = expenseKind === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExpenseKind(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0B2545] text-white border-[#0B2545]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Concept Quick Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Conceptos rápidos:</span>
          {expenseConcepts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setConcept(c.name)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-rose-50 hover:text-rose-800 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
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
                  : 'Nuevo Concepto de Egreso:'}
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

        {/* WhatsApp OCR Simulator Drawer */}
        {captureMode === 'WhatsApp OCR' && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Selecciona un ticket recibido por WhatsApp o escribe el mensaje OCR:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {OCR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleLoadOCRPreset(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      selectedPresetId === preset.id
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {preset.label} (${fmt(preset.totalWithIva)})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={whatsappRawText}
                onChange={(e) => setWhatsappRawText(e.target.value)}
                placeholder="Simular mensaje WhatsApp: Ej. Ticket ferretería cemento $14,500..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-hidden focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={handleSimulateCustomWhatsApp}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Extraer OCR del Ticket
              </button>
            </div>
          </div>
        )}

        {/* Conditional Loan / Bank Credit Synchronization Fields */}
        {(expenseKind === 'prestamo' || expenseKind === 'credito_bancario') && (
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                Banco / Financiera / Acreedor *
              </label>
              <input
                type="text"
                value={loanInstitution}
                onChange={(e) => setLoanInstitution(e.target.value)}
                placeholder="Ej. Banorte / Financiera Regio"
                className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-300 rounded-lg focus:outline-hidden"
              />
            </div>

            {expenseKind === 'credito_bancario' && (
              <div>
                <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                  Últimos 4 dígitos de Tarjeta
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej. 4421"
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-indigo-300 rounded-lg focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                Fecha Límite / Vencimiento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-indigo-300 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {expenseKind === 'abono_prestamo' && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
            <label className="block text-[11px] font-bold text-blue-950 mb-1">
              Seleccionar Préstamo o Tarjeta a Abonar (se descontará de su saldo pendiente):
            </label>
            <select
              value={linkedLoanId}
              onChange={(e) => handleLinkedLoanSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-blue-300 rounded-lg cursor-pointer"
            >
              <option value="">-- Selecciona un préstamo o crédito vigente --</option>
              {activeLoansForPayment.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.kind === 'prestamo' ? 'Préstamo' : 'Tarjeta'}: {l.title} · Saldo pendiente: ${fmt(l.remainingAmount)} ({l.projectName || l.clientName || l.companyName})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Concepto / Proveedor *
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder={
                expenseKind === 'prestamo'
                  ? 'Ej. Préstamo para arranque Obra Juárez 150'
                  : expenseKind === 'credito_bancario'
                  ? 'Ej. Disposición Tarjeta Banorte Materiales'
                  : 'Ej. Concreto Premezclado · Cemex'
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fecha *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                <span>1. Obra / Proyecto *</span>
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
              required
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
            >
              {costCenters.length === 0 && <option value="">-- Crea un proyecto primero --</option>}
              {costCenters.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Cliente Asociado</span>
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
              <option value="">-- Sin cliente específico --</option>
              {clients.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>2. S.A. Pagadora *</span>
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
                <span>3. Cuenta de Origen *</span>
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  {amountInputType === 'sin_iva' ? 's/IVA *' : 'c/IVA *'}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setAmountInputType((prev) => (prev === 'sin_iva' ? 'con_iva' : 'sin_iva'))
                  }
                  className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  {amountInputType === 'sin_iva' ? 'Usar c/IVA' : 'Usar s/IVA'}
                </button>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full px-2.5 py-2 text-xs font-mono font-bold text-slate-900 bg-white border-2 border-rose-300 rounded-xl focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="bg-slate-900 text-white rounded-xl px-2.5 py-1.5 flex flex-col justify-center">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>IVA 16%:</span>
                <span className="font-mono tabular-nums">${fmt(iva)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-black text-amber-400 mt-0.5">
                <span>Total:</span>
                <span className="font-mono tabular-nums">${fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {feedback ? (
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${
                feedback.kind === 'pending'
                  ? 'text-amber-900 bg-amber-50 border-amber-300'
                  : 'text-emerald-800 bg-emerald-50 border-emerald-200'
              }`}
            >
              {feedback.kind === 'pending' ? (
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500">
              {isAdmin
                ? 'Como Admin, el egreso se autoriza automáticamente y actualiza Bancos y Préstamos en tiempo real.'
                : 'Al enviar, el Admin recibirá la notificación para autorizar la salida de la cuenta bancaria.'}
            </span>
          )}

          <button
            type="submit"
            disabled={!projectId}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>
              {editingId
                ? 'Guardar Cambios del Egreso'
                : !isAdmin
                ? 'Enviar Solicitud al Admin'
                : captureMode === 'WhatsApp OCR'
                ? 'Confirmar Ticket OCR y Descontar'
                : 'Registrar Egreso y Descontar de Banco'}
            </span>
          </button>
        </div>
      </form>

      {/* Centralized Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wide">
              REGISTRO CENTRALIZADO DE EGRESOS ({filteredExpenses.length})
            </h2>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold">
                <Clock className="w-3 h-3" />
                {pendingCount} pendiente(s) de autorizar
              </span>
            )}
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer shrink-0 self-start"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Multi-criteria search bar: Month, Day, Project, Client, Amount, Free text + Status & Kind */}
        <AdvancedFilterBar
          filter={filter}
          onChange={setFilter}
          projects={costCenters}
          clients={clients}
          placeholder="Buscar concepto, proveedor, S.A., banco..."
          extraSlot={
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ExpenseApprovalStatus)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                <option value="ALL">Todos los estatus</option>
                <option value="autorizado">Autorizados</option>
                <option value="pendiente">Pendientes de autorizar</option>
                <option value="rechazado">Rechazados</option>
              </select>

              <select
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value as 'ALL' | ExpenseKind)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                <option value="ALL">Todos los tipos</option>
                <option value="gasto">Gasto Operativo</option>
                <option value="prestamo">Préstamo</option>
                <option value="credito_bancario">Crédito / Tarjeta</option>
                <option value="abono_prestamo">Abono a Préstamo</option>
              </select>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B2545] text-white">
                <th className="py-3 px-3 text-center font-bold w-14">No.</th>
                <th className="py-3 px-3 text-left font-bold min-w-[200px]">Concepto / Tipo</th>
                <th className="py-3 px-3 text-left font-bold whitespace-nowrap">Fecha</th>
                <th className="py-3 px-3 text-left font-bold min-w-[150px]">Obra / Cliente</th>
                <th className="py-3 px-3 text-left font-bold min-w-[130px]">S.A. Pagadora</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Monto s/IVA</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">IVA (16%)</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Total c/IVA</th>
                <th className="py-3 px-3 text-left font-bold min-w-[120px]">Cuenta Origen</th>
                <th className="py-3 px-3 text-center font-bold whitespace-nowrap">Estatus</th>
                <th className="py-3 px-3 text-center font-bold whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredExpenses.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                    {row.movNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{row.concept}</div>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      <span
                        className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          row.expenseKind === 'prestamo'
                            ? 'bg-blue-50 text-blue-800'
                            : row.expenseKind === 'credito_bancario'
                            ? 'bg-indigo-50 text-indigo-800'
                            : row.expenseKind === 'abono_prestamo'
                            ? 'bg-teal-50 text-teal-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {EXPENSE_KIND_LABELS[row.expenseKind]}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          row.capturedVia === 'WhatsApp OCR'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-50 text-slate-500'
                        }`}
                      >
                        {row.capturedVia}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-amber-800">{row.projectName}</div>
                    {row.clientName && (
                      <div className="text-[10px] text-slate-500">{row.clientName}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{row.companyName}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                    ${fmt(row.subtotal)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    ${fmt(row.iva)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-rose-700">
                    ${fmt(row.total)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{row.accountName}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {row.approvalStatus === 'autorizado' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Autorizado
                      </span>
                    )}
                    {row.approvalStatus === 'pendiente' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Pendiente
                      </span>
                    )}
                    {row.approvalStatus === 'rechazado' && (
                      <span
                        title={row.rejectionReason || 'Rechazado'}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold"
                      >
                        <XCircle className="w-3 h-3" />
                        Rechazado
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {isAdmin && row.approvalStatus === 'pendiente' && (
                        <>
                          <button
                            type="button"
                            onClick={() => approveExpense(row.id)}
                            title="Autorizar egreso y descontar de cuenta"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Autorizar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectExpense(row.id)}
                            title="Rechazar solicitud"
                            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleStartEdit(row)}
                        title="Editar egreso"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(row.id)}
                        title="Eliminar egreso"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron egresos con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900">
                <td colSpan={5} className="py-3 px-3 text-right uppercase text-[11px]">
                  Totales filtrados ({filteredExpenses.length} movimientos)
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  ${fmt(totals.subtotal)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  ${fmt(totals.iva)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-rose-800">
                  ${fmt(totals.total)}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
