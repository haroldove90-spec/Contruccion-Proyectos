import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { WhatsAppMessage } from '../types/erp';
import {
  Send,
  Paperclip,
  CheckCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Landmark,
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Camera,
  RefreshCw,
  ExternalLink,
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
  imageUrl: string;
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
    defaultProjectText: 'Obra Juárez 150 BBVA',
    imageUrl: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80',
    folio: 'F-99412',
  },
  {
    id: 't-2',
    title: 'Ticket Varilla y Acero',
    provider: 'Aceros y Perfiles Monterrey',
    amount: 86500,
    subtotal: 74568.96,
    iva: 11931.04,
    category: 'Materiales - Acero',
    defaultProjectText: 'Obra Juárez 150',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    folio: 'TK-84912',
  },
  {
    id: 't-4',
    title: 'Combustible Diésel Maquinaria',
    provider: 'Estación de Servicio Gasolineras del Norte',
    amount: 12400,
    subtotal: 10689.65,
    iva: 1710.35,
    category: 'Combustibles y Lubricantes',
    defaultProjectText: 'Torre Reforma 420 efectivo',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=400&q=80',
    folio: 'TK-GAS-310',
  },
];

export const WhatsAppOCRView: React.FC = () => {
  const {
    projects,
    accounts,
    registerSingleEntryExpense,
    setActiveModule,
    lastSingleEntryImpact,
  } = useERP();

  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'm-0',
      sender: 'bot',
      text: '👷 Asistente ERP Proyectos Construcciones activo. Envía la foto de cualquier ticket o factura junto con el nombre de la obra (ej. "Obra Juárez 150") para ejecutar la Carga Única instantánea.',
      timestamp: '09:00',
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState<SampleTicket>(SAMPLE_TICKETS[2]); // Ferretería default
  const [inputText, setInputText] = useState('Obra Juárez 150');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrStep, setOcrStep] = useState<string>('');

  const handleSendTicket = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMsgId = `usr-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. User message in chat
    const newMsg: WhatsAppMessage = {
      id: userMsgId,
      sender: 'user',
      text: inputText,
      timestamp: userTimestamp,
      image: selectedTicket.imageUrl,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsProcessing(true);
    setOcrStep('Analizando ticket con OCR / IA...');

    // Simulate OCR processing steps
    await new Promise((resolve) => setTimeout(resolve, 800));
    setOcrStep('Extrayendo Proveedor, Monto ($), IVA y Folio...');

    await new Promise((resolve) => setTimeout(resolve, 800));
    setOcrStep('Detectando Centro de Costos y ejecutando Principio de Carga Única...');

    // Match project from text
    const lower = inputText.toLowerCase();
    let matchedProject = projects.find((p) =>
      lower.includes(p.name.toLowerCase()) || lower.includes(p.code.toLowerCase()) || lower.includes('juárez')
    );
    if (!matchedProject) {
      matchedProject = projects[0]; // fallback to Obra Juárez 150
    }

    // Match bank / account from text
    let matchedAccount = accounts.find((a) => {
      const bname = a.bankName.toLowerCase();
      if (lower.includes('caja') || lower.includes('efectivo')) return a.accountType === 'efectivo';
      if (lower.includes('tarjeta') || lower.includes('amex')) return a.accountType === 'tarjeta';
      if (lower.includes('banorte')) return bname.includes('banorte');
      if (lower.includes('santander')) return bname.includes('santander');
      return a.accountType === 'banco';
    });
    if (!matchedAccount) {
      matchedAccount = accounts.find((a) => a.companyId === matchedProject?.companyId) || accounts[0];
    }

    // Execute SINGLE ENTRY LOAD (Principio de Carga Única)
    const result = registerSingleEntryExpense({
      projectId: matchedProject.id,
      provider: selectedTicket.provider,
      category: selectedTicket.category,
      amount: selectedTicket.amount,
      subtotal: selectedTicket.subtotal,
      iva: selectedTicket.iva,
      date: new Date().toISOString().split('T')[0],
      accountId: matchedAccount.id,
      paymentMethod:
        matchedAccount.accountType === 'efectivo'
          ? 'efectivo'
          : matchedAccount.accountType === 'tarjeta'
          ? 'tarjeta'
          : 'transferencia',
      invoiceFolio: selectedTicket.folio,
      capturedVia: 'whatsapp',
      notes: `Registrado automáticamente vía WhatsApp OCR: "${inputText}"`,
    });

    await new Promise((resolve) => setTimeout(resolve, 600));

    // Bot response message
    const botMsg: WhatsAppMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `✅ REGISTRO ÚNICO CONFIRMADO:\n\n• Obra: ${matchedProject.name}\n• Proveedor: ${selectedTicket.provider}\n• Monto: $${selectedTicket.amount.toLocaleString('es-MX')} MXN (IVA incluido: $${selectedTicket.iva.toLocaleString('es-MX')})\n• Cuenta afectada: ${matchedAccount.bankName}\n• Póliza contable: ${result.accountingSeat.seatNumber}\n\n🔄 Los 4 módulos han sido actualizados en tiempo real sin recapturas.`,
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
        projectName: matchedProject.name,
        accountName: matchedAccount.bankName,
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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Requerimiento Clave · Automatización
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-600 font-medium">Principio de Carga Única</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Integración WhatsApp & OCR de Tickets
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              El residente o comprador envía la fotografía del ticket con el texto de la obra. El motor de IA extrae proveedor, monto y fecha, registrándolo simultáneamente en Centros de Costos, Tesorería, CXP y Contabilidad sin recaptura.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule('reportes_financieros')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Ver Reportes en Tiempo Real</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flujo Visual: Diagrama del Principio de Carga Única */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
          <Zap className="w-4 h-4" />
          <span>Arquitectura Operativa del Principio de Carga Única</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-amber-400 font-mono font-bold">PASO 1</span>
              <h2 className="font-bold text-sm text-white mt-0.5">Captura en Campo</h2>
              <p className="text-slate-300 mt-1 text-[11px]">
                Envío de foto del ticket por WhatsApp con texto (&quot;Obra Juárez 150&quot;).
              </p>
            </div>
            <div className="mt-2 text-slate-400 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Cero fricción en obra</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-amber-400 font-mono font-bold">PASO 2</span>
              <h2 className="font-bold text-sm text-white mt-0.5">Módulo OCR / IA</h2>
              <p className="text-slate-300 mt-1 text-[11px]">
                Extrae Proveedor, Monto total ($), Subtotal, IVA, Fecha y Categoría.
              </p>
            </div>
            <div className="mt-2 text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Validación automática</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-amber-400 font-mono font-bold">PASO 3</span>
              <h2 className="font-bold text-sm text-white mt-0.5">Carga Única</h2>
              <p className="text-slate-300 mt-1 text-[11px]">
                Afectación en una sola transacción a 4 entidades clave sin duplicidad.
              </p>
            </div>
            <div className="mt-2 text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transacción atómica</span>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/40 p-3 rounded-xl flex flex-col justify-between text-amber-200">
            <div>
              <span className="text-[10px] text-amber-400 font-mono font-bold">RESULTADO</span>
              <h2 className="font-bold text-sm text-white mt-0.5">Impacto Cuádruple</h2>
              <div className="text-[10px] space-y-0.5 mt-1 text-slate-200">
                <div>1. + Gasto Centro de Costos</div>
                <div>2. - Saldo en Tesorería / Bancos</div>
                <div>3. Comprobante en CXP</div>
                <div>4. Póliza Contable Automática</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Simulador WhatsApp a la izquierda, Selector de Tickets e Impacto a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Simulador Interactivo de WhatsApp (Cols 1-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[640px]">
          {/* Header de WhatsApp */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
                PC
              </div>
              <div>
                <h2 className="font-bold text-sm leading-tight">
                  Bot ERP Proyectos Construcciones
                </h2>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>En línea · OCR Activo</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">WhatsApp Enterprise API</span>
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
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs text-xs md:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {/* Foto de ticket adjunta */}
                  {msg.image && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-black/10 bg-black/5">
                      <img
                        src={msg.image}
                        alt="Foto de ticket"
                        className="w-full h-36 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-1.5 bg-black/30 text-[11px] text-white flex items-center justify-between">
                        <span>📷 {selectedTicket.title}</span>
                        <span className="font-mono font-bold">
                          ${selectedTicket.amount.toLocaleString('es-MX')}
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Resumen de impacto visual si el bot lo envió */}
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
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            ))}

            {/* Spinner durante el procesamiento OCR */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 max-w-xs shadow-2xs">
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
              <span className="text-amber-700 font-medium">Escribe la obra y cuenta</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendTicket()}
                  placeholder='Ej: "Obra Juárez 150" o "Torre Reforma 420 caja chica"'
                  disabled={isProcessing}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <button
                onClick={handleSendTicket}
                disabled={isProcessing || !inputText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                title="Enviar ticket y procesar Carga Única"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Panel Lateral: Selector de Tickets Muestra y Detalles de Carga Única (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Selector de Tickets de Muestra */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Selecciona o Prueba un Ticket de Campo
              </h2>
              <span className="text-[11px] text-slate-400">4 muestras reales</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_TICKETS.map((t) => {
                const isSelected = selectedTicket.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTicket(t);
                      setInputText(t.defaultProjectText);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                        {t.title}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
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

          {/* Última Afectación en Tiempo Real */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Comprobación en Módulos ERP
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">En vivo</span>
            </div>

            {lastSingleEntryImpact ? (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span>{lastSingleEntryImpact.expense.projectName}</span>
                    <span className="font-mono text-emerald-700">
                      -${lastSingleEntryImpact.expense.amount.toLocaleString('es-MX')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Proveedor: {lastSingleEntryImpact.expense.provider}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Póliza: {lastSingleEntryImpact.accountingSeat.seatNumber} · Folio: {lastSingleEntryImpact.expense.invoiceFolio}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => setActiveModule('centros_costos')}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>Ir a Centros de Costos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={() => setActiveModule('tesoreria')}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>Ir a Tesorería y Bancos</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  <button
                    onClick={() => setActiveModule('reportes_financieros')}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                  >
                    <span>Ver Balance y Estado de Resultados</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Envía un ticket en el chat para ver la afectación en vivo aquí.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
