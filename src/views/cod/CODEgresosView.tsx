import React, { useMemo, useState } from 'react';
import { useCOD } from '../../context/CODContext';
import {
  PlusCircle,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Search,
  Building2,
  Landmark,
  HardHat,
  Receipt,
  Sparkles,
  Plus,
} from 'lucide-react';

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface OCRTicketPreset {
  id: string;
  label: string;
  provider: string;
  folio: string;
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
    folio: 'TKT-8814',
    rawText: '40 bultos cemento gris + malla electrosoldada · Obra Juárez 150',
    totalWithIva: 18560,
    suggestedObraId: 'obra-juarez',
    suggestedCompanyId: 'sa-1',
  },
  {
    id: 'ocr-2',
    label: 'Renta Maquinaria',
    provider: 'Maquinaria Pesada del Centro · Factura #3092',
    folio: 'FAC-3092',
    rawText: 'Renta retroexcavadora 3 días · Corporativo Reforma',
    totalWithIva: 27840,
    suggestedObraId: 'obra-corp',
    suggestedCompanyId: 'sa-2',
  },
  {
    id: 'ocr-3',
    label: 'Herrajes y Pintura',
    provider: 'Comex / Herrajes Técnicos · Nota #1209',
    folio: 'NOT-1209',
    rawText: 'Sellador poliuretano y pintura electrostática · Mobiliario Especial',
    totalWithIva: 11600,
    suggestedObraId: 'obra-mob',
    suggestedCompanyId: 'sa-3',
  },
];

export const CODEgresosView: React.FC = () => {
  const {
    companies,
    costCenters,
    accounts,
    expenses,
    selectedCompanyFilter,
    addExpense,
    deleteExpense,
    addCostCenter,
  } = useCOD();

  const [captureMode, setCaptureMode] = useState<'Manual' | 'WhatsApp OCR'>('Manual');
  const [concept, setConcept] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState(costCenters[0]?.id || '');
  const [companyId, setCompanyId] = useState(companies[0].id);
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [amountInput, setAmountInput] = useState('');
  const [amountInputType, setAmountInputType] = useState<'sin_iva' | 'con_iva'>('sin_iva');

  // WhatsApp OCR simulator state
  const [selectedPresetId, setSelectedPresetId] = useState<string>(OCR_PRESETS[0].id);
  const [whatsappRawText, setWhatsappRawText] = useState('');

  // Quick new cost center inline
  const [showNewObra, setShowNewObra] = useState(false);
  const [newObraName, setNewObraName] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const handleLoadOCRPreset = (preset: OCRTicketPreset) => {
    setSelectedPresetId(preset.id);
    setConcept(preset.provider);
    setAmountInputType('con_iva');
    setAmountInput(String(preset.totalWithIva));
    setWhatsappRawText(preset.rawText);
    if (costCenters.some((o) => o.id === preset.suggestedObraId)) {
      setProjectId(preset.suggestedObraId);
    }
    setCompanyId(preset.suggestedCompanyId);
    const matchingAcc = accounts.find((a) => a.companyId === preset.suggestedCompanyId);
    if (matchingAcc) setAccountId(matchingAcc.id);
  };

  const handleSimulateCustomWhatsApp = () => {
    const text = whatsappRawText.trim();
    if (!text) return;
    // Extract first number found in text if present
    const numMatch = text.replace(/,/g, '').match(/(\d+(?:\.\d{1,2})?)/);
    if (numMatch) {
      setAmountInputType('con_iva');
      setAmountInput(numMatch[1]);
    }
    setConcept(`Ticket WhatsApp OCR · ${text.slice(0, 48)}`);
  };

  const handleCreateObra = () => {
    if (!newObraName.trim()) return;
    const created = addCostCenter(newObraName, companyId);
    setProjectId(created.id);
    setNewObraName('');
    setShowNewObra(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !projectId || !companyId || !accountId || subtotal <= 0) return;

    const created = addExpense({
      concept,
      date,
      projectId,
      companyId,
      accountId,
      subtotal,
      capturedVia: captureMode,
    });

    setFeedback(
      `Egreso #${created.movNumber} (${created.capturedVia}) aplicado: -$${fmt(created.total)} c/IVA descontado de ${created.accountName} · Obra: ${created.projectName} (${created.companyName}).`
    );
    setConcept('');
    setAmountInput('');
    setWhatsappRawText('');
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesCo =
        selectedCompanyFilter === 'ALL' || item.companyId === selectedCompanyFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.concept.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.accountName.toLowerCase().includes(q);
      return matchesCo && matchesSearch;
    });
  }, [expenses, selectedCompanyFilter, searchTerm]);

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Módulo de Egresos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cada gasto o compra (incluyendo WhatsApp OCR) se vincula obligatoriamente a una Obra, una S.A. Pagadora y una Cuenta de Origen
          </p>
        </div>

        {/* Mode Switcher: Manual vs WhatsApp OCR */}
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
              if (!concept) handleLoadOCRPreset(OCR_PRESETS[0]);
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

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {captureMode === 'WhatsApp OCR' ? (
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            ) : (
              <PlusCircle className="w-4 h-4 text-rose-600" />
            )}
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              {captureMode === 'WhatsApp OCR'
                ? 'Simulador WhatsApp OCR → Egreso Sincronizado'
                : 'Registrar Nuevo Egreso / Compra'}
            </h2>
          </div>
          <span className="text-[11px] font-mono font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
            Vínculo Obligatorio: Obra + S.A. + Cuenta
          </span>
        </div>

        {/* WhatsApp OCR Simulator Drawer when active */}
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
                placeholder="Simular mensaje WhatsApp de residente: Ej. Ticket ferretería cemento $14,500..."
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

        {/* Mandatory 3-Link Fields + Concept + Amount */}
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
              placeholder="Ej. Concreto Premezclado · Cemex"
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
            <div className="flex items-center justify-between mb-1">
              <label className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                <span>1. Obra (Centro de Costos) *</span>
              </label>
              <button
                type="button"
                onClick={() => setShowNewObra(!showNewObra)}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Nueva Obra</span>
              </button>
            </div>
            {showNewObra ? (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newObraName}
                  onChange={(e) => setNewObraName(e.target.value)}
                  placeholder="Nombre de la obra..."
                  className="flex-1 px-2.5 py-2 text-xs bg-white border border-amber-400 rounded-xl focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCreateObra}
                  className="px-2.5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
                >
                  OK
                </button>
              </div>
            ) : (
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
              >
                {costCenters.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.name}
                  </option>
                ))}
              </select>
            )}
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
            <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
              <Landmark className="w-3.5 h-3.5 text-slate-500" />
              <span>3. Cuenta de Origen *</span>
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {amountInputType === 'sin_iva' ? 'Monto s/IVA (MXN) *' : 'Total Ticket c/IVA *'}
              </label>
              <button
                type="button"
                onClick={() =>
                  setAmountInputType((prev) => (prev === 'sin_iva' ? 'con_iva' : 'sin_iva'))
                }
                className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
              >
                {amountInputType === 'sin_iva' ? 'Capturar Total c/IVA' : 'Capturar s/IVA'}
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
              className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border-2 border-rose-300 rounded-xl focus:outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Automatic Breakdown */}
          <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>s/IVA:</span>
              <span className="font-mono tabular-nums">${fmt(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>IVA (16%):</span>
              <span className="font-mono tabular-nums">${fmt(iva)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-black text-amber-400 mt-0.5">
              <span>Total c/IVA:</span>
              <span className="font-mono tabular-nums">${fmt(total)}</span>
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
              Al confirmar, el Total c/IVA se descuenta en tiempo real de la Cuenta de Origen y se suma a la Obra y S.A.
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>
              {captureMode === 'WhatsApp OCR'
                ? 'Confirmar Ticket OCR y Descontar'
                : 'Registrar Egreso y Descontar de Banco'}
            </span>
          </button>
        </div>
      </form>

      {/* Centralized Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <h2 className="text-sm font-black text-[#0B2545] uppercase tracking-wide">
            REGISTRO CENTRALIZADO DE EGRESOS
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar obra, S.A., concepto..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B2545] text-white">
                <th className="py-3 px-3 text-center font-bold w-16">No. Mov</th>
                <th className="py-3 px-3 text-left font-bold min-w-[190px]">Concepto / Proveedor</th>
                <th className="py-3 px-3 text-left font-bold whitespace-nowrap">Fecha</th>
                <th className="py-3 px-3 text-left font-bold min-w-[150px]">Obra (Centro Costos)</th>
                <th className="py-3 px-3 text-left font-bold min-w-[140px]">S.A. Pagadora</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Monto s/IVA</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">IVA (16%)</th>
                <th className="py-3 px-3 text-right font-bold whitespace-nowrap">Total c/IVA</th>
                <th className="py-3 px-3 text-left font-bold min-w-[120px]">Cuenta Origen</th>
                <th className="py-3 px-3 text-center font-bold whitespace-nowrap">Vía</th>
                <th className="py-3 px-3 text-center font-bold w-14">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredExpenses.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                    {row.movNumber}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{row.concept}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 px-3 font-semibold text-amber-800">{row.projectName}</td>
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
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        row.capturedVia === 'WhatsApp OCR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {row.capturedVia}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => deleteExpense(row.id)}
                      title="Eliminar registro"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                    No hay egresos registrados con este filtro.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-black text-slate-900">
                <td colSpan={5} className="py-3 px-3 text-right uppercase text-[11px]">
                  Totales ({filteredExpenses.length} movimientos)
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
