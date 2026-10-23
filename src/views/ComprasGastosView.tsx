import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Building2,
  Landmark,
  ShieldCheck,
  Zap,
  CreditCard,
  Banknote,
  X,
  MessageSquare,
} from 'lucide-react';

export const ComprasGastosView: React.FC = () => {
  const {
    expenses,
    projects,
    accounts,
    registerSingleEntryExpense,
    setActiveModule,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    projectId: string;
    provider: string;
    category: string;
    amount: number;
    accountId: string;
    paymentMethod: 'transferencia' | 'efectivo' | 'tarjeta';
    invoiceFolio: string;
    notes: string;
  }>({
    projectId: projects[0]?.id || '',
    provider: '',
    category: 'Materiales - Concreto',
    amount: 15000,
    accountId: accounts[0]?.id || '',
    paymentMethod: 'transferencia',
    invoiceFolio: `FAC-${Math.floor(Math.random() * 80000 + 10000)}`,
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

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider || !formData.amount) return;

    const subtotal = Number((formData.amount / 1.16).toFixed(2));
    const iva = Number((formData.amount - subtotal).toFixed(2));

    registerSingleEntryExpense({
      projectId: formData.projectId,
      provider: formData.provider,
      category: formData.category,
      amount: Number(formData.amount),
      subtotal,
      iva,
      date: new Date().toISOString().split('T')[0],
      accountId: formData.accountId,
      paymentMethod: formData.paymentMethod,
      invoiceFolio: formData.invoiceFolio,
      capturedVia: 'manual',
      notes: formData.notes,
    });

    setShowAddExpenseModal(false);
    setFormData({
      projectId: projects[0]?.id || '',
      provider: '',
      category: 'Materiales - Concreto',
      amount: 15000,
      accountId: accounts[0]?.id || '',
      paymentMethod: 'transferencia',
      invoiceFolio: `FAC-${Math.floor(Math.random() * 80000 + 10000)}`,
      notes: '',
    });
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesProj = selectedProjectFilter === 'all' || exp.projectId === selectedProjectFilter;
    const matchesSearch =
      exp.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.invoiceFolio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProj && matchesSearch;
  });

  const totalSpentFiltered = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Módulo B</span>
              <span>·</span>
              <span>Compras, Gastos y Órdenes de Compra</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Registro de Compras y Comprobantes
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Cada gasto registrado actualiza simultáneamente el Centro de Costos, la cuenta bancaria, el saldo del proveedor y la póliza contable.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule('whatsapp_ocr')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs md:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Cargar vía WhatsApp</span>
            </button>

            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Gasto Manual</span>
            </button>
          </div>
        </div>

        {/* Resumen Superior */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Egresos Registrados
            </span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              ${totalSpentFiltered.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">
              {filteredExpenses.length} comprobantes en la vista
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Captura Automatizada WhatsApp
            </span>
            <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">
              {expenses.filter((e) => e.capturedVia === 'whatsapp').length} de {expenses.length}
            </div>
            <span className="text-[10px] text-emerald-600">
              OCR directo desde obra sin recaptura
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Garantía de Carga Única
            </span>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Sincronizado</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Afecta Obras, Bancos y Pólizas al instante
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
            placeholder="Buscar por proveedor, folio o categoría..."
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha / Folio</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4">Centro de Costos (Obra)</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Cuenta / Pago</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
                <th className="py-3 px-4 text-center">Captura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{exp.date}</div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {exp.invoiceFolio}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{exp.provider}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{exp.projectName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Póliza: {exp.accountingSeatId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{exp.category}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-700 font-medium truncate max-w-[150px]">
                      {exp.accountName}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {exp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono font-bold text-slate-900">
                      ${exp.amount.toLocaleString('es-MX')}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      IVA: ${exp.iva.toLocaleString('es-MX')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        exp.capturedVia === 'whatsapp'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {exp.capturedVia === 'whatsapp' ? '📲 WhatsApp' : '💻 Manual'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Gasto Manual con Principio de Carga Única */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Registro de Gasto con Carga Única
                </h3>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4 text-xs md:text-sm">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Principio de Carga Única:</strong> Este formulario descontará de la cuenta bancaria elegida, sumará al presupuesto de la obra y creará la póliza contable en una sola acción.
                </span>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Centro de Costos (Obra Destino)
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Proveedor
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
                    Folio de Factura o Ticket
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
                    Monto Total con IVA ($ MXN)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cuenta Bancaria o Caja a Afectar
                  </label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.bankName} (Saldo: ${a.currentBalance.toLocaleString('es-MX')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as 'transferencia' | 'efectivo' | 'tarjeta',
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 capitalize"
                  >
                    <option value="transferencia">Transferencia SPEI</option>
                    <option value="efectivo">Efectivo / Caja Chica</option>
                    <option value="tarjeta">Tarjeta Corporativa</option>
                  </select>
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
