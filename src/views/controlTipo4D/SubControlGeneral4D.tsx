import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Tipo4DPagoCliente, Tipo4DManoObra, Tipo4DMaterialGasto } from '../../types/controlTipo4D';
import { exportToCSV, triggerPrintPDF } from '../../utils/exportUtils';
import {
  FileSpreadsheet,
  Printer,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  TrendingUp,
  Receipt,
  Users,
  Package,
  Sparkles,
  Calculator,
} from 'lucide-react';

export const SubControlGeneral4D: React.FC = () => {
  const { controlTipo4DData, updateControlTipo4DData } = useERP();
  const cg = controlTipo4DData.controlGeneral;

  // Modals
  const [modalType, setModalType] = useState<'pagoCliente' | 'manoObra' | 'material' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    section: 'A' | 'B' | 'C';
    id: string;
    description: string;
  } | null>(null);

  // Form states
  const [pagoForm, setPagoForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
    factura: '',
    pagoSinIva: 50000,
    iva: 8000,
    totalConIva: 58000,
  });

  const [moForm, setMoForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    firma: '',
    contratistaConcepto: '',
    pago: 15000,
    totalALaFecha: 15000,
    iva: 2400,
    totalConIva: 17400,
  });

  const [matForm, setMatForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    empresa: '',
    factura: '',
    pagoSinIva: 8000,
    iva: 1280,
    total: 9280,
  });

  // Section (A) Sums
  const aSinIva = cg.pagosCliente.reduce((acc, p) => acc + p.pagoSinIva, 0);
  const aIva = cg.pagosCliente.reduce((acc, p) => acc + p.iva, 0);
  const aTotal = cg.pagosCliente.reduce((acc, p) => acc + p.totalConIva, 0);

  // Section (B) Sums
  const bPago = cg.manoObra.reduce((acc, m) => acc + m.pago, 0);
  const bTotalALaFecha = cg.manoObra.reduce((acc, m) => acc + m.totalALaFecha, 0);
  const bIva = cg.manoObra.reduce((acc, m) => acc + m.iva, 0);
  const bTotal = cg.manoObra.reduce((acc, m) => acc + m.totalConIva, 0);

  // Section (C) Sums
  const cSinIva = cg.materiales.reduce((acc, m) => acc + m.pagoSinIva, 0);
  const cIva = cg.materiales.reduce((acc, m) => acc + m.iva, 0);
  const cTotal = cg.materiales.reduce((acc, m) => acc + m.total, 0);

  // TIR = (A) - (B) - (C)
  const tirSinIva = aSinIva - bPago - cSinIva;
  const tirIva = aIva - bIva - cIva;
  const tirTotal = aTotal - bTotal - cTotal;

  // Handlers for Form A
  const handleOpenPagoModal = (item?: Tipo4DPagoCliente) => {
    if (item) {
      setEditingId(item.id);
      setPagoForm({
        fecha: item.fecha,
        observaciones: item.observaciones,
        factura: item.factura,
        pagoSinIva: item.pagoSinIva,
        iva: item.iva,
        totalConIva: item.totalConIva,
      });
    } else {
      setEditingId(null);
      const defaultSinIva = 50000;
      const defaultIva = Number((defaultSinIva * 0.16).toFixed(2));
      setPagoForm({
        fecha: new Date().toISOString().split('T')[0],
        observaciones: '',
        factura: `FAC-D-${Math.floor(100 + Math.random() * 900)}`,
        pagoSinIva: defaultSinIva,
        iva: defaultIva,
        totalConIva: defaultSinIva + defaultIva,
      });
    }
    setModalType('pagoCliente');
  };

  const handleSavePago = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updated = cg.pagosCliente.map((p) =>
        p.id === editingId
          ? {
              ...p,
              fecha: pagoForm.fecha,
              observaciones: pagoForm.observaciones,
              factura: pagoForm.factura,
              pagoSinIva: Number(pagoForm.pagoSinIva),
              iva: Number(pagoForm.iva),
              totalConIva: Number(pagoForm.totalConIva),
            }
          : p
      );
      updateControlTipo4DData({ controlGeneral: { ...cg, pagosCliente: updated } });
    } else {
      const newItem: Tipo4DPagoCliente = {
        id: `t4p-${Date.now()}`,
        fecha: pagoForm.fecha,
        observaciones: pagoForm.observaciones,
        factura: pagoForm.factura,
        pagoSinIva: Number(pagoForm.pagoSinIva),
        iva: Number(pagoForm.iva),
        totalConIva: Number(pagoForm.totalConIva),
      };
      updateControlTipo4DData({
        controlGeneral: { ...cg, pagosCliente: [...cg.pagosCliente, newItem] },
      });
    }
    setModalType(null);
  };

  // Handlers for Form B
  const handleOpenMoModal = (item?: Tipo4DManoObra) => {
    if (item) {
      setEditingId(item.id);
      setMoForm({
        fecha: item.fecha,
        firma: item.firma,
        contratistaConcepto: item.contratistaConcepto,
        pago: item.pago,
        totalALaFecha: item.totalALaFecha,
        iva: item.iva,
        totalConIva: item.totalConIva,
      });
    } else {
      setEditingId(null);
      const defaultPago = 18000;
      const defaultIva = Number((defaultPago * 0.16).toFixed(2));
      setMoForm({
        fecha: new Date().toISOString().split('T')[0],
        firma: 'Arq. Residente',
        contratistaConcepto: '',
        pago: defaultPago,
        totalALaFecha: bTotalALaFecha + defaultPago,
        iva: defaultIva,
        totalConIva: defaultPago + defaultIva,
      });
    }
    setModalType('manoObra');
  };

  const handleSaveMo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updated = cg.manoObra.map((m) =>
        m.id === editingId
          ? {
              ...m,
              fecha: moForm.fecha,
              firma: moForm.firma,
              contratistaConcepto: moForm.contratistaConcepto,
              pago: Number(moForm.pago),
              totalALaFecha: Number(moForm.totalALaFecha),
              iva: Number(moForm.iva),
              totalConIva: Number(moForm.totalConIva),
            }
          : m
      );
      updateControlTipo4DData({ controlGeneral: { ...cg, manoObra: updated } });
    } else {
      const newItem: Tipo4DManoObra = {
        id: `t4mo-${Date.now()}`,
        fecha: moForm.fecha,
        firma: moForm.firma,
        contratistaConcepto: moForm.contratistaConcepto,
        pago: Number(moForm.pago),
        totalALaFecha: Number(moForm.totalALaFecha),
        iva: Number(moForm.iva),
        totalConIva: Number(moForm.totalConIva),
      };
      updateControlTipo4DData({
        controlGeneral: { ...cg, manoObra: [...cg.manoObra, newItem] },
      });
    }
    setModalType(null);
  };

  // Handlers for Form C
  const handleOpenMatModal = (item?: Tipo4DMaterialGasto) => {
    if (item) {
      setEditingId(item.id);
      setMatForm({
        fecha: item.fecha,
        empresa: item.empresa,
        factura: item.factura,
        pagoSinIva: item.pagoSinIva,
        iva: item.iva,
        total: item.total,
      });
    } else {
      setEditingId(null);
      const defaultSin = 10000;
      const defaultIva = Number((defaultSin * 0.16).toFixed(2));
      setMatForm({
        fecha: new Date().toISOString().split('T')[0],
        empresa: '',
        factura: `F-${Math.floor(100 + Math.random() * 900)}`,
        pagoSinIva: defaultSin,
        iva: defaultIva,
        total: defaultSin + defaultIva,
      });
    }
    setModalType('material');
  };

  const handleSaveMat = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updated = cg.materiales.map((m) =>
        m.id === editingId
          ? {
              ...m,
              fecha: matForm.fecha,
              empresa: matForm.empresa,
              factura: matForm.factura,
              pagoSinIva: Number(matForm.pagoSinIva),
              iva: Number(matForm.iva),
              total: Number(matForm.total),
            }
          : m
      );
      updateControlTipo4DData({ controlGeneral: { ...cg, materiales: updated } });
    } else {
      const newItem: Tipo4DMaterialGasto = {
        id: `t4m-${Date.now()}`,
        fecha: matForm.fecha,
        empresa: matForm.empresa,
        factura: matForm.factura,
        pagoSinIva: Number(matForm.pagoSinIva),
        iva: Number(matForm.iva),
        total: Number(matForm.total),
      };
      updateControlTipo4DData({
        controlGeneral: { ...cg, materiales: [...cg.materiales, newItem] },
      });
    }
    setModalType(null);
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.section === 'A') {
      const updated = cg.pagosCliente.filter((p) => p.id !== deleteConfirm.id);
      updateControlTipo4DData({ controlGeneral: { ...cg, pagosCliente: updated } });
    } else if (deleteConfirm.section === 'B') {
      const updated = cg.manoObra.filter((m) => m.id !== deleteConfirm.id);
      updateControlTipo4DData({ controlGeneral: { ...cg, manoObra: updated } });
    } else if (deleteConfirm.section === 'C') {
      const updated = cg.materiales.filter((m) => m.id !== deleteConfirm.id);
      updateControlTipo4DData({ controlGeneral: { ...cg, materiales: updated } });
    }
    setDeleteConfirm(null);
  };

  const handleExportCSV = () => {
    const headers = ['Sección', 'Fecha', 'Detalle / Concepto', 'Factura / Firma', 'Pago s/IVA', 'IVA', 'Total'];
    const rows: (string | number)[][] = [];

    // Header Meta
    rows.push(['CONTROL DE DISEÑO', cg.diseno, 'No. de hoja:', cg.noHoja, '', '', '']);
    rows.push(['TOTAL INGRESOS RECIBIDOS TIR=(A)-(B)-(C)', '', '', '', tirSinIva, tirIva, tirTotal]);
    rows.push(['', '', '', '', '', '', '']);

    // Section A
    rows.push(['( A ) PAGOS RECIBIDOS POR EL CLIENTE', '', '', '', '', '', '']);
    cg.pagosCliente.forEach((p) => {
      rows.push(['A', p.fecha, p.observaciones, p.factura, p.pagoSinIva, p.iva, p.totalConIva]);
    });
    rows.push(['S U M A S (A)', '', '', '', aSinIva, aIva, aTotal]);
    rows.push(['', '', '', '', '', '', '']);

    // Section B
    rows.push(['( B ) MANO DE OBRA', '', '', '', '', '', '']);
    cg.manoObra.forEach((m) => {
      rows.push(['B', m.fecha, m.contratistaConcepto, m.firma, m.pago, m.iva, m.totalConIva]);
    });
    rows.push(['T O T A L E S (B)', '', '', '', bPago, bIva, bTotal]);
    rows.push(['', '', '', '', '', '', '']);

    // Section C
    rows.push(['( C ) MATERIALES', '', '', '', '', '', '']);
    cg.materiales.forEach((m) => {
      rows.push(['C', m.fecha, m.empresa, m.factura, m.pagoSinIva, m.iva, m.total]);
    });
    rows.push(['T O T A L E S (C)', '', '', '', cSinIva, cIva, cTotal]);

    exportToCSV(`Control_General_Tipo4D_P0-00_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6 printable-dossier">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-lg">
              Submódulo 01
            </span>
            <span className="text-xs text-slate-500 font-medium font-mono">
              Control_Tipo4D_P0-00 / Control General
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-600" />
            Control General de Diseño y Obra (TIR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo matricial directo: Total Ingresos Recibidos <span className="font-bold text-slate-700">TIR = (A) - (B) - (C)</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap no-print">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exportar Excel
          </button>
          <button
            onClick={() => triggerPrintPDF('Control General Tipo 4D - TIR')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Sheet Metadata Strip */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div>
          <span className="text-amber-400 font-bold block text-[10px] uppercase">
            CONTROL DE DISEÑO
          </span>
          <span className="text-sm font-bold text-slate-100">{cg.diseno}</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-400 font-bold block text-[10px] uppercase">
              No. DE HOJA
            </span>
            <span className="text-slate-200 font-semibold">{cg.noHoja}</span>
          </div>
          <div className="text-slate-400 text-[11px] italic hidden md:block">
            {cg.nota}
          </div>
        </div>
      </div>

      {/* TIR Consolidator Box */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-700/50 shadow-md">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold font-mono tracking-wider">
          <Sparkles className="w-4 h-4" />
          FÓRMULA MAESTRA: TOTAL INGRESOS RECIBIDOS TIR = (A) - (B) - (C)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              CANTIDAD S/ IVA
            </span>
            <div className="text-xl md:text-2xl font-black font-mono text-indigo-300 mt-1">
              ${tirSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              (A: ${aSinIva.toLocaleString()}) - (B: ${bPago.toLocaleString()}) - (C: ${cSinIva.toLocaleString()})
            </span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              IVA TRASLADADO NETO
            </span>
            <div className="text-xl md:text-2xl font-black font-mono text-emerald-400 mt-1">
              ${tirIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              (A: ${aIva.toLocaleString()}) - (B: ${bIva.toLocaleString()}) - (C: ${cIva.toLocaleString()})
            </span>
          </div>

          <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-400/40">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
              TOTAL C/ IVA (TIR FINAL)
            </span>
            <div className="text-2xl md:text-3xl font-black font-mono text-amber-400 mt-1">
              ${tirTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-indigo-200 mt-1 block">
              Remanente líquido del proyecto
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECCIÓN ( A ) PAGOS RECIBIDOS POR EL CLIENTE
      ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-blue-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 text-blue-200 flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-300 uppercase tracking-widest font-mono">
                SECCIÓN ( A )
              </div>
              <h3 className="text-base font-black text-white">
                PAGOS RECIBIDOS POR EL CLIENTE
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:pr-3">
              <span className="text-[10px] text-blue-200 uppercase font-mono block">Total Cobrado</span>
              <span className="text-sm font-black font-mono text-white">
                ${aTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => handleOpenPagoModal()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 no-print shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Cobro</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200 font-mono">
              <tr>
                <th className="py-2.5 px-3">FECHA</th>
                <th className="py-2.5 px-4 min-w-[220px]">OBSERVACIONES</th>
                <th className="py-2.5 px-3">FACTURA</th>
                <th className="py-2.5 px-3 text-right">PAGO S/IVA</th>
                <th className="py-2.5 px-3 text-right">IVA (16%)</th>
                <th className="py-2.5 px-3 text-right">TOTAL C/IVA</th>
                <th className="py-2.5 px-3 text-center no-print w-20">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cg.pagosCliente.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{p.fecha}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">{p.observaciones}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">{p.factura}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                    ${p.pagoSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    ${p.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-blue-900 bg-blue-50/50">
                    ${p.totalConIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenPagoModal(p)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        title="Editar pago"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            section: 'A',
                            id: p.id,
                            description: `${p.observaciones} (${p.factura})`,
                          })
                        }
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Eliminar pago"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50/80 border-t-2 border-blue-300 font-bold font-mono text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 tracking-widest text-blue-950 uppercase">
                  S &nbsp; U &nbsp; M &nbsp; A &nbsp; S &nbsp; ( A )
                </td>
                <td className="py-2.5 px-3 text-right text-slate-800">
                  ${aSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-800">
                  ${aIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-blue-950 font-black">
                  ${aTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================
          SECCIÓN ( B ) MANO DE OBRA
      ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-amber-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/30 text-amber-200 flex items-center justify-center font-bold text-sm">
              B
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-mono">
                SECCIÓN ( B )
              </div>
              <h3 className="text-base font-black text-white">
                MANO DE OBRA
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:pr-3">
              <span className="text-[10px] text-amber-200 uppercase font-mono block">Total Mano de Obra</span>
              <span className="text-sm font-black font-mono text-white">
                ${bTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => handleOpenMoModal()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 no-print shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Mano de Obra</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200 font-mono">
              <tr>
                <th className="py-2.5 px-3">FECHA</th>
                <th className="py-2.5 px-3">FIRMA</th>
                <th className="py-2.5 px-4 min-w-[200px]">CONTRATISTA / CONCEPTO</th>
                <th className="py-2.5 px-3 text-right">PAGO</th>
                <th className="py-2.5 px-3 text-right">TOTAL A LA FECHA</th>
                <th className="py-2.5 px-3 text-right">IVA</th>
                <th className="py-2.5 px-3 text-right">TOTAL C/IVA</th>
                <th className="py-2.5 px-3 text-center no-print w-20">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cg.manoObra.map((m) => (
                <tr key={m.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{m.fecha}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">{m.firma}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">{m.contratistaConcepto}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                    ${m.pago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    ${m.totalALaFecha.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    ${m.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-amber-950 bg-amber-50/50">
                    ${m.totalConIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenMoModal(m)}
                        className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                        title="Editar registro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            section: 'B',
                            id: m.id,
                            description: `${m.contratistaConcepto} (${m.firma})`,
                          })
                        }
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50/80 border-t-2 border-amber-300 font-bold font-mono text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 tracking-widest text-amber-950 uppercase">
                  T &nbsp; O &nbsp; T &nbsp; A &nbsp; L &nbsp; E &nbsp; S &nbsp; ( B )
                </td>
                <td className="py-2.5 px-3 text-right text-slate-800">
                  ${bPago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-800">
                  ${bTotalALaFecha.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-800">
                  ${bIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-amber-950 font-black">
                  ${bTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ========================================================
          SECCIÓN ( C ) MATERIALES
      ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-emerald-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/30 text-emerald-200 flex items-center justify-center font-bold text-sm">
              C
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest font-mono">
                SECCIÓN ( C )
              </div>
              <h3 className="text-base font-black text-white">
                MATERIALES
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:pr-3">
              <span className="text-[10px] text-emerald-200 uppercase font-mono block">Total Materiales</span>
              <span className="text-sm font-black font-mono text-white">
                ${cTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => handleOpenMatModal()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 no-print shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Material</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200 font-mono">
              <tr>
                <th className="py-2.5 px-3">FECHA</th>
                <th className="py-2.5 px-4 min-w-[200px]">EMPRESA</th>
                <th className="py-2.5 px-3">FACTURA</th>
                <th className="py-2.5 px-3 text-right">PAGO S/IVA</th>
                <th className="py-2.5 px-3 text-right">IVA (16%)</th>
                <th className="py-2.5 px-3 text-right">TOTAL</th>
                <th className="py-2.5 px-3 text-center no-print w-20">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cg.materiales.map((m) => (
                <tr key={m.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{m.fecha}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{m.empresa}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 whitespace-nowrap">{m.factura}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                    ${m.pagoSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    ${m.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-950 bg-emerald-50/50">
                    ${m.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenMatModal(m)}
                        className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                        title="Editar registro"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            section: 'C',
                            id: m.id,
                            description: `${m.empresa} (${m.factura})`,
                          })
                        }
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-emerald-50/80 border-t-2 border-emerald-300 font-bold font-mono text-slate-900">
                <td colSpan={3} className="py-2.5 px-4 tracking-widest text-emerald-950 uppercase">
                  T &nbsp; O &nbsp; T &nbsp; A &nbsp; L &nbsp; E &nbsp; S &nbsp; ( C )
                </td>
                <td className="py-2.5 px-3 text-right text-slate-800">
                  ${cSinIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-800">
                  ${cIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-950 font-black">
                  ${cTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal for A: Pagos Cliente */}
      {modalType === 'pagoCliente' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Editar Pago de Cliente (A)' : 'Registrar Pago Recibido (A)'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePago} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={pagoForm.fecha}
                  onChange={(e) => setPagoForm({ ...pagoForm, fecha: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones / Concepto</label>
                <textarea
                  value={pagoForm.observaciones}
                  onChange={(e) => setPagoForm({ ...pagoForm, observaciones: e.target.value })}
                  placeholder="Ej. Anticipo inicial 30%, Estimación 01..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Factura</label>
                <input
                  type="text"
                  value={pagoForm.factura}
                  onChange={(e) => setPagoForm({ ...pagoForm, factura: e.target.value })}
                  placeholder="FAC-D-101"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-blue-700 font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pago s/IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pagoForm.pagoSinIva}
                    onChange={(e) => {
                      const sin = parseFloat(e.target.value) || 0;
                      const calcIva = Number((sin * 0.16).toFixed(2));
                      setPagoForm({
                        ...pagoForm,
                        pagoSinIva: sin,
                        iva: calcIva,
                        totalConIva: Number((sin + calcIva).toFixed(2)),
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IVA (16%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pagoForm.iva}
                    onChange={(e) => {
                      const newIva = parseFloat(e.target.value) || 0;
                      setPagoForm({
                        ...pagoForm,
                        iva: newIva,
                        totalConIva: Number((pagoForm.pagoSinIva + newIva).toFixed(2)),
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total c/IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pagoForm.totalConIva}
                    onChange={(e) => setPagoForm({ ...pagoForm, totalConIva: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-white border border-blue-300 rounded-lg font-mono font-black text-blue-900"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for B: Mano de Obra */}
      {modalType === 'manoObra' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Editar Mano de Obra (B)' : 'Registrar Mano de Obra (B)'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMo} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={moForm.fecha}
                    onChange={(e) => setMoForm({ ...moForm, fecha: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Firma / Responsable</label>
                  <input
                    type="text"
                    value={moForm.firma}
                    onChange={(e) => setMoForm({ ...moForm, firma: e.target.value })}
                    placeholder="Arq. R. Morales"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contratista / Concepto</label>
                <textarea
                  value={moForm.contratistaConcepto}
                  onChange={(e) => setMoForm({ ...moForm, contratistaConcepto: e.target.value })}
                  placeholder="Ej. Modelado estructural, Levantamiento..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pago</label>
                  <input
                    type="number"
                    step="0.01"
                    value={moForm.pago}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const cIva = Number((val * 0.16).toFixed(2));
                      setMoForm({
                        ...moForm,
                        pago: val,
                        iva: cIva,
                        totalConIva: Number((val + cIva).toFixed(2)),
                        totalALaFecha: val,
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total a la Fecha</label>
                  <input
                    type="number"
                    step="0.01"
                    value={moForm.totalALaFecha}
                    onChange={(e) => setMoForm({ ...moForm, totalALaFecha: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={moForm.iva}
                    onChange={(e) => {
                      const newIva = parseFloat(e.target.value) || 0;
                      setMoForm({
                        ...moForm,
                        iva: newIva,
                        totalConIva: Number((moForm.pago + newIva).toFixed(2)),
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total c/IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={moForm.totalConIva}
                    onChange={(e) => setMoForm({ ...moForm, totalConIva: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-lg font-mono font-black text-amber-900"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for C: Materiales */}
      {modalType === 'material' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Editar Material (C)' : 'Registrar Material (C)'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMat} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={matForm.fecha}
                    onChange={(e) => setMatForm({ ...matForm, fecha: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Factura</label>
                  <input
                    type="text"
                    value={matForm.factura}
                    onChange={(e) => setMatForm({ ...matForm, factura: e.target.value })}
                    placeholder="F-PLT-882"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-700 font-bold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Empresa Proveedora</label>
                <input
                  type="text"
                  value={matForm.empresa}
                  onChange={(e) => setMatForm({ ...matForm, empresa: e.target.value })}
                  placeholder="Ej. Plotters & Copias del Centro"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pago s/IVA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={matForm.pagoSinIva}
                    onChange={(e) => {
                      const sin = parseFloat(e.target.value) || 0;
                      const cIva = Number((sin * 0.16).toFixed(2));
                      setMatForm({
                        ...matForm,
                        pagoSinIva: sin,
                        iva: cIva,
                        total: Number((sin + cIva).toFixed(2)),
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IVA (16%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={matForm.iva}
                    onChange={(e) => {
                      const newIva = parseFloat(e.target.value) || 0;
                      setMatForm({
                        ...matForm,
                        iva: newIva,
                        total: Number((matForm.pagoSinIva + newIva).toFixed(2)),
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={matForm.total}
                    onChange={(e) => setMatForm({ ...matForm, total: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-lg font-mono font-black text-emerald-900"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center">
            <div className="w-11 h-11 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">¿Eliminar registro?</h4>
            <p className="text-xs text-slate-500 mt-1">
              Está a punto de eliminar <span className="font-bold text-slate-800">{deleteConfirm.description}</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
