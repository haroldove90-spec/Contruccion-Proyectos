import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { SubcontratoContratista, SubcontratoPayment } from '../../types/controlTipo1';
import { exportToCSV, triggerPrintPDF } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Printer,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Layers,
  Users,
} from 'lucide-react';

export const SubSubcontratos: React.FC = () => {
  const { controlTipo1Data, updateControlTipo1Data } = useERP();
  const subcontratos = controlTipo1Data.subcontratos;

  const [selectedSubId, setSelectedSubId] = useState<string>(subcontratos[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SubcontratoPayment | null>(null);

  // Form payment
  const [paymentForm, setPaymentForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    conceptoFactura: '',
    pago: 50000,
    retencion: 2500,
    total: 52500,
    iva: 8400,
    totalConIva: 60900,
    esPagoRetencion: false,
  });

  // Form subcontratista
  const [subForm, setSubForm] = useState({
    nombre: '',
    cotizacion: 250000,
    aditivas: 0,
    porcentajeRetencion: 0.05,
    observaciones: '',
  });

  const activeSub = subcontratos.find((s) => s.id === selectedSubId) || subcontratos[0];

  // Consolidated
  const totalCotizacion = subcontratos.reduce((acc, s) => acc + s.cotizacion, 0);
  const totalAditivas = subcontratos.reduce((acc, s) => acc + s.aditivas, 0);
  const totalContratado = totalCotizacion + totalAditivas;
  const totalPagado = subcontratos.reduce(
    (acc, s) => acc + s.pagos.reduce((pacc, p) => pacc + p.totalConIva, 0),
    0
  );
  const totalRetenido = subcontratos.reduce(
    (acc, s) => acc + s.pagos.reduce((pacc, p) => pacc + p.retencion, 0),
    0
  );
  const totalSaldoPorPagar = totalContratado - totalPagado;

  // Active Sub
  const actPagado = activeSub?.pagos.reduce((acc, p) => acc + p.totalConIva, 0) || 0;
  const actRetenido = activeSub?.pagos.reduce((acc, p) => acc + p.retencion, 0) || 0;
  const actContratado = (activeSub?.cotizacion || 0) + (activeSub?.aditivas || 0);
  const actSaldoIncRet = actContratado - actPagado;
  const actSaldoSinRet = actSaldoIncRet - actRetenido;

  const handleOpenNewPayment = (esRetencion = false) => {
    setEditingPayment(null);
    const retPct = activeSub?.porcentajeRetencion || 0.05;
    const basePago = esRetencion ? actRetenido : 50000;
    const retVal = esRetencion ? 0 : Number((basePago * retPct).toFixed(2));
    const subtotal = basePago + retVal;
    const ivaVal = Number((subtotal * 0.16).toFixed(2));
    const totConIva = Number((subtotal + ivaVal).toFixed(2));

    setPaymentForm({
      fecha: new Date().toISOString().split('T')[0],
      conceptoFactura: esRetencion ? 'Finiquito: Devolución de Retención de Garantía' : 'FAC-1001: Estimación de instalaciones y equipo',
      pago: basePago,
      retencion: retVal,
      total: subtotal,
      iva: ivaVal,
      totalConIva: totConIva,
      esPagoRetencion: esRetencion,
    });
    setShowPaymentModal(true);
  };

  const handleOpenEditPayment = (p: SubcontratoPayment) => {
    setEditingPayment(p);
    setPaymentForm({
      fecha: p.fecha,
      conceptoFactura: p.conceptoFactura,
      pago: p.pago,
      retencion: p.retencion,
      total: p.total,
      iva: p.iva,
      totalConIva: p.totalConIva,
      esPagoRetencion: !!p.esPagoRetencion,
    });
    setShowPaymentModal(true);
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!window.confirm('¿Deseas eliminar este registro de pago de subcontrato?')) return;
    updateControlTipo1Data((prev) => ({
      ...prev,
      subcontratos: prev.subcontratos.map((s) =>
        s.id === activeSub.id ? { ...s, pagos: s.pagos.filter((p) => p.id !== paymentId) } : s
      ),
    }));
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const pago = Number(paymentForm.pago);
    const retencion = Number(paymentForm.retencion);
    const total = Number(paymentForm.total || pago + retencion);
    const iva = Number(paymentForm.iva);
    const totalConIva = Number(paymentForm.totalConIva || total + iva);

    if (editingPayment) {
      updateControlTipo1Data((prev) => ({
        ...prev,
        subcontratos: prev.subcontratos.map((s) =>
          s.id === activeSub.id
            ? {
                ...s,
                pagos: s.pagos.map((p) =>
                  p.id === editingPayment.id
                    ? {
                        ...p,
                        fecha: paymentForm.fecha,
                        conceptoFactura: paymentForm.conceptoFactura,
                        pago,
                        retencion,
                        total,
                        iva,
                        totalConIva,
                        esPagoRetencion: paymentForm.esPagoRetencion,
                      }
                    : p
                ),
              }
            : s
        ),
      }));
    } else {
      const newPay: SubcontratoPayment = {
        id: `subp-${Date.now()}`,
        fecha: paymentForm.fecha,
        conceptoFactura: paymentForm.conceptoFactura,
        pago,
        retencion,
        total,
        iva,
        totalConIva,
        esPagoRetencion: paymentForm.esPagoRetencion,
      };
      updateControlTipo1Data((prev) => ({
        ...prev,
        subcontratos: prev.subcontratos.map((s) =>
          s.id === activeSub.id ? { ...s, pagos: [newPay, ...s.pagos] } : s
        ),
      }));
    }
    setShowPaymentModal(false);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: SubcontratoContratista = {
      id: `sub-${Date.now()}`,
      nombre: subForm.nombre,
      cotizacion: Number(subForm.cotizacion),
      aditivas: Number(subForm.aditivas),
      porcentajeRetencion: Number(subForm.porcentajeRetencion),
      observaciones: subForm.observaciones,
      pagos: [],
    };
    updateControlTipo1Data((prev) => ({
      ...prev,
      subcontratos: [...prev.subcontratos, newSub],
    }));
    setSelectedSubId(newSub.id);
    setShowSubModal(false);
    setSubForm({
      nombre: '',
      cotizacion: 250000,
      aditivas: 0,
      porcentajeRetencion: 0.05,
      observaciones: '',
    });
  };

  const handleExportCSV = () => {
    const headers = ['Subcontratista', 'Fecha', 'Concepto / Factura', 'Pago', 'Retención', 'Total s/IVA', 'IVA', 'Total c/IVA', 'Es Retención'];
    const rows = (activeSub?.pagos || []).map((p) => [
      activeSub?.nombre || '',
      p.fecha,
      p.conceptoFactura,
      p.pago,
      p.retencion,
      p.total,
      p.iva,
      p.totalConIva,
      p.esPagoRetencion ? 'SÍ' : 'NO',
    ]);
    exportToCSV(`SUBCONTRATOS_${activeSub?.nombre.replace(/\s+/g, '_')}`, headers, rows);
  };

  const filteredPagos = (activeSub?.pagos || []).filter(
    (p) =>
      p.conceptoFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fecha.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider w-fit">
              Submódulo 4 · Sub-C y Prov
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Sub-Contratos y Proveedores Varios
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              Control de subcontratistas especializados (eléctricos, hidrosanitarios, elevadores, climatización) con retenciones y aditivas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerPrintPDF('Subcontratos_y_Proveedores_Tipo1')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => setShowSubModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span>+ Nuevo Subcontrato</span>
            </button>
            <button
              onClick={() => handleOpenNewPayment(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Pago</span>
            </button>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Subcontratado
            </span>
            <div className="text-base md:text-lg font-black font-mono text-slate-900 mt-1">
              ${totalContratado.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-slate-400">{subcontratos.length} empresas de servicios</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pagos Ejercidos
            </span>
            <div className="text-base md:text-lg font-black font-mono text-amber-700 mt-1">
              ${totalPagado.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-amber-600">
              {totalContratado > 0 ? ((totalPagado / totalContratado) * 100).toFixed(1) : 0}% ejercido
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Retenciones en Custodia
            </span>
            <div className="text-base md:text-lg font-black font-mono text-purple-700 mt-1">
              ${totalRetenido.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-purple-600">Fondo de garantía 5%</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Saldo Pendiente
            </span>
            <div className="text-base md:text-lg font-black font-mono text-blue-700 mt-1">
              ${totalSaldoPorPagar.toLocaleString('es-MX')}
            </div>
            <span className="text-[10px] text-blue-600">Por liquidar a proveedores</span>
          </div>
        </div>
      </div>

      {/* Selector de Subcontratista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Proveedor / Sub-C:
          </span>
          {subcontratos.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                s.id === activeSub?.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {s.nombre}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por concepto o factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Ficha del Subcontrato Activo */}
      {activeSub && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Retención: {(activeSub.porcentajeRetencion * 100).toFixed(0)}%
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">{activeSub.nombre}</h3>
              <p className="text-xs text-slate-500">{activeSub.observaciones || 'Subcontratista de obra'}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenNewPayment(true)}
                className="px-3 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
                title="Pagar retención liberada tras entrega de trabajos"
              >
                Pagar Retención ({`$${actRetenido.toLocaleString('es-MX')}`})
              </button>
              <button
                onClick={() => handleOpenNewPayment(false)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                + Nuevo Pago
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Cotización:</span>
              <span className="font-mono font-bold text-slate-800">${activeSub.cotizacion.toLocaleString('es-MX')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Aditivas:</span>
              <span className="font-mono font-bold text-slate-800">${activeSub.aditivas.toLocaleString('es-MX')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Total Contratado:</span>
              <span className="font-mono font-bold text-slate-900">${actContratado.toLocaleString('es-MX')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Por Pagar (inc. Ret.):</span>
              <span className="font-mono font-bold text-blue-700">${actSaldoIncRet.toLocaleString('es-MX')}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Por Pagar (sin Ret.):</span>
              <span className="font-mono font-bold text-emerald-700">${actSaldoSinRet.toLocaleString('es-MX')}</span>
            </div>
          </div>

          {/* Tabla de Pagos */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Concepto / No. Factura</th>
                  <th className="py-2.5 px-3 text-right">Pago</th>
                  <th className="py-2.5 px-3 text-right">Retención</th>
                  <th className="py-2.5 px-3 text-right">Total s/IVA</th>
                  <th className="py-2.5 px-3 text-right">IVA</th>
                  <th className="py-2.5 px-3 text-right">Total c/IVA</th>
                  <th className="py-2.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPagos.map((p) => (
                  <tr key={p.id} className={`hover:bg-slate-50/70 transition-colors ${p.esPagoRetencion ? 'bg-purple-50/30' : ''}`}>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{p.fecha}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-sm">
                      {p.conceptoFactura}
                      {p.esPagoRetencion && (
                        <span className="ml-2 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-sm">
                          Pago Retención
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">${p.pago.toLocaleString('es-MX')}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-purple-700">${p.retencion.toLocaleString('es-MX')}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">${p.total.toLocaleString('es-MX')}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">${p.iva.toLocaleString('es-MX')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">${p.totalConIva.toLocaleString('es-MX')}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditPayment(p)}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Editar pago"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(p.id)}
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
            </table>
          </div>
        </div>
      )}

      {/* Modal Registrar / Editar Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingPayment ? 'Editar Pago de Subcontrato' : 'Registrar Pago de Subcontrato'}
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
                    value={paymentForm.fecha}
                    onChange={(e) => setPaymentForm({ ...paymentForm, fecha: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={paymentForm.esPagoRetencion}
                      onChange={(e) => {
                        const isRet = e.target.checked;
                        const pagoVal = paymentForm.pago;
                        const retVal = isRet ? 0 : Number((pagoVal * (activeSub?.porcentajeRetencion || 0.05)).toFixed(2));
                        const tot = pagoVal + retVal;
                        const ivaVal = Number((tot * 0.16).toFixed(2));
                        setPaymentForm({
                          ...paymentForm,
                          esPagoRetencion: isRet,
                          retencion: retVal,
                          total: tot,
                          iva: ivaVal,
                          totalConIva: Number((tot + ivaVal).toFixed(2)),
                        });
                      }}
                      className="rounded-sm accent-purple-600"
                    />
                    <span>¿Es pago de retención?</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Concepto / No. de Factura</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. FAC-1044: Suministro de tuberías y conexiones"
                  value={paymentForm.conceptoFactura}
                  onChange={(e) => setPaymentForm({ ...paymentForm, conceptoFactura: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pago Directo</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentForm.pago}
                    onChange={(e) => {
                      const pagoVal = Number(e.target.value);
                      const retVal = paymentForm.esPagoRetencion ? 0 : Number((pagoVal * (activeSub?.porcentajeRetencion || 0.05)).toFixed(2));
                      const tot = pagoVal + retVal;
                      const ivaVal = Number((tot * 0.16).toFixed(2));
                      setPaymentForm({
                        ...paymentForm,
                        pago: pagoVal,
                        retencion: retVal,
                        total: tot,
                        iva: ivaVal,
                        totalConIva: Number((tot + ivaVal).toFixed(2)),
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Retención (5%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.retencion}
                    onChange={(e) => {
                      const retVal = Number(e.target.value);
                      const tot = paymentForm.pago + retVal;
                      const ivaVal = Number((tot * 0.16).toFixed(2));
                      setPaymentForm({
                        ...paymentForm,
                        retencion: retVal,
                        total: tot,
                        iva: ivaVal,
                        totalConIva: Number((tot + ivaVal).toFixed(2)),
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-purple-700"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Total c/IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.totalConIva}
                    onChange={(e) => setPaymentForm({ ...paymentForm, totalConIva: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-amber-700"
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

      {/* Modal Nuevo Subcontrato */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Alta de Subcontrato / Proveedor</h3>
              <button
                onClick={() => setShowSubModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="mt-4 space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Empresa / Razón Social</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Climas y Aire Acondicionado del Norte S.A."
                  value={subForm.nombre}
                  onChange={(e) => setSubForm({ ...subForm, nombre: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cotización Inicial ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={subForm.cotizacion}
                    onChange={(e) => setSubForm({ ...subForm, cotizacion: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">% Retención (ej. 0.05 = 5%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="0.5"
                    value={subForm.porcentajeRetencion}
                    onChange={(e) => setSubForm({ ...subForm, porcentajeRetencion: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Observaciones</label>
                <input
                  type="text"
                  placeholder="Especialidad o alcance de contrato"
                  value={subForm.observaciones}
                  onChange={(e) => setSubForm({ ...subForm, observaciones: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Crear Subcontrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
