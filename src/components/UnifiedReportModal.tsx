import React from 'react';
import { ControlledProject } from '../types/projectControl';
import { ControlTipo1Store } from '../types/controlTipo1';
import { ControlTipo4DStore } from '../types/controlTipo4D';
import { exportUnifiedExcelTipo1 } from '../utils/unifiedReportTipo1';
import { exportUnifiedExcelTipo3M } from '../utils/unifiedReportTipo3M';
import { triggerPrintPDF } from '../utils/exportUtils';
import {
  FileSpreadsheet,
  Printer,
  X,
  Building2,
  FolderKanban,
  Calculator,
  HardHat,
  Truck,
  Package,
  ShoppingBag,
  BookOpen,
  CheckCircle2,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface UnifiedReportModalProps {
  project: ControlledProject;
  tipo1Data?: ControlTipo1Store;
  tipo3mData?: ControlTipo4DStore;
  onClose: () => void;
}

export const UnifiedReportModal: React.FC<UnifiedReportModalProps> = ({
  project,
  tipo1Data,
  tipo3mData,
  onClose,
}) => {
  const isTipo1 = project.controlType === 'tipo1' && tipo1Data;

  const handleExportExcel = () => {
    if (isTipo1 && tipo1Data) {
      exportUnifiedExcelTipo1(project, tipo1Data);
    } else if (tipo3mData) {
      exportUnifiedExcelTipo3M(project, tipo3mData);
    }
  };

  const handlePrintPDF = () => {
    triggerPrintPDF(`Dossier_Unificado_${project.code}_${project.name}`);
  };

  // Calculations for Tipo 1
  const t1Totals = isTipo1 && tipo1Data ? {
    aditivas: tipo1Data.presupuestoAditivas.aditivas.reduce((acc, a) => acc + a.total, 0),
    deductivas: tipo1Data.presupuestoAditivas.deductivas.reduce((acc, d) => acc + d.total, 0),
    presVigente: tipo1Data.presupuestoAditivas.presupuestoInicialTotal +
      tipo1Data.presupuestoAditivas.aditivas.reduce((acc, a) => acc + a.total, 0) -
      tipo1Data.presupuestoAditivas.deductivas.reduce((acc, d) => acc + d.total, 0),
    pagosRecibidos: tipo1Data.controlGeneral.pagosCliente.reduce((acc, p) => acc + p.total, 0),
    moTotal: tipo1Data.manoObra.reduce((acc, c) => acc + c.pagos.reduce((p, item) => p + item.totalConIva, 0), 0),
    moRet: tipo1Data.manoObra.reduce((acc, c) => acc + c.pagos.reduce((p, item) => p + item.retencion, 0), 0),
    subTotal: tipo1Data.subcontratos.reduce((acc, s) => acc + s.pagos.reduce((p, item) => p + item.totalConIva, 0), 0),
    subRet: tipo1Data.subcontratos.reduce((acc, s) => acc + s.pagos.reduce((p, item) => p + item.retencion, 0), 0),
    matTotal: tipo1Data.materiales.reduce((acc, m) => acc + m.compras.reduce((c, item) => c + item.total, 0), 0),
    matClienteTotal: tipo1Data.materialesCliente.reduce((acc, m) => acc + m.compras.reduce((c, item) => c + item.total, 0), 0),
  } : null;

  // Calculations for Tipo 3M
  const t3mTotals = !isTipo1 && tipo3mData ? {
    aSinIva: tipo3mData.controlGeneral.pagosCliente.reduce((acc, p) => acc + p.pagoSinIva, 0),
    aIva: tipo3mData.controlGeneral.pagosCliente.reduce((acc, p) => acc + p.iva, 0),
    aTotal: tipo3mData.controlGeneral.pagosCliente.reduce((acc, p) => acc + p.totalConIva, 0),
    bPago: tipo3mData.controlGeneral.manoObra.reduce((acc, m) => acc + m.pago, 0),
    bIva: tipo3mData.controlGeneral.manoObra.reduce((acc, m) => acc + m.iva, 0),
    bTotal: tipo3mData.controlGeneral.manoObra.reduce((acc, m) => acc + m.totalConIva, 0),
    cSinIva: tipo3mData.controlGeneral.materiales.reduce((acc, m) => acc + m.pagoSinIva, 0),
    cIva: tipo3mData.controlGeneral.materiales.reduce((acc, m) => acc + m.iva, 0),
    cTotal: tipo3mData.controlGeneral.materiales.reduce((acc, m) => acc + m.total, 0),
    tirSinIva: tipo3mData.controlGeneral.pagosCliente.reduce((acc, p) => acc + p.pagoSinIva, 0) -
      tipo3mData.controlGeneral.manoObra.reduce((acc, m) => acc + m.pago, 0) -
      tipo3mData.controlGeneral.materiales.reduce((acc, m) => acc + m.pagoSinIva, 0),
    tirTotal: tipo3mData.controlGeneral.pagosCliente.reduce((acc, p) => acc + p.totalConIva, 0) -
      tipo3mData.controlGeneral.manoObra.reduce((acc, m) => acc + m.totalConIva, 0) -
      tipo3mData.controlGeneral.materiales.reduce((acc, m) => acc + m.total, 0),
    matClienteTot: tipo3mData.materialesCliente.reduce((acc, p) => acc + p.compras.reduce((c, item) => c + item.total, 0), 0),
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                  REPORTE UNIFICADO
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {project.code} · {project.controlType === 'tipo1' ? '6 SUBMÓDULOS' : '3 SUBMÓDULOS'}
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {project.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Descargar libro Excel unificado con todas las secciones"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descargar Excel Unificado</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-xs"
              title="Imprimir o guardar en PDF todo el informe"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF Completo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 printable-dossier bg-slate-50 text-slate-900">
          {/* Document Header Page / Cover Strip */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest font-mono">
                  GRUPO CONSTRUCTOR ERP · REPORTE MAESTRO DE OBRA
                </div>
                <h1 className="text-2xl font-black text-slate-900 mt-1">
                  {project.name}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Cliente: <span className="font-semibold text-slate-800">{project.client}</span> ·
                  Empresa Facturadora: <span className="font-semibold text-slate-800">{project.billingCompany}</span>
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs">
                <span className="text-slate-400 block text-[10px]">CÓDIGO DE PROYECTO</span>
                <span className="text-lg font-black text-slate-900">{project.code}</span>
                <span className="text-slate-400 block text-[10px] mt-1">FECHA DE EMISIÓN</span>
                <span className="font-semibold text-slate-700">{new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })}</span>
              </div>
            </div>

            {/* Quick KPI Strip */}
            {isTipo1 && t1Totals && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Presupuesto Vigente</span>
                  <span className="text-base font-black font-mono text-slate-900 mt-0.5 block">
                    ${t1Totals.presVigente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">Pagos Recibidos</span>
                  <span className="text-base font-black font-mono text-blue-800 mt-0.5 block">
                    ${t1Totals.pagosRecibidos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">Gastos Ejercidos</span>
                  <span className="text-base font-black font-mono text-amber-800 mt-0.5 block">
                    ${(t1Totals.moTotal + t1Totals.subTotal + t1Totals.matTotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Fondo de Garantía (5%)</span>
                  <span className="text-base font-black font-mono text-emerald-800 mt-0.5 block">
                    ${(t1Totals.moRet + t1Totals.subRet).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {!isTipo1 && t3mTotals && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">(A) Cobros Cliente</span>
                  <span className="text-base font-black font-mono text-blue-800 mt-0.5 block">
                    ${t3mTotals.aTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">(B) Mano de Obra</span>
                  <span className="text-base font-black font-mono text-amber-800 mt-0.5 block">
                    ${t3mTotals.bTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">(C) Materiales</span>
                  <span className="text-base font-black font-mono text-emerald-800 mt-0.5 block">
                    ${t3mTotals.cTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-[10px] text-indigo-700 font-bold uppercase block">TIR Total Líquido</span>
                  <span className="text-base font-black font-mono text-indigo-900 mt-0.5 block">
                    ${t3mTotals.tirTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              CONTENIDO DETALLADO: CONTROL TIPO 1 (6 SUBMÓDULOS)
          ======================================================== */}
          {isTipo1 && tipo1Data && t1Totals && (
            <div className="space-y-6">
              {/* 1. Control General */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FolderKanban className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">01. Control General y Cobros de Cliente</h3>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-mono font-bold text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Fecha</th>
                        <th className="py-2 px-3">Estimación</th>
                        <th className="py-2 px-3">Observaciones</th>
                        <th className="py-2 px-3 text-right">Pago s/IVA</th>
                        <th className="py-2 px-3 text-right">IVA</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tipo1Data.controlGeneral.pagosCliente.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 px-3 font-mono">{p.fecha}</td>
                          <td className="py-2 px-3 font-semibold text-blue-700">{p.estimacion}</td>
                          <td className="py-2 px-3">{p.observaciones}</td>
                          <td className="py-2 px-3 text-right font-mono">${p.pagoSinIva.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-mono">${p.iva.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">${p.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Presupuesto y Aditivas */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">02. Presupuesto Base y Modificaciones Contractuales</h3>
                </div>
                <div className="mt-4 text-xs space-y-2">
                  <div className="flex justify-between py-2 px-3 bg-slate-50 rounded-lg font-mono">
                    <span className="font-bold">Presupuesto Inicial Contratado:</span>
                    <span className="font-bold text-slate-900">${tipo1Data.presupuestoAditivas.presupuestoInicialTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-emerald-50 rounded-lg font-mono text-emerald-800">
                    <span>(+) Total Aditivas Aprobadas ({tipo1Data.presupuestoAditivas.aditivas.length} partidas):</span>
                    <span className="font-bold">+${t1Totals.aditivas.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 px-3 bg-rose-50 rounded-lg font-mono text-rose-800">
                    <span>(-) Total Deductivas ({tipo1Data.presupuestoAditivas.deductivas.length} partidas):</span>
                    <span className="font-bold">-${t1Totals.deductivas.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 px-3 bg-slate-900 text-white rounded-lg font-mono text-sm font-bold">
                    <span>(=) Presupuesto Final Actualizado:</span>
                    <span className="text-amber-400">${t1Totals.presVigente.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 3. Mano de Obra */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <HardHat className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-bold text-slate-900">03. Mano de Obra y Destajos Semanales</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-700">
                    Retenido 5%: ${t1Totals.moRet.toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {tipo1Data.manoObra.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl text-xs">
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>{c.nombre}</span>
                        <span className="font-mono">Cotizado: ${c.cotizacion.toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mb-2">
                        {c.pagos.length} pagos registrados · Retención acumulada: ${c.pagos.reduce((a, p) => a + p.retencion, 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Subcontratos */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base font-bold text-slate-900">04. Subcontratistas y Proveedores Especializados</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-700">
                    Total Ejercido: ${t1Totals.subTotal.toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {tipo1Data.subcontratos.map((s) => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-xl text-xs">
                      <div className="flex justify-between font-bold text-slate-800 mb-1">
                        <span>{s.nombre}</span>
                        <span className="font-mono">Contratado: ${(s.cotizacion + s.aditivas).toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {s.pagos.length} estimaciones pagadas · Retención fondo garantía: ${s.pagos.reduce((a, p) => a + p.retencion, 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Materiales */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-600" />
                    <h3 className="text-base font-bold text-slate-900">05. Materiales de Obra (Proveedores Directos)</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    Total: ${t1Totals.matTotal.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {tipo1Data.materiales.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-800 block truncate">{p.empresaProveedora}</span>
                      <span className="text-xs text-slate-500 font-mono mt-1 block">
                        {p.compras.length} compras · Total: ${p.compras.reduce((a, c) => a + c.total, 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Materiales Compras Cliente */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-bold text-slate-900">06. Materiales Compras de Cliente</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700">
                    Total: ${t1Totals.matClienteTotal.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {tipo1Data.materialesCliente.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-800 block truncate">{p.empresaProveedora}</span>
                      <span className="text-xs text-slate-500 font-mono mt-1 block">
                        {p.compras.length} compras · Total: ${p.compras.reduce((a, c) => a + c.total, 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              CONTENIDO DETALLADO: CONTROL TIPO 3M / 4D (3 SUBMÓDULOS)
          ======================================================== */}
          {!isTipo1 && tipo3mData && t3mTotals && (
            <div className="space-y-6">
              {/* 1. Control General TIR */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">01. Control General: TIR = (A) - (B) - (C)</h3>
                </div>
                <div className="mt-4 p-4 bg-indigo-950 text-white rounded-xl font-mono text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-indigo-300 uppercase block font-bold">Total Ingresos Recibidos (TIR)</span>
                    <span className="text-xl font-black text-amber-400 mt-0.5 block">${t3mTotals.tirTotal.toLocaleString()}</span>
                  </div>
                  <div className="text-right text-[11px] text-indigo-200">
                    <div>(A) Cobros: ${t3mTotals.aTotal.toLocaleString()}</div>
                    <div>(B) Mano de Obra: -${t3mTotals.bTotal.toLocaleString()}</div>
                    <div>(C) Materiales: -${t3mTotals.cTotal.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* 2. Bitácora */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">02. Bitácora de Obra y Observaciones</h3>
                </div>
                <div className="mt-4 space-y-2">
                  {tipo3mData.bitacora.map((b, i) => (
                    <div key={b.id} className="p-3 bg-slate-50 rounded-xl text-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                        <span>Entrada #{i + 1} · {b.fecha}</span>
                        <span className="font-bold text-slate-700">{b.autor}</span>
                      </div>
                      <p className="text-slate-800">{b.comentariosObservaciones}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Materiales Compras Cliente */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-bold text-slate-900">03. Materiales Compras de Cliente</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700">
                    Total: ${t3mTotals.matClienteTot.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {tipo3mData.materialesCliente.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-slate-800 block truncate">{p.empresaProveedora}</span>
                      <span className="text-xs text-slate-500 font-mono mt-1 block">
                        {p.compras.length} compras · Total: ${p.compras.reduce((a, c) => a + c.total, 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document Signatures Footer */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs font-mono text-slate-500">
            <div className="border-t border-slate-300 pt-3">
              <span className="font-bold text-slate-800 block">Residente de Obra / Proyectos</span>
              <span>Revisó y Concilió</span>
            </div>
            <div className="border-t border-slate-300 pt-3">
              <span className="font-bold text-slate-800 block">Administración & Finanzas</span>
              <span>Validación Fiscal y Bancaria</span>
            </div>
            <div className="border-t border-slate-300 pt-3">
              <span className="font-bold text-slate-800 block">Socio Director</span>
              <span>Autorización Final</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
