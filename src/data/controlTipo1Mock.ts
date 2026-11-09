import { ControlTipo1Store } from '../types/controlTipo1';

export const INITIAL_CONTROL_TIPO1_DATA: ControlTipo1Store = {
  controlGeneral: {
    fechaActualizacion: new Date().toISOString().split('T')[0],
    presupuestoObraSinIva: 3500000,
    presupuestoObraIva: 560000,
    presupuestoObraTotal: 4060000,
    aditivasSinIva: 245000,
    aditivasIva: 39200,
    aditivasTotal: 284200,
    deductivasSinIva: 60000,
    deductivasIva: 9600,
    deductivasTotal: 69600,
    costoReconocidoConImss: 420000,
    costoReconocidoSinImss: 380000,
    utilidadPorReconocer: 650000,
    sobreCostoPronosticado: 0.05,
    notas: [
      'Obra prototipo tipo 1 en ejecución según calendario contractual.',
      'Pagos de estimaciones conciliados con estados de cuenta bancarios.',
      'Retenciones de mano de obra en custodia para entrega de finiquito.'
    ],
    pagosCliente: [
      {
        id: 'pc-1',
        fecha: '2026-09-15',
        observaciones: 'Anticipo inicial 30% según contrato',
        estimacion: 'Anticipo',
        tipoPago: 'Transferencia SPEI',
        pagoSinIva: 1050000,
        iva: 168000,
        total: 1218000
      },
      {
        id: 'pc-2',
        fecha: '2026-10-05',
        observaciones: 'Estimación 01 cimentación y muros',
        estimacion: 'Estimación 01',
        tipoPago: 'Transferencia SPEI',
        pagoSinIva: 680000,
        iva: 108800,
        total: 788800
      },
      {
        id: 'pc-3',
        fecha: '2026-10-25',
        observaciones: 'Estimación 02 losas entrepiso nivel 1',
        estimacion: 'Estimación 02',
        tipoPago: 'Transferencia SPEI',
        pagoSinIva: 540000,
        iva: 86400,
        total: 626400
      }
    ],
    honorariosImprevistosPagos: [
      {
        id: 'hi-1',
        fecha: '2026-10-01',
        observaciones: 'Pago honorarios de supervisión residente quincena 1',
        estimacion: 'Supervisión 01',
        tipoPago: 'Transferencia',
        pagoSinIva: 45000,
        iva: 7200,
        total: 52200
      }
    ]
  },

  presupuestoAditivas: {
    fechaActualizacion: new Date().toISOString().split('T')[0],
    presupuestoInicialSinIva: 3500000,
    presupuestoInicialIva: 560000,
    presupuestoInicialTotal: 4060000,
    aditivas: [
      {
        id: 'ad-1',
        tipo: 'aditiva',
        fecha: '2026-09-28',
        numero: 'AD-01',
        concepto: 'Ampliación de zapatas aisladas por mecánica de suelos',
        comprobante: 'FAC-8901',
        cantSinIva: 145000,
        iva: 23200,
        total: 168200
      },
      {
        id: 'ad-2',
        tipo: 'aditiva',
        fecha: '2026-10-18',
        numero: 'AD-02',
        concepto: 'Instalación de salidas eléctricas adicionales en área técnica',
        comprobante: 'FAC-9140',
        cantSinIva: 100000,
        iva: 16000,
        total: 116000
      }
    ],
    deductivas: [
      {
        id: 'de-1',
        tipo: 'deductiva',
        fecha: '2026-10-10',
        numero: 'DE-01',
        concepto: 'Cancelación de cancelería en bodega posterior',
        comprobante: 'NC-4402',
        cantSinIva: 60000,
        iva: 9600,
        total: 69600
      }
    ]
  },

  manoObra: [
    {
      id: 'mo-1',
      nombre: 'Cuadrilla Estructuras Ing. Ramón Pérez',
      cotizacion: 680000,
      aditivasYDeductivas: 45000,
      porcentajeRetencion: 0.05,
      observaciones: 'Retención del 5% liberable a las 2 semanas tras entrega final',
      pagos: [
        {
          id: 'mop-1',
          fecha: '2026-09-20',
          concepto: 'Semana 38: Armado y colado de zapatas y contratrabes',
          pago: 76000,
          retencion: 4000,
          total: 80000,
          iva: 12800,
          totalConIva: 92800,
          esPagoRetencion: false
        },
        {
          id: 'mop-2',
          fecha: '2026-09-27',
          concepto: 'Semana 39: Cimbra y colado de columnas nivel planta baja',
          pago: 90250,
          retencion: 4750,
          total: 95000,
          iva: 15200,
          totalConIva: 110200,
          esPagoRetencion: false
        },
        {
          id: 'mop-3',
          fecha: '2026-10-04',
          concepto: 'Semana 40: Armado de losa maciza entrepiso 1',
          pago: 85500,
          retencion: 4500,
          total: 90000,
          iva: 14400,
          totalConIva: 104400,
          esPagoRetencion: false
        }
      ]
    },
    {
      id: 'mo-2',
      nombre: 'Cuadrilla Albañilería Mtro. Juan Carmona',
      cotizacion: 420000,
      aditivasYDeductivas: 0,
      porcentajeRetencion: 0.05,
      observaciones: 'Muros de block y aplanados de yeso',
      pagos: [
        {
          id: 'mop-4',
          fecha: '2026-10-12',
          concepto: 'Semana 41: Levantamiento muros de block planta baja',
          pago: 47500,
          retencion: 2500,
          total: 50000,
          iva: 8000,
          totalConIva: 58000,
          esPagoRetencion: false
        }
      ]
    }
  ],

  subcontratos: [
    {
      id: 'sub-1',
      nombre: 'Instalaciones Hidrosanitarias del Valle S.A.',
      cotizacion: 350000,
      aditivas: 25000,
      porcentajeRetencion: 0.05,
      observaciones: 'Red hidráulica y sanitaria en PVC sanitario y CPVC',
      pagos: [
        {
          id: 'subp-1',
          fecha: '2026-09-30',
          conceptoFactura: 'FAC-2041: Tendido de tubería sanitaria y registros pluviales',
          pago: 95000,
          retencion: 5000,
          total: 100000,
          iva: 16000,
          totalConIva: 116000,
          esPagoRetencion: false
        },
        {
          id: 'subp-2',
          fecha: '2026-10-20',
          conceptoFactura: 'FAC-2105: Columnas de bajada pluvial y pruebas hidrostáticas',
          pago: 71250,
          retencion: 3750,
          total: 75000,
          iva: 12000,
          totalConIva: 87000,
          esPagoRetencion: false
        }
      ]
    },
    {
      id: 'sub-2',
      nombre: 'Ingeniería y Diseños Eléctricos Lumen',
      cotizacion: 280000,
      aditivas: 15000,
      porcentajeRetencion: 0.05,
      observaciones: 'Canalizaciones, tableros y acometida principal CFE',
      pagos: [
        {
          id: 'subp-3',
          fecha: '2026-10-15',
          conceptoFactura: 'FAC-781: Ranurado y tubería conduit en losas',
          pago: 57000,
          retencion: 3000,
          total: 60000,
          iva: 9600,
          totalConIva: 69600,
          esPagoRetencion: false
        }
      ]
    }
  ],

  materiales: [
    {
      id: 'mat-1',
      empresaProveedora: 'Cemex Concretos S.A. de C.V.',
      compras: [
        {
          id: 'mati-1',
          fecha: '2026-09-18',
          ordenCompra: 'OC-MAT-010',
          concepto: 'Concreto f\'c=250 kg/cm2 bombeable tmax 3/4',
          factura: 'FAC-CMX-901',
          pagoSinIva: 125000,
          iva: 20000,
          total: 145000
        },
        {
          id: 'mati-2',
          fecha: '2026-10-02',
          ordenCompra: 'OC-MAT-015',
          concepto: 'Concreto f\'c=200 kg/cm2 para firmes y plantilla',
          factura: 'FAC-CMX-955',
          pagoSinIva: 68000,
          iva: 10880,
          total: 78880
        }
      ]
    },
    {
      id: 'mat-2',
      empresaProveedora: 'Aceros y Perfiles Monterrey',
      compras: [
        {
          id: 'mati-3',
          fecha: '2026-09-12',
          ordenCompra: 'OC-MAT-004',
          concepto: 'Varilla corrugada #3, #4 y #5 grado 42 (12 toneladas)',
          factura: 'F-ACR-881',
          pagoSinIva: 184000,
          iva: 29440,
          total: 213440
        },
        {
          id: 'mati-4',
          fecha: '2026-10-14',
          ordenCompra: 'OC-MAT-021',
          concepto: 'Alambrón, alambre recocido y clavos para cimbra',
          factura: 'F-ACR-940',
          pagoSinIva: 24500,
          iva: 3920,
          total: 28420
        }
      ]
    }
  ],

  materialesCliente: [
    {
      id: 'matc-1',
      empresaProveedora: 'Interceramic México (Suministro directo cliente)',
      compras: [
        {
          id: 'matci-1',
          fecha: '2026-10-16',
          ordenCompra: 'CLI-OC-01',
          concepto: 'Porcelanato 60x60 rectificado modelo Pietra Grey 350 m2',
          factura: 'CLI-FAC-1102',
          pagoSinIva: 112000,
          iva: 17920,
          total: 129920
        }
      ]
    },
    {
      id: 'matc-2',
      empresaProveedora: 'Helvex Proveeduría Directa',
      compras: [
        {
          id: 'matci-2',
          fecha: '2026-10-22',
          ordenCompra: 'CLI-OC-02',
          concepto: 'Mezcladoras para lavabo y fluxómetros ecológicos',
          factura: 'CLI-FAC-5509',
          pagoSinIva: 48000,
          iva: 7680,
          total: 55680
        }
      ]
    }
  ]
};
