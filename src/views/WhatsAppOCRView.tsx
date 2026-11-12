import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { WhatsAppMessage } from '../types/erp';
import {
  Send,
  CheckCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Landmark,
  FileSpreadsheet,
  Receipt,
  Camera,
  RefreshCw,
} from 'lucide-react';

interface SampleTicket {
  id: string;
  title: string;
  provider: string;
  amount: number;
  subtotal: number;
  iva: number;
  category: string;
  defaultProjectText: string;
  suggestedProjectId: string;
  suggestedAccountKey: string;
  folio: string;
}

const SAMPLE_TICKETS: SampleTicket[] = [
  {
    id: 't-1',
    title: 'Ticket Concreto Premezclado',
    provider: 'Cemex Concretos S.A. de C.V.',
    amount: 148200,
    subtotal: 127758.62,
    iva: 20441.38,
    category: 'Materiales - Concreto',
    defaultProjectText: 'Obra Juárez 150 Banorte',
    suggestedProjectId: 'proj-1',
    suggestedAccountKey: 'banorte',
    folio: 'F-99412',
  },
  {
    id: 't-2',
    title: 'Ticket Varilla y Acero',
    provider: 'Aceros y Perfiles Monterrey',
    amount: 86500,
    subtotal: 74568.97,
    iva: 11931.03,
    category: 'Materiales - Acero',
    defaultProjectText: 'Torre Reforma 420 IXE',
    suggestedProjectId: 'proj-2',
    suggestedAccountKey: 'ixe',
    folio: 'FAC-7810',
  },
  {
    id: 't-3',
    title: 'Ticket Ferretería / Herramientas',
    provider: 'Ferretería y Tlapalería del Centro',
    amount: 4850,
    subtotal: 4181.03,
    iva: 668.97,
    category: 'Herramientas Menores',
    defaultProjectText: 'Obra Juárez 150 caja chica',
    suggestedProjectId: 'proj-1',
    suggestedAccountKey: 'caja',
    folio: 'TK-84912',
  },
  {
    id: 't-4',
    title: 'Tablones y Cimbra Prefabricada',
    provider: 'Maderas Finas y Cimbras del Norte',
    amount: 38400,
    subtotal: 33103.45,
    iva: 5296.55,
    category: 'Materiales - Madera y Cimbra',
    defaultProjectText: 'Plaza Industrial Alamar Banregio',
    suggestedProjectId: 'proj-3',
    suggestedAccountKey: 'banregio',
    folio: 'CFDI-4019',
  },
];

export const WhatsAppOCRView: React.FC = () => {
  const {
    projects,
    companies,
    accounts,
    registerSingleEntryExpense,
    setActiveModule,
    lastSingleEntryImpact,
  } = useERP();

  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'm-0',
      sender: 'bot',
      text: 'Asistente ERP Proyectos Construcciones activo. Selecciona o envía la foto de un ticket indicando Obra, S.A. Pagadora y Cuenta de Origen (ej. Banorte, IXE, Banregio, Caja Chica) para ejecutar la Carga Única.',
      timestamp: '09:00',
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState<SampleTicket>(SAMPLE_TICKETS[0]);
  const [inputText, setInputText] = useState(SAMPLE_TICKETS[0].defaultProjectText);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(projects[0]?.companyId || 'EDIF');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrStep, setOcrStep] = useState<string>('');

  const companyAccounts = useMemo(
    () => accounts.filter((a) => a.companyId === selectedCompanyId),
    [accounts, selectedCompanyId]
  );
  const selectableAccounts = companyAccounts.length > 0 ? companyAccounts : accounts;

  // Sync suggested bindings when user picks a sample ticket
  const handleSelectSampleTicket = (t: SampleTicket) => {
    setSelectedTicket(t);
    setInputText(t.defaultProjectText);
    const proj = projects.find((p) => p.id === t.suggestedProjectId) || projects[0];
    if (proj) {
      setSelectedProjectId(proj.id);
      setSelectedCompanyId(proj.companyId);
      const acc =
        accounts.find(
          (a) =>
            a.companyId === proj.companyId &&
            (a.bankName.toLowerCase().includes(t.suggestedAccountKey) ||
              a.accountType === (t.suggestedAccountKey === 'caja' ? 'efectivo' : 'banco'))
        ) || accounts.find((a) => a.companyId === proj.companyId) || accounts[0];
      if (acc) setSelectedAccountId(acc.id);
    }
  };

  // Auto-detect hints from WhatsApp message text while keeping manual override accurate
  useEffect(() => {
    const lower = inputText.toLowerCase();
    const matchedProj = projects.find(
      (p) =>
        lower.includes(p.name.toLowerCase()) ||
        lower.includes(p.code.toLowerCase()) ||
        (lower.includes('juárez') && p.name.toLowerCase().includes('juárez')) ||
        (lower.includes('reforma') && p.name.toLowerCase().includes('reforma')) ||
        (lower.includes('alamar') && p.name.toLowerCase().includes('alamar'))
    );
    if (matchedProj && matchedProj.id !== selectedProjectId) {
      setSelectedProjectId(matchedProj.id);
      setSelectedCompanyId(matchedProj.companyId);
    }
  }, [inputText, projects]);

  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      setSelectedCompanyId(proj.companyId);
      const acc = accounts.find((a) => a.companyId === proj.companyId) || accounts[0];
      if (acc) setSelectedAccountId(acc.id);
    }
  };

  const handleCompanyChange = (coId: string) => {
    setSelectedCompanyId(coId);
    const acc = accounts.find((a) => a.companyId === coId) || accounts[0];
    if (acc) setSelectedAccountId(acc.id);
  };

  const handleSendTicket = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMsgId = `usr-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: WhatsAppMessage = {
      id: userMsgId,
      sender: 'user',
      text: inputText,
      timestamp: userTimestamp,
      ticketPreview: {
        title: selectedTicket.title,
        provider: selectedTicket.provider,
        folio: selectedTicket.folio,
        amount: selectedTicket.amount,
        category: selectedTicket.category,
      },
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsProcessing(true);
    setOcrStep('Analizando ticket con OCR...');

    await new Promise((resolve) => setTimeout(resolve, 500));
    setOcrStep('Validando Obra + S.A. Pagadora + Cuenta de Origen...');

    await new Promise((resolve) => setTimeout(resolve, 500));
    setOcrStep('Ejecutando Carga Única y actualizando Tesorería...');

    const targetProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
    const targetCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];
    const targetAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

    const result = registerSingleEntryExpense({
      projectId: targetProject.id,
      companyId: targetCompany.id,
      accountId: targetAccount.id,
      provider: selectedTicket.provider,
      category: selectedTicket.category,
      amount: selectedTicket.amount,
      subtotal: selectedTicket.subtotal,
      iva: selectedTicket.iva,
      date: new Date().toISOString().split('T')[0],
      paymentMethod:
        targetAccount.accountType === 'efectivo'
          ? 'efectivo'
          : targetAccount.accountType === 'tarjeta'
          ? 'tarjeta'
          : 'transferencia',
      invoiceFolio: selectedTicket.folio,
      capturedVia: 'whatsapp',
      notes: `Registrado vía WhatsApp OCR (${targetCompany.shortName}): "${inputText}"`,
    });

    await new Promise((resolve) => setTimeout(resolve, 400));

    const botMsg: WhatsAppMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `REGISTRO ÚNICO CONFIRMADO:\n\n• Obra (Centro de Costos): ${targetProject.name}\n• S.A. Pagadora: ${targetCompany.shortName} (${targetCompany.id})\n• Cuenta de Origen: ${targetAccount.bankName}\n• Proveedor: ${selectedTicket.provider}\n• Total c/IVA: $${selectedTicket.amount.toLocaleString('es-MX')} MXN (s/IVA: $${selectedTicket.subtotal.toLocaleString('es-MX')} + IVA 16%: $${selectedTicket.iva.toLocaleString('es-MX')})\n• Póliza contable: ${result.accountingSeat.seatNumber}\n\nSaldo bancario y Dashboard Resumen actualizados en tiempo real.`,
      timestamp: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      receiptData: {
        provider: selectedTicket.provider,
        amount: selectedTicket.amount,
        subtotal: selectedTicket.subtotal,
        iva: selectedTicket.iva,
        date: new Date().toISOString().split('T')[0],
        category: selectedTicket.category,
        projectName: targetProject.name,
        companyName: targetCompany.shortName,
        accountName: targetAccount.bankName,
        impacts: result.impactSummary,
      },
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsProcessing(false);
    setOcrStep('');
  };

  return (
    <div className="space-y-6">
      {/* Header del módulo */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Automatización de Egresos</span>
              <span aria-hidden="true">·</span>
              <span>Principio de Carga Única</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 text-balance">
              Integración WhatsApp & OCR de Tickets
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Captura tickets desde obra y asigna en una sola operación la Obra (Centro de Costos), S.A. Pagadora y Cuenta de Origen (Banorte, IXE, Banregio o Caja Chica).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveModule('tesoreria')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Landmark className="w-4 h-4 text-slate-500" />
              <span>Ver Saldos en Bancos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Simulador WhatsApp a la izquierda, Parámetros Carga Única + Tickets a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Simulador Interactivo de WhatsApp (Cols 1-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-[660px]">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                PC
              </div>
              <div>
                <h2 className="font-bold text-sm leading-tight">
                  Bot ERP Proyectos Construcciones
                </h2>
                <div className="text-[11px] text-emerald-300">
                  Canal WhatsApp · OCR Activo
                </div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Carga Única</span>
          </div>

          {/* Ventana de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs md:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-xs'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  {/* Ticket fiscal visual local (sin enlaces externos) */}
                  {msg.ticketPreview && (
                    <div className="mb-2.5 p-3 rounded-xl bg-slate-900/90 text-white border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono">
                        <span className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" />
                          <span>COMPROBANTE OCR</span>
                        </span>
                        <span>{msg.ticketPreview.folio}</span>
                      </div>
                      <div className="font-bold text-xs">{msg.ticketPreview.provider}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
                        <span>{msg.ticketPreview.category}</span>
                        <span className="font-mono tabular-nums font-bold text-white">
                          ${msg.ticketPreview.amount.toLocaleString('es-MX')} MXN
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {msg.receiptData && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] space-y-1.5 text-slate-700">
                      <div className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Afectación Simultánea Verificada:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1 pl-1">
                        <div className="flex items-start gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{msg.receiptData.impacts.costCenter}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{msg.receiptData.impacts.treasury}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{msg.receiptData.impacts.payables}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>{msg.receiptData.impacts.accounting}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`mt-1 text-[10px] flex items-center justify-end gap-1 ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    <span className="tabular-nums">{msg.timestamp}</span>
                    {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 max-w-xs">
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="font-medium">{ocrStep}</span>
              </div>
            )}
          </div>

          {/* Barra de Entrada / Envío de WhatsApp */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="text-[11px] text-slate-500 mb-1.5 flex items-center justify-between">
              <span>
                Ticket listo: <strong>{selectedTicket.title}</strong> (${selectedTicket.amount.toLocaleString('es-MX')} MXN)
              </span>
              <span className="text-amber-700 font-medium">Confirma Obra, S.A. y Banco a la derecha</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendTicket()}
                  placeholder='Ej: "Obra Juárez 150 Banorte"'
                  disabled={isProcessing}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={handleSendTicket}
                disabled={isProcessing || !inputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Enviar ticket y procesar Carga Única"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Panel Lateral: Selección de Ticket + Triada Obligatoria Obra/S.A./Cuenta (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Selector de Tickets Muestra */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h2 className="text-xs font-bold text-slate-800">
                1. Selecciona un Ticket de Campo
              </h2>
              <span className="text-[11px] text-slate-400">4 muestras OCR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_TICKETS.map((t) => {
                const isSelected = selectedTicket.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectSampleTicket(t)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                        {t.title}
                      </span>
                      <span className="text-xs font-mono tabular-nums font-bold text-slate-900 shrink-0">
                        ${t.amount.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {t.provider}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Folio: {t.folio} · IVA 16%
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Triada de Vinculación Obligatoria (Obra + S.A. Pagadora + Cuenta de Origen) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Vinculación Obligatoria del Egreso</span>
              </h2>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Obra (Centro de Costos)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  S.A. Pagadora
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
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
                  Cuenta de Origen (Banco / Caja)
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {selectableAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} (Saldo: ${a.currentBalance.toLocaleString('es-MX')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Última Afectación en Tiempo Real */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold text-slate-900">
                  Comprobación en Módulos ERP
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Tiempo real</span>
            </div>

            {lastSingleEntryImpact && lastSingleEntryImpact.expense ? (
              <div className="mt-3 space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span>
                      {lastSingleEntryImpact.expense.projectName} · {lastSingleEntryImpact.expense.companyName}
                    </span>
                    <span className="font-mono tabular-nums text-red-700">
                      -${lastSingleEntryImpact.expense.amount.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Cuenta: {lastSingleEntryImpact.expense.accountName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Póliza: {lastSingleEntryImpact.accountingSeat.seatNumber} · Folio: {lastSingleEntryImpact.expense.invoiceFolio}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setActiveModule('tesoreria')}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>Tesorería</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={() => setActiveModule('reportes_financieros')}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-5 text-center text-xs text-slate-400">
                Envía un ticket en el chat para ver la afectación en tiempo real aquí.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
