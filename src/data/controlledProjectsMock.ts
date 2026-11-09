import { ControlledProject } from '../types/projectControl';

export const INITIAL_CONTROLLED_PROJECTS: ControlledProject[] = [
  {
    id: 'proj-p0-00',
    code: 'P0-00',
    name: 'Residencia Campestre Vista Bella',
    client: 'Desarrollos Residenciales del Norte S.A.',
    billingCompany: 'Proyectos y Edificaciones Santa Fe S.A. de C.V.',
    controlType: 'tipo1',
    status: 'en_captura',
    initialBudget: 4060000,
    startDate: '2026-09-01',
    notes: 'Proyecto residencial integral con 6 submódulos operativos conciliados.',
  },
  {
    id: 'proj-p0-01',
    code: 'P0-01',
    name: 'Plaza Palmas & Corporativo 4D (Diseño Ejecutivo)',
    client: 'Grupo Inmobiliario del Bajío S.A.P.I.',
    billingCompany: 'Constructora e Inmobiliaria Metropolitana S.A.',
    controlType: 'tipo3m',
    status: 'en_captura',
    initialBudget: 1250000,
    startDate: '2026-10-01',
    notes: 'Diseño arquitectónico ejecutivo con fórmula TIR=(A)-(B)-(C), bitácora y compras directas.',
  },
];
