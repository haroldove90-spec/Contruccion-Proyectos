import { ControlledProject } from '../types/projectControl';
import { ControlTipo1Store } from '../types/controlTipo1';
import { exportToCSV } from './exportUtils';

export function exportUnifiedExcelTipo1(project: ControlledProject, data: ControlTipo1Store) {
  const headers = ['Sección / Módulo', 'Fecha', 'Ref / No.', 'Descripción / Concepto', 'Comprobante / Factura', 'Subtotal (s/IVA)', 'IVA (16%)', 'Total (c/IVA)'];
  const rows: (string | number)[][] = [];

  // ==================== CARÁTULA ====================
  rows.push(['=== REPORTE UNIFICADO CONSOLIDADO DE OBRA ===', '', '', '', '', '', '', '']);
  rows.push(['PROYECTO', project.name, 'CÓDIGO', project.code, 'TIPO', 'Control_Tipo1_P0-00 (6 Submódulos)', '', '']);
  rows.push(['CLIENTE', project.client, 'EMPRESA FACTURADORA', project.billingCompany, '', '', '', '']);
  rows.push(['FECHA EMISIÓN', new Date().toLocaleDateString('es-MX'), 'ESTADO', project.status.toUpperCase(), '', '', '', '']);
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== 1. CONTROL GENERAL ====================
  const cg = data.controlGeneral;
  const totAditivas = data.presupuestoAditivas.aditivas.reduce((acc, a) => acc + a.total, 0);
  const totDeductivas = data.presupuestoAditivas.deductivas.reduce((acc, d) => acc + d.total, 0);
  const presTotal = data.presupuestoAditivas.presupuestoInicialTotal + totAditivas - totDeductivas;

  const moTotal = data.manoObra.reduce((acc, c) => acc + c.pagos.reduce((p, item) => p + item.totalConIva, 0), 0);
  const moRet = data.manoObra.reduce((acc, c) => acc + c.pagos.reduce((p, item) => p + item.retencion, 0), 0);

  const subTotal = data.subcontratos.reduce((acc, s) => acc + s.pagos.reduce((p, item) => p + item.totalConIva, 0), 0);
  const subRet = data.subcontratos.reduce((acc, s) => acc + s.pagos.reduce((p, item) => p + item.retencion, 0), 0);

  const matTotal = data.materiales.reduce((acc, m) => acc + m.compras.reduce((c, item) => c + item.total, 0), 0);
  const matClienteTotal = data.materialesCliente.reduce((acc, m) => acc + m.compras.reduce((c, item) => c + item.total, 0), 0);

  const pagosRecibidos = cg.pagosCliente.reduce((acc, p) => acc + p.total, 0);
  const gastosTotales = moTotal + subTotal + matTotal;
  const saldoEnCuenta = pagosRecibidos - gastosTotales;

  rows.push(['--- 01. RESUMEN EJECUTIVO / CONTROL GENERAL ---', '', '', '', '', '', '', '']);
  rows.push(['1.1 Presupuesto Total Vigente', '', '', 'Contrato + Aditivas - Deductivas', '', '', '', presTotal]);
  rows.push(['1.2 Total Pagos Recibidos Cliente', '', '', `${cg.pagosCliente.length} estimaciones cobradas`, '', '', '', pagosRecibidos]);
  rows.push(['1.3 Gastos Totales Ejercidos', '', '', 'Mano de Obra + Subcontratos + Materiales', '', '', '', gastosTotales]);
  rows.push(['1.4 Retenciones de Garantía Acumuladas', '', '', 'Fondo de garantía en resguardo (5%)', '', '', '', moRet + subRet]);
  rows.push(['1.5 Saldo Disponible en Cuenta', '', '', 'Remanente líquido de obra', '', '', '', saldoEnCuenta]);
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== 2. PRESUPUESTO Y ADITIVAS ====================
  rows.push(['--- 02. PRESUPUESTO INICIAL, ADITIVAS Y DEDUCTIVAS ---', '', '', '', '', '', '', '']);
  rows.push(['Presupuesto Inicial', '', 'BASE', 'Presupuesto Inicial Contratado', 'CONTRATO', data.presupuestoAditivas.presupuestoInicialSinIva, data.presupuestoAditivas.presupuestoInicialIva, data.presupuestoAditivas.presupuestoInicialTotal]);

  data.presupuestoAditivas.aditivas.forEach((a) => {
    rows.push(['Aditiva', a.fecha, a.numero, a.concepto, a.comprobante, a.cantSinIva, a.iva, a.total]);
  });
  data.presupuestoAditivas.deductivas.forEach((d) => {
    rows.push(['Deductiva (-)', d.fecha, d.numero, d.concepto, d.comprobante, -d.cantSinIva, -d.iva, -d.total]);
  });
  rows.push(['SUBTOTAL PRESUPUESTO VIGENTE', '', '', '', '', '', '', presTotal]);
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== 3. MANO DE OBRA ====================
  rows.push(['--- 03. MANO DE OBRA Y RETENCIONES (5%) ---', '', '', '', '', '', '', '']);
  data.manoObra.forEach((c) => {
    rows.push([`Contratista: ${c.nombre}`, '', `Cotiz: $${c.cotizacion}`, c.observaciones || '', '', '', `Retención: ${(c.porcentajeRetencion * 100)}%`, '']);
    c.pagos.forEach((p) => {
      rows.push(['Mano de Obra', p.fecha, p.esPagoRetencion ? 'FINIQUITO' : 'DESTAJO', p.concepto, `Ret: $${p.retencion}`, p.pago, p.iva, p.totalConIva]);
    });
  });
  rows.push(['TOTAL MANO DE OBRA EJERCIDO', '', '', '', `Total Retenido: $${moRet}`, '', '', moTotal]);
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== 4. SUBCONTRATOS ====================
  rows.push(['--- 04. SUBCONTRATOS Y PROVEEDORES ESPECIALIZADOS ---', '', '', '', '', '', '', '']);
  data.subcontratos.forEach((s) => {
    rows.push([`Subcontrato: ${s.nombre}`, '', `Cotiz: $${s.cotizacion}`, s.observaciones || '', '', '', `Retención: ${(s.porcentajeRetencion * 100)}%`, '']);
    s.pagos.forEach((p) => {
      rows.push(['Subcontratista', p.fecha, p.esPagoRetencion ? 'FINIQUITO' : 'ESTIMACIÓN', p.conceptoFactura, `Ret: $${p.retencion}`, p.pago, p.iva, p.totalConIva]);
    });
  });
  rows.push(['TOTAL SUBCONTRATOS EJERCIDO', '', '', '', `Total Retenido: $${subRet}`, '', '', subTotal]);
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== 5. MATERIALES DE OBRA ====================
  rows.push(['--- 05. CONTROL DE MATERIALES DE OBRA ---', '', '', '', '', '', '', '']);
  data.materiales.forEach((prov) => {
    rows.push([`Proveedor: ${prov.empresaProveedora}`, '', '', '', '', '', '', '']);
    prov.compras.forEach((c) => {
      rows.push(['Material Obra', c.fecha, c.ordenCompra, c.concepto, c.factura, c.pagoSinIva, c.iva, c.total]);
    });
  });
  rows.push(['TOTAL MATERIALES DE OBRA', '', '', '', '', '', '', matTotal]);
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== 6. MATERIALES COMPRAS DE CLIENTE ====================
  rows.push(['--- 06. MATERIALES COMPRAS DE CLIENTE ---', '', '', '', '', '', '', '']);
  data.materialesCliente.forEach((prov) => {
    rows.push([`Proveedor Cliente: ${prov.empresaProveedora}`, '', '', '', '', '', '', '']);
    prov.compras.forEach((c) => {
      rows.push(['Suministro Cliente', c.fecha, c.ordenCompra, c.concepto, c.factura, c.pagoSinIva, c.iva, c.total]);
    });
  });
  rows.push(['TOTAL MATERIALES SUMINISTRADOS POR CLIENTE', '', '', '', '', '', '', matClienteTotal]);

  const cleanName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
  exportToCSV(`Reporte_Unificado_${project.code}_${cleanName}`, headers, rows);
}
