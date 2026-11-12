import React, { useState, useMemo } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Receipt,
  Plus,
  Search,
  ShieldCheck,
  Zap,
  X,
  MessageSquare,
} from 'lucide-react';

export const ComprasGastosView: React.FC = () => {
  const {
    expenses,
    projects,
    companies,
    accounts,
    activeCompanyId,
    registerSingleEntryExpense,
    setActiveModule,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [amountMode, setAmountMode] = useState<'sin_iva' | 'con_iva'>('sin_iva');

  const initialProj = projects[0];
  const initialCompanyId = initialProj?.companyId || companies[0]?.id || 'EDIF';
  const initialAccount =
    accounts.find((a) => a.companyId === initialCompanyId) || accounts[0];

  const [formData, setFormData] = useState<{
    projectId: string;
    companyId: string;
    accountId: string;
    provider: string;
    category: string;
    inputAmount: number;
    paymentMethod: 'transferencia' | 'efectivo' | 'tarjeta';
    invoiceFolio: string;
    date: string;
    notes: string;
  }>({
    projectId: initialProj?.id || '',
    companyId: initialCompanyId,
    accountId: initialAccount?.id || '',
    provider: '',
    category: 'Materiales - Concreto',
    inputAmount: 15000,
    paymentMethod: initialAccount?.accountType === 'efectivo' ? 'efectivo' : 'transferencia',
    invoiceFolio: `FAC-${Math.floor(Math.random() * 80000 + 10000)}`,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const categories = [
    'Materiales - Concreto',
    'Materiales - Acero',
    'Materiales - Agregados y Bloque',
    'Materiales - Madera y Cimbra',
    'Renta de Maquinaria y Equipo',
    'Mano de Obra Especializada',
    'Herramientas Menores',
    'Combustibles y Lubricantes',
    'Fletes y Acarreos',
    'Seguridad e Higiene Industrial',
  ];

  // Auto-calculated tax breakdown
  const taxBreakdown = useMemo(() => {
    const val = Number(formData.inputAmount || 0);
    if (amountMode === 'sin_iva') {
      const subtotal = Number(val.toFixed(2));
      const iva = Number((subtotal * 0.16).toFixed(2));
      const total = Number((subtotal + iva).toFixed(2));
      return { subtotal, iva, total };
    }
    const total = Number(val.toFixed(2));
    const subtotal = Number((total / 1.16).toFixed(2));
    const iva = Number((total - subtotal).toFixed(2));
    return { subtotal, iva, total };
  }, [formData.inputAmount, amountMode]);

  // Filter origin accounts by selected S.A. pagadora (fallback to all if none)
  const companyAccounts = useMemo(
    () => accounts.filter((a) => a.companyId === formData.companyId),
    [accounts, formData.companyId]
  );
  const selectableAccounts = companyAccounts.length > 0 ? companyAccounts : accounts;

  const handleProjectSelect = (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const acc = accounts.find((a) => a.companyId === proj.companyId) || accounts[0];
    setFormData((prev) => ({
      ...prev,
      projectId: proj.id,
      companyId: proj.companyId,
      accountId: acc?.id || prev.accountId,
      paymentMethod:
        acc?.accountType === 'efectivo'
          ? 'efectivo'
          : acc?.accountType === 'tarjeta'
          ? 'tarjeta'
          : 'transferencia',
    }));
  };

  const handleCompanySelect = (companyId: string) => {
    const acc = accounts.find((a) => a.companyId === companyId) || accounts[0];
    setFormData((prev) => ({
      ...prev,
      companyId,
      accountId: acc?.id || prev.accountId,
      paymentMethod:
        acc?.accountType === 'efectivo'
          ? 'efectivo'
          : acc?.accountType === 'tarjeta'
          ? 'tarjeta'
          : 'transferencia',
    }));
  };

  const handleAccountSelect = (accountId: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    setFormData((prev) => ({
      ...prev,
      accountId,
      paymentMethod:
        acc?.accountType === 'efectivo'
          ? 'efectivo'
          : acc?.accountType === 'tarjeta'
          ? 'tarjeta'
          : 'transferencia',
    }));
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider.trim() || taxBreakdown.total <= 0 || !formData.projectId || !formData.companyId || !formData.accountId) {
      return;
    }

    registerSingleEntryExpense({
      projectId: formData.projectId,
      companyId: formData.companyId,
      accountId: formData.accountId,
      provider: formData.provider.trim(),
      category: formData.category,
      amount: taxBreakdown.total,
      subtotal: taxBreakdown.subtotal,
      iva: taxBreakdown.iva,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      invoiceFolio: formData.invoiceFolio,
      capturedVia: 'manual',
      notes: formData.notes,
    });

    setShowAddExpenseModal(false);
    setFormData((prev) => ({
      ...prev,
      provider: '',
      inputAmount: 15000,
      invoiceFolio: `FAC-${Math.floor(Math.random() * 80000 + 10000)}`,
      notes: '',
    }));
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesCompany = activeCompanyId === 'ALL' || exp.companyId === activeCompanyId;
    const matchesProj = selectedProjectFilter === 'all' || exp.projectId === selectedProjectFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      exp.provider.toLowerCase().includes(q) ||
      exp.invoiceFolio.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q) ||
      exp.projectName.toLowerCase().includes(q) ||
      exp.companyName.toLowerCase().includes(q) ||
      exp.accountName.toLowerCase().includes(q);
    return matchesCompany && matchesProj && matchesSearch;
  });

  const totalSpentFiltered = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalSubtotalFiltered = filteredExpenses.reduce((acc, e) => acc + e.subtotal, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Módulo de Egresos</span>
              <span aria-hidden="true">·</span>
              <span>Compras, Gastos y Órdenes de Compra</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 text-balance">
              Registro de Egresos y Compras por Obra
            </h1>
            <p className="text-sm text-slate-600 mt-0.5 max-w-3xl">
              Cada gasto o compra se vincula obligatoriamente a una Obra (Centro de Costos), una S.A. pagadora y una Cuenta de Origen, actualizando bancos y costos al instante.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveModule('whatsapp_ocr')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Cargar vía WhatsApp</span>
            </button>

            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Egreso</span>
            </button>
          </div>
        </div>

        {/* Resumen Superior */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Total Egresos c/IVA
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-red-700 mt-0.5">
              ${totalSpentFiltered.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 font-mono tabular-nums">
              Base s/IVA: ${totalSubtotalFiltered.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Captura Automatizada WhatsApp
            </span>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-700 mt-0.5">
              {filteredExpenses.filter((e) => e.capturedVia === 'whatsapp').length} de {filteredExpenses.length}
            </div>
            <span className="text-[11px] text-emerald-700">
              OCR directo ligado a Obra + S.A. + Banco
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-xs font-medium text-slate-500 block">
              Garantía de Carga Única
            </span>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Sincronizado</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Descuenta banco de origen al instante
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por proveedor, S.A., banco, folio o obra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filtrar Obra:</span>
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-700 focus:outline-hidden focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Todas las Obras</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Compras y Gastos */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-slate-600">No hay egresos registrados con estos filtros.</p>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primer Egreso</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Fecha / Folio</th>
                  <th className="py-3 px-4">Proveedor y Categoría</th>
                  <th className="py-3 px-4">Obra (Centro Costos)</th>
                  <th className="py-3 px-4">S.A. Pagadora</th>
                  <th className="py-3 px-4">Cuenta de Origen</th>
                  <th className="py-3 px-4 text-right">Monto Total c/IVA</th>
                  <th className="py-3 px-4 text-center">Captura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 tabular-nums">{exp.date}</div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {exp.invoiceFolio}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{exp.provider}</div>
                      <div className="text-[11px] text-slate-500">{exp.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{exp.projectName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Póliza: {exp.accountingSeatId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{exp.companyName}</span>
                      <span className="block text-[10px] font-mono text-slate-400">
                        {exp.companyId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[180px]">
                        {exp.accountName}
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono tabular-nums font-bold text-red-700">
                        -${exp.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-slate-400">
                        s/IVA: ${exp.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} · IVA: ${exp.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[11px] font-semibold ${
                          exp.capturedVia === 'whatsapp' ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        {exp.capturedVia === 'whatsapp' ? 'WhatsApp OCR' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrar Gasto Manual con Principio de Carga Única */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Registro de Egreso / Compra (Carga Única)
                </h3>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4 text-xs md:text-sm">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Triada de Control:</strong> Liga cada gasto a su <strong>Obra (Centro de Costos)</strong>, <strong>S.A. Pagadora</strong> y <strong>Cuenta de Origen</strong> para actualizar bancos y rentabilidad al instante.
                </span>
              </div>

              {/* 1. Obra (Centro de Costos) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  1. Obra / Centro de Costos *
                </label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. S.A. Pagadora y 3. Cuenta de Origen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    2. S.A. Pagadora *
                  </label>
                  <select
                    required
                    value={formData.companyId}
                    onChange={(e) => handleCompanySelect(e.target.value)}
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
                    3. Cuenta de Origen (Banco / Caja) *
                  </label>
                  <select
                    required
                    value={formData.accountId}
                    onChange={(e) => handleAccountSelect(e.target.value)}
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

              {/* Proveedor y Folio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Proveedor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Cemex, Aceros del Norte..."
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Folio de Factura o Ticket *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceFolio}
                    onChange={(e) => setFormData({ ...formData, invoiceFolio: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Categoría y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Categoría del Gasto
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Fecha del Gasto
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Captura Monto + Desglose IVA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      {amountMode === 'sin_iva' ? 'Monto s/IVA ($ MXN) *' : 'Total c/IVA ($ MXN) *'}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setAmountMode((prev) => (prev === 'sin_iva' ? 'con_iva' : 'sin_iva'))
                      }
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                    >
                      {amountMode === 'sin_iva' ? 'Capturar Total c/IVA' : 'Capturar s/IVA'}
                    </button>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.inputAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, inputAmount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900 font-bold"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal s/IVA:</span>
                    <span className="font-mono tabular-nums font-semibold">
                      ${taxBreakdown.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>IVA (16%):</span>
                    <span className="font-mono tabular-nums font-semibold">
                      ${taxBreakdown.iva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total a Descontar:</span>
                    <span className="font-mono tabular-nums text-red-700">
                      -${taxBreakdown.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Notas u Observaciones
                </label>
                <input
                  type="text"
                  placeholder="Detalles de partida o elemento colado"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Confirmar Carga Única
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
