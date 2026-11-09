export interface ClientPayment {
  id: string;
  fecha: string;
  observaciones: string;
  estimacion: string;
  tipoPago: string; // Transferencia, Cheque, Efectivo
  pagoSinIva: number;
  iva: number;
  total: number;
}

export interface ControlGeneralData {
  fechaActualizacion: string;
  presupuestoObraSinIva: number;
  presupuestoObraIva: number;
  presupuestoObraTotal: number;
  aditivasSinIva: number;
  aditivasIva: number;
  aditivasTotal: number;
  deductivasSinIva: number;
  deductivasIva: number;
  deductivasTotal: number;
  costoReconocidoConImss: number;
  costoReconocidoSinImss: number;
  utilidadPorReconocer: number;
  sobreCostoPronosticado: number;
  notas: string[];
  pagosCliente: ClientPayment[];
  honorariosImprevistosPagos: ClientPayment[];
}

export interface PresupuestoAditivaItem {
  id: string;
  tipo: 'aditiva' | 'deductiva';
  fecha: string;
  numero: string; // No. AD o No. DE
  concepto: string;
  comprobante: string; // Factura o Nota de crédito
  cantSinIva: number;
  iva: number;
  total: number;
}

export interface PresupuestoAditivasData {
  fechaActualizacion: string;
  presupuestoInicialSinIva: number;
  presupuestoInicialIva: number;
  presupuestoInicialTotal: number;
  aditivas: PresupuestoAditivaItem[];
  deductivas: PresupuestoAditivaItem[];
}

export interface ManoObraPayment {
  id: string;
  fecha: string;
  concepto: string;
  pago: number;
  retencion: number;
  total: number;
  iva: number;
  totalConIva: number;
  esPagoRetencion?: boolean;
}

export interface ManoObraContratista {
  id: string;
  nombre: string;
  cotizacion: number;
  aditivasYDeductivas: number;
  porcentajeRetencion: number; // e.g. 0.05
  pagos: ManoObraPayment[];
  observaciones?: string;
}

export interface SubcontratoPayment {
  id: string;
  fecha: string;
  conceptoFactura: string;
  pago: number;
  retencion: number;
  total: number;
  iva: number;
  totalConIva: number;
  esPagoRetencion?: boolean;
}

export interface SubcontratoContratista {
  id: string;
  nombre: string;
  cotizacion: number;
  aditivas: number;
  porcentajeRetencion: number;
  pagos: SubcontratoPayment[];
  observaciones?: string;
}

export interface MaterialItem {
  id: string;
  fecha: string;
  ordenCompra: string;
  concepto: string;
  factura: string;
  pagoSinIva: number;
  iva: number;
  total: number;
}

export interface MaterialProveedor {
  id: string;
  empresaProveedora: string;
  compras: MaterialItem[];
}

export interface ControlTipo1Store {
  controlGeneral: ControlGeneralData;
  presupuestoAditivas: PresupuestoAditivasData;
  manoObra: ManoObraContratista[];
  subcontratos: SubcontratoContratista[];
  materiales: MaterialProveedor[];
  materialesCliente: MaterialProveedor[];
}
