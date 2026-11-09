import { ControlledProject } from '../types/projectControl';
import { ControlTipo4DStore } from '../types/controlTipo4D';
import { exportToCSV } from './exportUtils';

export function exportUnifiedExcelTipo3M(project: ControlledProject, data: ControlTipo4DStore) {
  const headers = ['Sección / Módulo', 'Fecha', 'Ref / Clave', 'Concepto / Descripción', 'Factura / Responsable', 'Subtotal (s/IVA)', 'IVA (16%)', 'Total (c/IVA)'];
  const rows: (string | number)[][] = [];

  const cg = data.controlGeneral;
  const aSinIva = cg.pagosCliente.reduce((acc, p) => acc + p.pagoSinIva, 0);
  const aIva = cg.pagosCliente.reduce((acc, p) => acc + p.iva, 0);
  const aTotal = cg.pagosCliente.reduce((acc, p) => acc + p.totalConIva, 0);

  const bPago = cg.manoObra.reduce((acc, m) => acc + m.pago, 0);
  const bIva = cg.manoObra.reduce((acc, m) => acc + m.iva, 0);
  const bTotal = cg.manoObra.reduce((acc, m) => acc + m.totalConIva, 0);

  const cSinIva = cg.materiales.reduce((acc, m) => acc + m.pagoSinIva, 0);
  const cIva = cg.materiales.reduce((acc, m) => acc + m.iva, 0);
  const cTotal = cg.materiales.reduce((acc, m) => acc + m.total, 0);

  const tirSinIva = aSinIva - bPago - cSinIva;
  const tirIva = aIva - bIva - cIva;
  const tirTotal = aTotal - bTotal - cTotal;

  // ==================== CARÁTULA ====================
  rows.push(['=== REPORTE UNIFICADO CONSOLIDADO TIPO 3M / 4D ===', '', '', '', '', '', '', '']);
  rows.push(['PROYECTO', project.name, 'CÓDIGO', project.code, 'TIPO', 'Control_Tipo3M_P0-00 (3 Submódulos)', '', '']);
  rows.push(['CLIENTE', project.client, 'EMPRESA FACTURADORA', project.billingCompany, '', '', '', '']);
  rows.push(['DISEÑO', cg.diseno, 'NO. HOJA', cg.noHoja, 'EMISIÓN', new Date().toLocaleDateString('es-MX'), '', '']);
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== RESUMEN TIR ====================
  rows.push(['--- 01. CONTROL GENERAL: TOTAL INGRESOS RECIBIDOS TIR = (A) - (B) - (C) ---', '', '', '', '', '', '', '']);
  rows.push(['(A) Pagos Recibidos por Cliente', '', '', `${cg.pagosCliente.length} pagos`, '', aSinIva, aIva, aTotal]);
  rows.push(['(B) Mano de Obra Acumulada', '', '', `${cg.manoObra.length} registros`, '', bPago, bIva, bTotal]);
  rows.push(['(C) Materiales de Diseño / Obra', '', '', `${cg.materiales.length} partidas`, '', cSinIva, cIva, cTotal]);
  rows.push(['TIR RESULTANTE LÍQUIDO', '', '', 'Fórmula: TIR=(A)-(B)-(C)', '', tirSinIva, tirIva, tirTotal]);
  rows.push(['', '', '', '', '', '', '', '']);

  // Detalle Sección A
  rows.push(['[Detalle Sección A: Pagos Recibidos del Cliente]', '', '', '', '', '', '', '']);
  cg.pagosCliente.forEach((p) => {
    rows.push(['(A) Pago Cliente', p.fecha, 'ING', p.observaciones, p.factura, p.pagoSinIva, p.iva, p.totalConIva]);
  });
  rows.push(['', '', '', '', '', '', '', '']);

  // Detalle Sección B
  rows.push(['[Detalle Sección B: Mano de Obra]', '', '', '', '', '', '', '']);
  cg.manoObra.forEach((m) => {
    rows.push(['(B) Mano Obra', m.fecha, 'MO', m.contratistaConcepto, m.firma, m.pago, m.iva, m.totalConIva]);
  });
  rows.push(['', '', '', '', '', '', '', '']);

  // Detalle Sección C
  rows.push(['[Detalle Sección C: Materiales]', '', '', '', '', '', '', '']);
  cg.materiales.forEach((m) => {
    rows.push(['(C) Materiales', m.fecha, 'MAT', m.empresa, m.factura, m.pagoSinIva, m.iva, m.total]);
  });
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== 02. BITÁCORA Y OBSERVACIONES ====================
  rows.push(['--- 02. BITÁCORA DE OBRA Y OBSERVACIONES DE DISEÑO ---', '', '', '', '', '', '', '']);
  data.bitacora.forEach((b, i) => {
    rows.push([`Bitácora #${i + 1}`, b.fecha, (b.prioridad || 'media').toUpperCase(), b.comentariosObservaciones, b.autor || 'Residente', b.estado || 'atendida', '', '']);
  });
  rows.push(['', '', '', '', '', '', '', '']);

  // ==================== 03. MATERIALES COMPRAS DE CLIENTE ====================
  rows.push(['--- 03. MATERIALES COMPRAS DE CLIENTES ---', '', '', '', '', '', '', '']);
  let totMatCliente = 0;
  data.materialesCliente.forEach((prov) => {
    rows.push([`Proveedor: ${prov.empresaProveedora}`, '', '', '', '', '', '', '']);
    prov.compras.forEach((c) => {
      totMatCliente += c.total;
      rows.push(['Suministro Cliente 3M', c.fecha, c.ordenCompra, c.concepto, c.factura, c.pagoSinIva, c.iva, c.total]);
    });
  });
  rows.push(['TOTAL COMPRAS DE CLIENTE', '', '', '', '', '', '', totMatCliente]);

  const cleanName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
  exportToCSV(`Reporte_Unificado_${project.code}_${cleanName}`, headers, rows);
}
