import { ControlTipo4DStore } from '../types/controlTipo4D';

export const INITIAL_CONTROL_TIPO4D_DATA: ControlTipo4DStore = {
  controlGeneral: {
    diseno: 'DISEÑO Y ARQUITECTURA P0-00 - RESIDENCIAL CAMPESTRE',
    noHoja: '01 / 04',
    nota: 'Favor de usar letra legible y de molde.',
    pagosCliente: [
      {
        id: 't4p-1',
        fecha: '2026-10-01',
        observaciones: 'Anticipo inicial 30% según contrato de diseño ejecutivo',
        factura: 'FAC-D-101',
        pagoSinIva: 180000,
        iva: 28800,
        totalConIva: 208800,
      },
      {
        id: 't4p-2',
        fecha: '2026-10-18',
        observaciones: 'Estimación 01: Planos arquitectónicos y modelos 3D volumétricos',
        factura: 'FAC-D-109',
        pagoSinIva: 125000,
        iva: 20000,
        totalConIva: 145000,
      },
      {
        id: 't4p-3',
        fecha: '2026-11-02',
        observaciones: 'Estimación 02: Ingenierías estructurales e hidrosanitarias',
        factura: 'FAC-D-120',
        pagoSinIva: 95000,
        iva: 15200,
        totalConIva: 110200,
      },
    ],
    manoObra: [
      {
        id: 't4mo-1',
        fecha: '2026-10-08',
        firma: 'Arq. R. Morales',
        contratistaConcepto: 'Levantamiento topográfico y estudio de mecánica de suelos',
        pago: 28000,
        totalALaFecha: 28000,
        iva: 4480,
        totalConIva: 32480,
      },
      {
        id: 't4mo-2',
        fecha: '2026-10-22',
        firma: 'Ing. D. Alcocer',
        contratistaConcepto: 'Cálculo y modelado estructural de losas postensadas',
        pago: 36000,
        totalALaFecha: 64000,
        iva: 5760,
        totalConIva: 41760,
      },
      {
        id: 't4mo-3',
        fecha: '2026-11-05',
        firma: 'Arq. V. Santos',
        contratistaConcepto: 'Renders fotorrealistas y recorridos virtuales 4K',
        pago: 22000,
        totalALaFecha: 86000,
        iva: 3520,
        totalConIva: 25520,
      },
    ],
    materiales: [
      {
        id: 't4m-1',
        fecha: '2026-10-05',
        empresa: 'Plotters & Copias del Centro',
        factura: 'F-PLT-882',
        pagoSinIva: 6400,
        iva: 1024,
        total: 7424,
      },
      {
        id: 't4m-2',
        fecha: '2026-10-15',
        empresa: 'Maquetas & Modelos Escala S.A.',
        factura: 'F-MQ-301',
        pagoSinIva: 18500,
        iva: 2960,
        total: 21460,
      },
      {
        id: 't4m-3',
        fecha: '2026-11-03',
        empresa: 'Papelería Técnica y Suministros CAD',
        factura: 'F-CAD-109',
        pagoSinIva: 4200,
        iva: 672,
        total: 4872,
      },
    ],
  },
  bitacora: [
    {
      id: 'bit-1',
      fecha: '2026-10-03',
      comentariosObservaciones:
        'Reunión de arranque con el cliente. Se acordaron las alturas libres de 3.20m en área social y doble altura en estancia principal.',
      autor: 'Arq. Residente / Proyectos',
      prioridad: 'media',
      estado: 'atendida',
    },
    {
      id: 'bit-2',
      fecha: '2026-10-14',
      comentariosObservaciones:
        'Ajuste en la cimentación sugerido por el calculista debido al estrato arcilloso a 2.50m de profundidad. Se propone losa de cimentación con contratrabes.',
      autor: 'Ing. Estructural',
      prioridad: 'alta',
      estado: 'atendida',
    },
    {
      id: 'bit-3',
      fecha: '2026-10-28',
      comentariosObservaciones:
        'El cliente solicita cotizar integración de sistema de paneles fotovoltaicos en azotea y preparación para cargador de auto eléctrico en cochera.',
      autor: 'Arq. Proyectista',
      prioridad: 'alta',
      estado: 'en_proceso',
    },
    {
      id: 'bit-4',
      fecha: '2026-11-06',
      comentariosObservaciones:
        'Revisión y validación de acabados en mármol y carpinterías para áreas húmedas. En espera de aprobación final de muestras físicas por parte del cliente.',
      autor: 'Coordinador de Obra',
      prioridad: 'media',
      estado: 'pendiente',
    },
  ],
  materialesCliente: [
    {
      id: 't4mc-1',
      empresaProveedora: 'Luminarias & Diseño Vanguardia S.A.',
      compras: [
        {
          id: 't4mci-1',
          fecha: '2026-10-12',
          ordenCompra: 'CLI-4D-001',
          concepto: 'Luminarias magnéticas empotrables y spots dimerizables DALI',
          factura: 'FAC-LUM-440',
          pagoSinIva: 78000,
          iva: 12480,
          total: 90480,
        },
        {
          id: 't4mci-2',
          fecha: '2026-10-25',
          ordenCompra: 'CLI-4D-002',
          concepto: 'Tiras LED cálidas 2700K y controladores inteligentes para cajillos',
          factura: 'FAC-LUM-512',
          pagoSinIva: 24500,
          iva: 3920,
          total: 28420,
        },
      ],
    },
    {
      id: 't4mc-2',
      empresaProveedora: 'Mármoles y Cuarzos Exclusivos',
      compras: [
        {
          id: 't4mci-3',
          fecha: '2026-11-04',
          ordenCompra: 'CLI-4D-003',
          concepto: 'Placas de mármol Calacatta Gold para isla y cubierta de cocina',
          factura: 'FAC-MRM-881',
          pagoSinIva: 165000,
          iva: 26400,
          total: 191400,
        },
      ],
    },
  ],
};

export const createEmptyControlTipo4DData = (projectName: string = ''): ControlTipo4DStore => ({
  controlGeneral: {
    diseno: projectName ? `CONTROL DE DISEÑO Y OBRA - ${projectName.toUpperCase()}` : '',
    noHoja: '01 / 01',
    nota: 'Favor de usar letra legible y de molde.',
    pagosCliente: [],
    manoObra: [],
    materiales: [],
  },
  bitacora: [],
  materialesCliente: [],
});
