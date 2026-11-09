import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ClientPayment } from '../../types/controlTipo1';
import { exportToCSV, triggerPrintPDF } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Plus,
  Edit2,
  Trash2,
  Search,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  X,
  Building2,
  Wallet,
} from 'lucide-react';

export const SubControlGeneral: React.FC = () => {
  const { controlTipo1Data, updateControlTipo1Data } = useERP();
  const data = controlTipo1Data.controlGeneral;
  const { presupuestoAditivas, manoObra, subcontratos, materiales, materialesCliente } = controlTipo1Data;

  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ClientPayment | null>(null);

  // Form state for client payment
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
    estimacion: '',
    tipoPago: 'Transferencia SPEI',
    pagoSinIva: 0,
    iva: 0,
    total: 0,
  });

  // Dynamic calculations from other submodules
  // Presupuesto + Aditivas - Deductivas
  const totalAditivasCalculadas = presupuestoAditivas.aditivas.reduce((acc, a) => acc + a.total, 0);
  const totalDeductivasCalculadas = presupuestoAditivas.deductivas.reduce((acc, d) => acc + d.total, 0);
  const presupuestoTotal = presupuestoAditivas.presupuestoInicialTotal + totalAditivasCalculadas - totalDeductivasCalculadas;

  // Mano de Obra consolidada
  const moPresupuesto = manoObra.reduce((acc, c) => acc + c.cotizacion, 0);
  const moAditivas = manoObra.reduce((acc, c) => acc + c.aditivasYDeductivas, 0);
  const moTotal = moPresupuesto + moAditivas;
  const moPagos = manoObra.reduce((acc, c) => acc + c.pagos.reduce((pacc, p) => pacc + p.totalConIva, 0), 0);
  const moRetenciones = manoObra.reduce((acc, c) => acc + c.pagos.reduce((pacc, p) => pacc + p.retencion, 0), 0);
  const moSaldos = moTotal - moPagos;

  // Subcontratos consolidados
  const subPresupuesto = subcontratos.reduce((acc, c) => acc + c.cotizacion, 0);
  const subAditivas = subcontratos.reduce((acc, c) => acc + c.aditivas, 0);
  const subTotal = subPresupuesto + subAditivas;
  const subPagos = subcontratos.reduce((acc, c) => acc + c.pagos.reduce((pacc, p) => pacc + p.totalConIva, 0), 0);
  const subRetenciones = subcontratos.reduce((acc, c) => acc + c.pagos.reduce((pacc, p) => pacc + p.retencion, 0), 0);
  const subSaldos = subTotal - subPagos;

  // Materiales consolidados
  const matTotal = materiales.reduce((acc, p) => acc + p.compras.reduce((cacc, c) => cacc + c.total, 0), 0);
  const matClienteTotal = materialesCliente.reduce((acc, p) => acc + p.compras.reduce((cacc, c) => cacc + c.total, 0), 0);

  // Pagos recibidos del cliente
  const totalPagosRecibidosSinIva = data.pagosCliente.reduce((acc, p) => acc + p.pagoSinIva, 0);
  const totalPagosRecibidosIva = data.pagosCliente.reduce((acc, p) => acc + p.iva, 0);
  const totalPagosRecibidos = data.pagosCliente.reduce((acc, p) => acc + p.total, 0);
  const pagosPorRecibir = presupuestoTotal - totalPagosRecibidos;

  // Gastos totales consolidados (Mano de obra + Subcontratos + Materiales)
  const gastosTotales = moPagos + subPagos + matTotal;
  const retencionesTotales = moRetenciones + subRetenciones;
  const saldoDisponibleEnCuenta = totalPagosRecibidos - gastosTotales;

  const handleOpenNewPayment = () => {
    setEditingPayment(null);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      observaciones: '',
      estimacion: `Estimación ${data.pagosCliente.length + 1}`,
      tipoPago: 'Transferencia SPEI',
      pagoSinIva: 250000,
      iva: 40000,
      total: 290000,
    });
    setShowPaymentModal(true);
  };

  const handleOpenEditPayment = (p: ClientPayment) => {
    setEditingPayment(p);
    setFormData({
      fecha: p.fecha,
      observaciones: p.observaciones,
      estimacion: p.estimacion,
      tipoPago: p.tipoPago,
      pagoSinIva: p.pagoSinIva,
      iva: p.iva,
      total: p.total,
    });
    setShowPaymentModal(true);
  };

  const handleDeletePayment = (id: string) => {
    if (!window.confirm('¿Deseas eliminar este registro de pago de cliente?')) return;
    updateControlTipo1Data((prev) => ({
      ...prev,
      controlGeneral: {
        ...prev.controlGeneral,
        pagosCliente: prev.controlGeneral.pagosCliente.filter((item) => item.id !== id),
      },
    }));
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const pagoSinIva = Number(formData.pagoSinIva);
    const iva = Number(formData.iva);
    const total = Number(formData.total || pagoSinIva + iva);

    if (editingPayment) {
      updateControlTipo1Data((prev) => ({
        ...prev,
        controlGeneral: {
          ...prev.controlGeneral,
          pagosCliente: prev.controlGeneral.pagosCliente.map((item) =>
            item.id === editingPayment.id
              ? {
                  ...item,
                  fecha: formData.fecha,
                  observaciones: formData.observaciones,
                  estimacion: formData.estimacion,
                  tipoPago: formData.tipoPago,
                  pagoSinIva,
                  iva,
                  total,
                }
              : item
          ),
        },
      }));
    } else {
      const newPayment: ClientPayment = {
        id: `pc-${Date.now()}`,
        fecha: formData.fecha,
        observaciones: formData.observaciones,
        estimacion: formData.estimacion,
        tipoPago: formData.tipoPago,
        pagoSinIva,
        iva,
        total,
      };
      updateControlTipo1Data((prev) => ({
        ...prev,
        controlGeneral: {
          ...prev.controlGeneral,
          pagosCliente: [newPayment, ...prev.controlGeneral.pagosCliente],
        },
      }));
    }
    setShowPaymentModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Observaciones', 'Estimación', 'Tipo de Pago', 'Pago s/IVA', 'IVA (16%)', 'Total'];
    const rows = data.pagosCliente.map((p) => [
      p.fecha,
      p.observaciones,
      p.estimacion,
      p.tipoPago,
      p.pagoSinIva,
      p.iva,
      p.total,
    ]);
    exportToCSV('CONTROL_GENERAL_PAGOS_CLIENTE', headers, rows);
  };

  const filteredPagos = data.pagosCliente.filter(
    (p) =>
      p.observaciones.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.estimacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tipoPago.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
              Submódulo 1 · Control General de Obra
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Consolidado General de Obra Tipo 1 (P0-00)
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              Matriz financiera ejecutiva: Presupuesto base, aditivas/deductivas, cobranza al cliente, retenciones y saldo disponible en cuenta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerPrintPDF('Control_General_Obra_Tipo1')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Exportar a PDF"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              title="Descargar datos en Excel CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={handleOpenNewPayment}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Pago Cliente</span>
            </button>
          </div>
        </div>

        {/* Global Key Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Presupuesto Vigente Total
            </span>
            <div className="text-base md:text-lg font-black font-mono text-slate-900 mt-1">
              ${presupuestoTotal.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Inc. Aditivas y Deductivas</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Cobrado al Cliente
            </span>
            <div className="text-base md:text-lg font-black font-mono text-emerald-700 mt-1">
              ${totalPagosRecibidos.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-emerald-600">
              {presupuestoTotal > 0 ? ((totalPagosRecibidos / presupuestoTotal) * 100).toFixed(1) : 0}% cobrado
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Gastos Totales Ejercidos
            </span>
            <div className="text-base md:text-lg font-black font-mono text-amber-700 mt-1">
              ${gastosTotales.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">MO + Subcontratos + Materiales</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Saldo Disponible en Cuenta
            </span>
            <div
              className={`text-base md:text-lg font-black font-mono mt-1 ${
                saldoDisponibleEnCuenta >= 0 ? 'text-blue-700' : 'text-red-700'
              }`}
            >
              ${saldoDisponibleEnCuenta.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">Cobrado menos gastos</span>
          </div>
        </div>
      </div>

      {/* Resumen por Capítulos / Partidas de la Hoja de Cálculo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mano de Obra */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Mano de Obra</h3>
            <span className="text-[11px] text-slate-400 font-mono">Submódulo 3</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Presupuesto Base:</span>
              <span className="font-mono font-semibold">${moPresupuesto.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Aditivas / Deductivas:</span>
              <span className="font-mono font-semibold">${moAditivas.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-1">
              <span>Total Contratado:</span>
              <span className="font-mono">${moTotal.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>Pagos Ejercidos:</span>
              <span className="font-mono font-bold">${moPagos.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Retenciones en Custodia:</span>
              <span className="font-mono">${moRetenciones.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-blue-700 font-bold border-t border-slate-100 pt-1">
              <span>Saldo por Pagar:</span>
              <span className="font-mono">${moSaldos.toLocaleString('es-MX')}</span>
            </div>
          </div>
        </div>

        {/* Sub-Contratos y Prov */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Sub-Contratos y Prov.</h3>
            <span className="text-[11px] text-slate-400 font-mono">Submódulo 4</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Presupuesto Base:</span>
              <span className="font-mono font-semibold">${subPresupuesto.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Aditivas:</span>
              <span className="font-mono font-semibold">${subAditivas.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-1">
              <span>Total Contratado:</span>
              <span className="font-mono">${subTotal.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>Pagos Ejercidos:</span>
              <span className="font-mono font-bold">${subPagos.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Retenciones en Custodia:</span>
              <span className="font-mono">${subRetenciones.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-blue-700 font-bold border-t border-slate-100 pt-1">
              <span>Saldo por Pagar:</span>
              <span className="font-mono">${subSaldos.toLocaleString('es-MX')}</span>
            </div>
          </div>
        </div>

        {/* Materiales y Honorarios */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Materiales & Honorarios</h3>
            <span className="text-[11px] text-slate-400 font-mono">Submódulo 5 y 6</span>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Materiales Directos Obra:</span>
              <span className="font-mono font-semibold">${matTotal.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Compras Directas Cliente:</span>
              <span className="font-mono font-semibold">${matClienteTotal.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Costo Reconocido con IMSS:</span>
              <span className="font-mono">${data.costoReconocidoConImss.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Costo sin IMSS:</span>
              <span className="font-mono">${data.costoReconocidoSinImss.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-purple-700 font-bold border-t border-slate-100 pt-1">
              <span>Utilidad por Reconocer:</span>
              <span className="font-mono">${data.utilidadPorReconocer.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Sobrecosto Pronosticado:</span>
              <span className="font-mono font-semibold">{(data.sobreCostoPronosticado * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla: Pagos Recibidos por el Cliente */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Historial de Pagos y Estimaciones Recibidas del Cliente
            </h3>
            <p className="text-xs text-slate-500">
              Cobranza ingresada a cuentas de la constructora con desglose de IVA 16%
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en observaciones o estimación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Estimación</th>
                <th className="py-3 px-4">Observaciones</th>
                <th className="py-3 px-4">Tipo de Pago</th>
                <th className="py-3 px-4 text-right">Pago s/IVA</th>
                <th className="py-3 px-4 text-right">IVA</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-600 font-medium">{pago.fecha}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{pago.estimacion}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{pago.observaciones}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                      {pago.tipoPago}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    ${pago.pagoSinIva.toLocaleString('es-MX')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    ${pago.iva.toLocaleString('es-MX')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    ${pago.total.toLocaleString('es-MX')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEditPayment(pago)}
                        className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Editar pago"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(pago.id)}
                        className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Eliminar pago"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-xs">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-slate-900 uppercase tracking-wider">
                  S U M A S
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-900">
                  ${totalPagosRecibidosSinIva.toLocaleString('es-MX')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-700">
                  ${totalPagosRecibidosIva.toLocaleString('es-MX')}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700 text-sm">
                  ${totalPagosRecibidos.toLocaleString('es-MX')}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Pago de Cliente */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingPayment ? 'Editar Pago de Cliente' : 'Registrar Pago de Cliente'}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="mt-4 space-y-3.5 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estimación / Folio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Estimación 01"
                    value={formData.estimacion}
                    onChange={(e) => setFormData({ ...formData, estimacion: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tipo de Pago</label>
                <select
                  value={formData.tipoPago}
                  onChange={(e) => setFormData({ ...formData, tipoPago: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="Transferencia SPEI">Transferencia SPEI</option>
                  <option value="Cheque Bancario">Cheque Bancario</option>
                  <option value="Efectivo">Efectivo en Caja</option>
                  <option value="Tarjeta Corporativa">Tarjeta Corporativa</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Observaciones</label>
                <input
                  type="text"
                  placeholder="Concepto o partida de avance cubierto"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pago s/IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.pagoSinIva}
                    onChange={(e) => {
                      const sinIva = Number(e.target.value);
                      const iva = Number((sinIva * 0.16).toFixed(2));
                      setFormData({
                        ...formData,
                        pagoSinIva: sinIva,
                        iva,
                        total: Number((sinIva + iva).toFixed(2)),
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">IVA (16%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.iva}
                    onChange={(e) => {
                      const iva = Number(e.target.value);
                      setFormData({
                        ...formData,
                        iva,
                        total: Number((formData.pagoSinIva + iva).toFixed(2)),
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total}
                    onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Guardar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
