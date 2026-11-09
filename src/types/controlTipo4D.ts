export interface Tipo4DPagoCliente {
  id: string;
  fecha: string;
  observaciones: string;
  factura: string;
  pagoSinIva: number;
  iva: number;
  totalConIva: number;
}

export interface Tipo4DManoObra {
  id: string;
  fecha: string;
  firma: string;
  contratistaConcepto: string;
  pago: number;
  totalALaFecha: number;
  iva: number;
  totalConIva: number;
}

export interface Tipo4DMaterialGasto {
  id: string;
  fecha: string;
  empresa: string;
  factura: string;
  pagoSinIva: number;
  iva: number;
  total: number;
}

export interface Tipo4DControlGeneral {
  diseno: string; // CONTROL DE DISEÑO: ________
  noHoja: string; // No. de hoja: ____
  nota: string;
  pagosCliente: Tipo4DPagoCliente[]; // ( A )
  manoObra: Tipo4DManoObra[]; // ( B )
  materiales: Tipo4DMaterialGasto[]; // ( C )
}

export interface Tipo4DBitacoraEntry {
  id: string;
  fecha: string;
  comentariosObservaciones: string;
  autor?: string;
  prioridad?: 'baja' | 'media' | 'alta';
  estado?: 'pendiente' | 'en_proceso' | 'atendida';
}

export interface Tipo4DMaterialClienteItem {
  id: string;
  fecha: string;
  ordenCompra: string;
  concepto: string;
  factura: string;
  pagoSinIva: number;
  iva: number;
  total: number;
}

export interface Tipo4DMaterialClienteProveedor {
  id: string;
  empresaProveedora: string;
  compras: Tipo4DMaterialClienteItem[];
}

export interface ControlTipo4DStore {
  controlGeneral: Tipo4DControlGeneral;
  bitacora: Tipo4DBitacoraEntry[];
  materialesCliente: Tipo4DMaterialClienteProveedor[];
}
