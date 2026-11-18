import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  fetchAllCDOFromSupabase,
  dbUpsertCompany,
  dbDeleteCompany,
  dbUpsertClient,
  dbDeleteClient,
  dbUpsertProject,
  dbDeleteProject,
  dbUpsertAccount,
  dbDeleteAccount,
  dbUpsertConcept,
  dbDeleteConcept,
  dbUpsertIncome,
  dbDeleteIncome,
  dbUpsertExpense,
  dbDeleteExpense,
  dbUpsertLoanCredit,
  dbDeleteLoanCredit,
  dbUpsertNotification,
  dbUpsertUser,
  dbDeleteUser,
  dbClearMovementsToZero,
  dbSyncFullSnapshot,
} from '../lib/cdoSupabaseSync';
import { sha256Hex } from '../lib/hash';

export interface CDOUser {
  id: string;
  fullName: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'administracion';
  email?: string;
  phone?: string;
  position?: string;
}

export interface CODCompany {
  id: string;
  name: string;
  shortName: string;
  rfc?: string;
}

export interface CODClient {
  id: string;
  name: string;
  rfc?: string;
  contact?: string;
}

export interface CODCostCenter {
  id: string;
  name: string;
  clientId?: string;
  clientName?: string;
  companyId: string;
}

export interface CODAccount {
  id: string;
  name: string;
  accountNumber?: string;
  type: 'banco' | 'efectivo';
  companyId: string;
  initialBalance: number;
}

export interface CODAccountComputed extends CODAccount {
  companyName: string;
  totalIncomes: number;
  totalExpenses: number;
  currentBalance: number;
}

export interface CODConceptItem {
  id: string;
  name: string;
  kind: 'ingreso' | 'egreso';
}

export interface CODIncome {
  id: string;
  movNumber: number;
  concept: string;
  date: string;
  companyId: string;
  companyName: string;
  clientId?: string;
  clientName?: string;
  subtotal: number;
  iva: number;
  total: number;
  accountId: string;
  accountName: string;
  projectId?: string;
  projectName?: string;
  timestamp: number;
}

export type ExpenseKind = 'gasto' | 'prestamo' | 'credito_bancario' | 'abono_prestamo';
export type ExpenseApprovalStatus = 'pendiente' | 'autorizado' | 'rechazado';

export interface CODExpense {
  id: string;
  movNumber: number;
  concept: string;
  date: string;
  projectId: string;
  projectName: string;
  clientId?: string;
  clientName?: string;
  companyId: string;
  companyName: string;
  subtotal: number;
  iva: number;
  total: number;
  accountId: string;
  accountName: string;
  capturedVia: 'Manual' | 'WhatsApp OCR';
  expenseKind: ExpenseKind;
  linkedLoanId?: string;
  approvalStatus: ExpenseApprovalStatus;
  requestedByUserId?: string;
  requestedByName?: string;
  reviewedByUserId?: string;
  reviewedByName?: string;
  reviewedAt?: number;
  rejectionReason?: string;
  timestamp: number;
}

export interface CDOLoanCredit {
  id: string;
  kind: 'prestamo' | 'credito_bancario';
  title: string;
  institution: string;
  cardLast4?: string;
  date: string;
  dueDate?: string;
  companyId: string;
  companyName: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  accountId?: string;
  accountName?: string;
  originalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  sourceExpenseId?: string;
  status: 'activo' | 'liquidado' | 'pendiente_autorizacion' | 'rechazado';
  notes?: string;
  requestedByUserId?: string;
  requestedByName?: string;
  timestamp: number;
}

export interface CDONotification {
  id: string;
  type: 'solicitud_egreso' | 'solicitud_prestamo' | 'egreso_autorizado' | 'egreso_rechazado';
  targetRole: 'admin' | 'administracion';
  title: string;
  message: string;
  expenseId?: string;
  loanId?: string;
  amount?: number;
  accountName?: string;
  companyName?: string;
  projectName?: string;
  clientName?: string;
  expenseKind?: ExpenseKind;
  createdByUserId: string;
  createdByName: string;
  readByUserIds: string[];
  actionStatus?: 'pendiente' | 'autorizado' | 'rechazado';
  rejectionReason?: string;
  timestamp: number;
}

export interface CODSyncBanner {
  id: string;
  kind: 'ingreso' | 'egreso' | 'cuenta' | 'catalogo' | 'perfil' | 'prestamo' | 'notificacion';
  title: string;
  detail: string;
  isError?: boolean;
  timestamp: number;
}

export const INITIAL_CDO_USERS: CDOUser[] = [
  {
    id: 'usr-luis',
    fullName: 'Luis Treviño',
    username: 'luis_trevi',
    passwordHash: sha256Hex('Chevropar#1970'),
    role: 'admin',
    email: '',
    phone: '',
    position: 'Director / Admin',
  },
  {
    id: 'usr-contadora',
    fullName: 'Contadora General',
    username: 'contadora',
    passwordHash: sha256Hex('Contadora_123'),
    role: 'administracion',
    email: '',
    phone: '',
    position: 'Administración y Contabilidad',
  },
  {
    id: 'usr-harold',
    fullName: 'Harold Anguiano',
    username: 'haroldo90',
    passwordHash: sha256Hex('Chevropar#1970'),
    role: 'admin',
    email: '',
    phone: '',
    position: 'Socio / Admin',
  },
];

export const INITIAL_COD_COMPANIES: CODCompany[] = [
  { id: 'sa-1', name: 'S.A. Constructora 1', shortName: 'Constructora 1', rfc: 'CON200115AB1' },
  { id: 'sa-2', name: 'S.A. Inmobiliaria 2', shortName: 'Inmobiliaria 2', rfc: 'INM190422CD2' },
  { id: 'sa-3', name: 'S.A. Fabricación 3', shortName: 'Fabricación 3', rfc: 'FAB210810EF3' },
];

export const INITIAL_COD_CLIENTS: CODClient[] = [
  { id: 'cli-1', name: 'Desarrollos Juárez S.A.', rfc: 'DJU180312XX1', contact: 'Lic. Mariana Ortiz' },
  { id: 'cli-2', name: 'Grupo Corporativo Reforma', rfc: 'GCR150908YY2', contact: 'Ing. Arturo Méndez' },
  { id: 'cli-3', name: 'Comercializadora del Norte', rfc: 'CNO201105ZZ3', contact: 'Arq. Sofía Garza' },
];

export const INITIAL_COD_COST_CENTERS: CODCostCenter[] = [
  { id: 'obra-juarez', name: 'Obra Juárez 150', clientId: 'cli-1', clientName: 'Desarrollos Juárez S.A.', companyId: 'sa-1' },
  { id: 'obra-corp', name: 'Corporativo Reforma', clientId: 'cli-2', clientName: 'Grupo Corporativo Reforma', companyId: 'sa-2' },
  { id: 'obra-mob', name: 'Obra Mobiliario Especial', clientId: 'cli-3', clientName: 'Comercializadora del Norte', companyId: 'sa-3' },
  { id: 'obra-nave', name: 'Nave Industrial Norte', clientId: 'cli-1', clientName: 'Desarrollos Juárez S.A.', companyId: 'sa-1' },
  { id: 'obra-plaza', name: 'Plaza Mirador', clientId: 'cli-2', clientName: 'Grupo Corporativo Reforma', companyId: 'sa-2' },
];

export const INITIAL_COD_ACCOUNTS: CODAccount[] = [
  { id: 'acc-banorte', name: 'Banorte', accountNumber: '0184-9921', type: 'banco', companyId: 'sa-1', initialBalance: 200000 },
  { id: 'acc-ixe', name: 'IXE', accountNumber: '4420-1105', type: 'banco', companyId: 'sa-2', initialBalance: 150000 },
  { id: 'acc-banregio', name: 'Banregio', accountNumber: '8871-3044', type: 'banco', companyId: 'sa-3', initialBalance: 80000 },
  { id: 'acc-efectivo', name: 'Caja Chica / Efectivo', accountNumber: 'CAJA-01', type: 'efectivo', companyId: 'sa-1', initialBalance: 0 },
];

export const INITIAL_COD_CONCEPTS: CODConceptItem[] = [
  { id: 'con-ing-1', name: 'Anticipo de Obra', kind: 'ingreso' },
  { id: 'con-ing-2', name: 'Estimación de Obra', kind: 'ingreso' },
  { id: 'con-ing-3', name: 'Finiquito de Contrato', kind: 'ingreso' },
  { id: 'con-ing-4', name: 'Venta de Mobiliario / Equipo', kind: 'ingreso' },
  { id: 'con-ing-5', name: 'Aditiva / Trabajo Extra', kind: 'ingreso' },
  { id: 'con-egr-1', name: 'Materiales de Construcción', kind: 'egreso' },
  { id: 'con-egr-2', name: 'Mano de Obra / Nómina', kind: 'egreso' },
  { id: 'con-egr-3', name: 'Subcontratos Especializados', kind: 'egreso' },
  { id: 'con-egr-4', name: 'Renta de Maquinaria y Equipo', kind: 'egreso' },
  { id: 'con-egr-5', name: 'Combustible, Fletes y Viáticos', kind: 'egreso' },
  { id: 'con-egr-6', name: 'Gastos Administrativos y Oficina', kind: 'egreso' },
];

export const INITIAL_COD_INCOMES: CODIncome[] = [
  {
    id: 'inc-1',
    movNumber: 1,
    concept: 'Anticipo Obra Juárez 150',
    date: '2026-11-01',
    companyId: 'sa-1',
    companyName: 'S.A. Constructora 1',
    clientId: 'cli-1',
    clientName: 'Desarrollos Juárez S.A.',
    subtotal: 500000,
    iva: 80000,
    total: 580000,
    accountId: 'acc-banorte',
    accountName: 'Banorte',
    projectId: 'obra-juarez',
    projectName: 'Obra Juárez 150',
    timestamp: 1793577600000,
  },
  {
    id: 'inc-2',
    movNumber: 2,
    concept: 'Estimación 1 - Corporativo',
    date: '2026-11-05',
    companyId: 'sa-2',
    companyName: 'S.A. Inmobiliaria 2',
    clientId: 'cli-2',
    clientName: 'Grupo Corporativo Reforma',
    subtotal: 300000,
    iva: 48000,
    total: 348000,
    accountId: 'acc-ixe',
    accountName: 'IXE',
    projectId: 'obra-corp',
    projectName: 'Corporativo Reforma',
    timestamp: 1793923200000,
  },
  {
    id: 'inc-3',
    movNumber: 3,
    concept: 'Venta de Mobiliario Especial',
    date: '2026-11-10',
    companyId: 'sa-3',
    companyName: 'S.A. Fabricación 3',
    clientId: 'cli-3',
    clientName: 'Comercializadora del Norte',
    subtotal: 150000,
    iva: 24000,
    total: 174000,
    accountId: 'acc-banregio',
    accountName: 'Banregio',
    projectId: 'obra-mob',
    projectName: 'Obra Mobiliario Especial',
    timestamp: 1794355200000,
  },
];

export const INITIAL_COD_EXPENSES: CODExpense[] = [
  {
    id: 'egr-1',
    movNumber: 1,
    concept: 'Acero y Varilla · Aceros del Norte',
    date: '2026-11-02',
    projectId: 'obra-juarez',
    projectName: 'Obra Juárez 150',
    companyId: 'sa-1',
    companyName: 'S.A. Constructora 1',
    subtotal: 45000,
    iva: 7200,
    total: 52200,
    accountId: 'acc-banorte',
    accountName: 'Banorte',
    capturedVia: 'Manual',
    expenseKind: 'gasto',
    approvalStatus: 'autorizado',
    timestamp: 1793664000000,
  },
  {
    id: 'egr-2',
    movNumber: 2,
    concept: 'Concreto Premezclado · Cemex',
    date: '2026-11-06',
    projectId: 'obra-corp',
    projectName: 'Corporativo Reforma',
    companyId: 'sa-2',
    companyName: 'S.A. Inmobiliaria 2',
    subtotal: 120000,
    iva: 19200,
    total: 139200,
    accountId: 'acc-ixe',
    accountName: 'IXE',
    capturedVia: 'Manual',
    expenseKind: 'gasto',
    approvalStatus: 'autorizado',
    timestamp: 1794009600000,
  },
  {
    id: 'egr-3',
    movNumber: 3,
    concept: 'Tablero Melamina y Herrajes · Ticket #4481',
    date: '2026-11-11',
    projectId: 'obra-mob',
    projectName: 'Obra Mobiliario Especial',
    companyId: 'sa-3',
    companyName: 'S.A. Fabricación 3',
    subtotal: 35000,
    iva: 5600,
    total: 40600,
    accountId: 'acc-banregio',
    accountName: 'Banregio',
    capturedVia: 'WhatsApp OCR',
    expenseKind: 'gasto',
    approvalStatus: 'autorizado',
    timestamp: 1794441600000,
  },
];

export const INITIAL_COD_LOANS_CREDITS: CDOLoanCredit[] = [
  {
    id: 'loan-1',
    kind: 'prestamo',
    title: 'Préstamo Capital de Trabajo · Obra Juárez 150',
    institution: 'Financiera Regio',
    date: '2026-11-03',
    dueDate: '2027-02-03',
    companyId: 'sa-1',
    companyName: 'S.A. Constructora 1',
    clientId: 'cli-1',
    clientName: 'Desarrollos Juárez S.A.',
    projectId: 'obra-juarez',
    projectName: 'Obra Juárez 150',
    accountId: 'acc-banorte',
    accountName: 'Banorte',
    originalAmount: 50000,
    paidAmount: 10000,
    remainingAmount: 40000,
    status: 'activo',
    notes: 'Préstamo asignado a arranque de cimentación',
    timestamp: 1793750400000,
  },
  {
    id: 'loan-2',
    kind: 'credito_bancario',
    title: 'Tarjeta Corporativa Banorte · Materiales',
    institution: 'Banorte',
    cardLast4: '4421',
    date: '2026-11-08',
    dueDate: '2026-12-15',
    companyId: 'sa-2',
    companyName: 'S.A. Inmobiliaria 2',
    clientId: 'cli-2',
    clientName: 'Grupo Corporativo Reforma',
    projectId: 'obra-corp',
    projectName: 'Corporativo Reforma',
    accountId: 'acc-ixe',
    accountName: 'IXE',
    originalAmount: 85000,
    paidAmount: 25000,
    remainingAmount: 60000,
    status: 'activo',
    notes: 'Línea revolvente para insumos de obra',
    timestamp: 1794182400000,
  },
];

export interface AddCODIncomeInput {
  concept: string;
  date: string;
  companyId: string;
  subtotal: number;
  accountId: string;
  projectId?: string;
  clientId?: string;
}

export interface AddCODExpenseInput {
  concept: string;
  date: string;
  projectId: string;
  clientId?: string;
  companyId: string;
  accountId: string;
  subtotal: number;
  capturedVia: 'Manual' | 'WhatsApp OCR';
  expenseKind?: ExpenseKind;
  loanInstitution?: string;
  cardLast4?: string;
  dueDate?: string;
  linkedLoanId?: string;
}

export interface AddCDOLoanCreditInput {
  kind: 'prestamo' | 'credito_bancario';
  title: string;
  institution: string;
  cardLast4?: string;
  date: string;
  dueDate?: string;
  companyId: string;
  clientId?: string;
  projectId?: string;
  accountId?: string;
  originalAmount: number;
  paidAmount?: number;
  notes?: string;
}

export interface AddCODAccountInput {
  name: string;
  accountNumber?: string;
  type: 'banco' | 'efectivo';
  companyId: string;
  initialBalance: number;
}

interface CODContextType {
  users: CDOUser[];
  currentUser: CDOUser | null;
  login: (username: string, password: string) => { ok: true; user: CDOUser } | { ok: false; error: string };
  logout: () => void;
  updateCurrentUserProfile: (data: {
    fullName: string;
    username: string;
    email?: string;
    phone?: string;
    position?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  changeCurrentUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  upsertTeamUser: (data: {
    id?: string;
    fullName: string;
    username: string;
    role: 'admin' | 'administracion';
    password?: string;
    email?: string;
    phone?: string;
    position?: string;
  }) => Promise<{ ok: true; user: CDOUser } | { ok: false; error: string }>;
  deleteTeamUser: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;

  companies: CODCompany[];
  clients: CODClient[];
  costCenters: CODCostCenter[];
  accounts: CODAccountComputed[];
  concepts: CODConceptItem[];
  incomes: CODIncome[];
  expenses: CODExpense[];
  loansCredits: CDOLoanCredit[];
  notifications: CDONotification[];
  unreadNotificationsCount: number;
  pendingApprovalsCount: number;
  selectedCompanyFilter: string;
  setSelectedCompanyFilter: (id: string) => void;
  lastSync: CODSyncBanner | null;
  clearLastSync: () => void;

  // Incomes CRUD
  addIncome: (input: AddCODIncomeInput) => CODIncome;
  updateIncome: (id: string, input: AddCODIncomeInput) => void;
  deleteIncome: (id: string) => void;

  // Expenses CRUD & Approvals
  addExpense: (input: AddCODExpenseInput) => CODExpense;
  updateExpense: (id: string, input: AddCODExpenseInput) => void;
  deleteExpense: (id: string) => void;
  approveExpense: (expenseId: string) => void;
  rejectExpense: (expenseId: string, reason?: string) => void;

  // Loans & Bank Credit Cards CRUD
  addLoanCredit: (input: AddCDOLoanCreditInput) => CDOLoanCredit;
  updateLoanCredit: (id: string, data: Partial<Omit<CDOLoanCredit, 'id'>>) => void;
  registerLoanPayment: (
    loanId: string,
    amount: number,
    options?: { deductFromAccountId?: string; date?: string; notes?: string }
  ) => void;
  approveLoanDirect: (loanId: string) => void;
  rejectLoanDirect: (loanId: string, reason?: string) => void;
  deleteLoanCredit: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Companies (S.A.) CRUD
  addCompany: (name: string, shortName?: string, rfc?: string) => CODCompany;
  updateCompany: (id: string, data: Partial<Omit<CODCompany, 'id'>>) => void;
  deleteCompany: (id: string) => boolean;

  // Clients CRUD
  addClient: (name: string, rfc?: string, contact?: string) => CODClient;
  updateClient: (id: string, data: Partial<Omit<CODClient, 'id'>>) => void;
  deleteClient: (id: string) => void;

  // Projects / Obras (Cost Centers) CRUD
  addCostCenter: (name: string, companyId: string, clientId?: string) => CODCostCenter;
  updateCostCenter: (id: string, data: Partial<Omit<CODCostCenter, 'id'>>) => void;
  deleteCostCenter: (id: string) => void;

  // Accounts (Banks & Cash) CRUD
  addAccount: (input: AddCODAccountInput) => CODAccount;
  updateAccount: (id: string, data: Partial<Omit<CODAccount, 'id'>>) => void;
  updateAccountInitialBalance: (accountId: string, newInitialBalance: number) => void;
  deleteAccount: (id: string) => boolean;

  // Concepts CRUD
  addConcept: (name: string, kind: 'ingreso' | 'egreso') => CODConceptItem;
  deleteConcept: (id: string) => void;

  // Client Data Reset / Start from Zero
  clearMovementsToZero: () => void;
  clearAllToZero: () => void;
  resetCODData: () => void;
}

const CODContext = createContext<CODContextType | undefined>(undefined);

const STORAGE_KEYS = {
  version: 'pc_cdo_schema_v2',
  users: 'pc_cdo_v2_users',
  sessionUserId: 'pc_cdo_session_user_id',
  companies: 'pc_cdo_v2_companies',
  clients: 'pc_cdo_v2_clients',
  costCenters: 'pc_cdo_v2_obras',
  accounts: 'pc_cdo_v2_accounts',
  concepts: 'pc_cdo_v2_concepts',
  incomes: 'pc_cdo_v2_incomes',
  expenses: 'pc_cdo_v2_expenses',
  loans: 'pc_cdo_v2_loans',
  notifications: 'pc_cdo_v2_notifications',
};

function loadCODStored<T>(key: string, fallback: T): T {
  if (localStorage.getItem(STORAGE_KEYS.version) !== '2') {
    return fallback;
  }
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const CODProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('pc_cdo_company_filter') ||
        sessionStorage.getItem('pc_cdo_company_filter') ||
        'ALL'
      );
    } catch {
      return 'ALL';
    }
  });

  const [users, setUsers] = useState<CDOUser[]>(() =>
    loadCODStored(STORAGE_KEYS.users, INITIAL_CDO_USERS)
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEYS.sessionUserId) ||
        sessionStorage.getItem(STORAGE_KEYS.sessionUserId) ||
        null
      );
    } catch {
      return null;
    }
  });

  const [companies, setCompanies] = useState<CODCompany[]>(() =>
    loadCODStored(STORAGE_KEYS.companies, INITIAL_COD_COMPANIES)
  );
  const [clients, setClients] = useState<CODClient[]>(() =>
    loadCODStored(STORAGE_KEYS.clients, INITIAL_COD_CLIENTS)
  );
  const [rawCostCenters, setRawCostCenters] = useState<CODCostCenter[]>(() =>
    loadCODStored(STORAGE_KEYS.costCenters, INITIAL_COD_COST_CENTERS)
  );
  const [baseAccounts, setBaseAccounts] = useState<CODAccount[]>(() =>
    loadCODStored(STORAGE_KEYS.accounts, INITIAL_COD_ACCOUNTS)
  );
  const [concepts, setConcepts] = useState<CODConceptItem[]>(() =>
    loadCODStored(STORAGE_KEYS.concepts, INITIAL_COD_CONCEPTS)
  );
  const [rawIncomes, setRawIncomes] = useState<CODIncome[]>(() =>
    loadCODStored(STORAGE_KEYS.incomes, INITIAL_COD_INCOMES)
  );
  const [rawExpenses, setRawExpenses] = useState<CODExpense[]>(() =>
    loadCODStored(STORAGE_KEYS.expenses, INITIAL_COD_EXPENSES).map((exp) => ({
      ...exp,
      expenseKind: exp.expenseKind || 'gasto',
      approvalStatus: exp.approvalStatus || 'autorizado',
    }))
  );
  const [rawLoans, setRawLoans] = useState<CDOLoanCredit[]>(() =>
    loadCODStored(STORAGE_KEYS.loans, INITIAL_COD_LOANS_CREDITS)
  );
  const [notifications, setNotifications] = useState<CDONotification[]>(() =>
    loadCODStored(STORAGE_KEYS.notifications, [])
  );
  const [lastSync, setLastSync] = useState<CODSyncBanner | null>(null);

  const persistToSupabase = (promise: Promise<unknown>, errorTitle: string) => {
    void promise.catch((err) => {
      const msg = err instanceof Error ? err.message : 'Error de conexión con Supabase';
      console.error(`${errorTitle}:`, err);
      setLastSync({
        id: `sync-err-${Date.now()}`,
        kind: 'catalogo',
        title: errorTitle,
        detail: msg,
        isError: true,
        timestamp: Date.now(),
      });
    });
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.version, '2');
  }, []);

  // Silent Supabase hydration on mount
  useEffect(() => {
    let active = true;
    fetchAllCDOFromSupabase().then((remote) => {
      if (!active || !remote) return;
      if (remote.users.length > 0) {
        setUsers(remote.users);
      }
      if (!remote.hasCoreRows) return;

      setCompanies(remote.companies);
      setClients(remote.clients);
      setRawCostCenters(remote.costCenters);
      setBaseAccounts(remote.accounts);
      if (remote.concepts.length > 0) setConcepts(remote.concepts);
      setRawIncomes(remote.incomes);
      setRawExpenses(
        remote.expenses.map((exp) => ({
          ...exp,
          expenseKind: exp.expenseKind || 'gasto',
          approvalStatus: exp.approvalStatus || 'autorizado',
        }))
      );
      if (remote.loansLoaded) {
        if (remote.loansCredits.length > 0 || (remote.incomes.length === 0 && remote.expenses.length === 0)) {
          setRawLoans(remote.loansCredits);
        }
      }
      if (remote.notificationsLoaded) {
        setNotifications(remote.notifications);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('pc_cdo_company_filter', selectedCompanyFilter);
      sessionStorage.setItem('pc_cdo_company_filter', selectedCompanyFilter);
    } catch {
      // ignore
    }
  }, [selectedCompanyFilter]);

  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(STORAGE_KEYS.sessionUserId, currentUserId);
        sessionStorage.setItem(STORAGE_KEYS.sessionUserId, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.sessionUserId);
        sessionStorage.removeItem(STORAGE_KEYS.sessionUserId);
      }
    } catch {
      // ignore
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.companies, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.costCenters, JSON.stringify(rawCostCenters));
  }, [rawCostCenters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(baseAccounts));
  }, [baseAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.concepts, JSON.stringify(concepts));
  }, [concepts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.incomes, JSON.stringify(rawIncomes));
  }, [rawIncomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(rawExpenses));
  }, [rawExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.loans, JSON.stringify(rawLoans));
  }, [rawLoans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
  }, [notifications]);

  const currentUser = useMemo<CDOUser | null>(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const login = (
    username: string,
    password: string
  ): { ok: true; user: CDOUser } | { ok: false; error: string } => {
    const normalized = username.trim().toLowerCase();
    if (!normalized || !password) {
      return { ok: false, error: 'Ingresa tu usuario y contraseña.' };
    }
    const matched = users.find((u) => u.username.toLowerCase() === normalized);
    if (!matched) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' };
    }
    const pwdHash = sha256Hex(password);
    if (matched.passwordHash !== pwdHash) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' };
    }
    setCurrentUserId(matched.id);
    try {
      localStorage.setItem(STORAGE_KEYS.sessionUserId, matched.id);
      sessionStorage.setItem(STORAGE_KEYS.sessionUserId, matched.id);
    } catch {
      // ignore
    }
    return { ok: true, user: matched };
  };

  const logout = () => {
    setCurrentUserId(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.sessionUserId);
      sessionStorage.removeItem(STORAGE_KEYS.sessionUserId);
    } catch {
      // ignore
    }
  };

  const updateCurrentUserProfile = async (data: {
    fullName: string;
    username: string;
    email?: string;
    phone?: string;
    position?: string;
  }): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!currentUser) return { ok: false, error: 'No hay sesión activa.' };
    const cleanFullName = data.fullName.trim();
    const cleanUsername = data.username.trim().toLowerCase();
    if (!cleanFullName || !cleanUsername) {
      return { ok: false, error: 'El nombre completo y usuario son obligatorios.' };
    }
    const duplicate = users.find(
      (u) => u.id !== currentUser.id && u.username.toLowerCase() === cleanUsername
    );
    if (duplicate) {
      return { ok: false, error: 'Ese nombre de usuario ya está en uso.' };
    }

    const updated: CDOUser = {
      ...currentUser,
      fullName: cleanFullName,
      username: cleanUsername,
      email: data.email?.trim() || '',
      phone: data.phone?.trim() || '',
      position: data.position?.trim() || '',
    };

    try {
      const saved = await dbUpsertUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? saved : u)));
      setLastSync({
        id: `sync-${Date.now()}`,
        kind: 'perfil',
        title: 'Perfil actualizado en Supabase',
        detail: `${saved.fullName} (@${saved.username}) guardado correctamente`,
        timestamp: Date.now(),
      });
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar en Supabase.';
      console.error('Error guardando perfil en Supabase:', err);
      return { ok: false, error: `No se pudo guardar en Supabase: ${msg}` };
    }
  };

  const changeCurrentUserPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!currentUser) return { ok: false, error: 'No hay sesión activa.' };
    if (sha256Hex(currentPassword) !== currentUser.passwordHash) {
      return { ok: false, error: 'La contraseña actual no es correcta.' };
    }
    if (newPassword.trim().length < 6) {
      return { ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    const updated: CDOUser = {
      ...currentUser,
      passwordHash: sha256Hex(newPassword),
    };

    try {
      const saved = await dbUpsertUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? saved : u)));
      setLastSync({
        id: `sync-${Date.now()}`,
        kind: 'perfil',
        title: 'Contraseña actualizada en Supabase',
        detail: `Credencial segura guardada para @${saved.username}`,
        timestamp: Date.now(),
      });
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar contraseña.';
      console.error('Error guardando contraseña en Supabase:', err);
      return { ok: false, error: `No se pudo actualizar en Supabase: ${msg}` };
    }
  };

  const upsertTeamUser = async (data: {
    id?: string;
    fullName: string;
    username: string;
    role: 'admin' | 'administracion';
    password?: string;
    email?: string;
    phone?: string;
    position?: string;
  }): Promise<{ ok: true; user: CDOUser } | { ok: false; error: string }> => {
    const cleanFullName = data.fullName.trim();
    const cleanUsername = data.username.trim().toLowerCase();
    if (!cleanFullName || !cleanUsername) {
      return { ok: false, error: 'Nombre y usuario son obligatorios.' };
    }
    const existing = data.id ? users.find((u) => u.id === data.id) : undefined;
    const duplicate = users.find(
      (u) => u.id !== data.id && u.username.toLowerCase() === cleanUsername
    );
    if (duplicate) {
      return { ok: false, error: 'Ese usuario ya existe.' };
    }
    if (!existing && (!data.password || data.password.length < 6)) {
      return { ok: false, error: 'Asigna una contraseña de al menos 6 caracteres.' };
    }

    const record: CDOUser = {
      id: existing ? existing.id : `usr-${Date.now()}`,
      fullName: cleanFullName,
      username: cleanUsername,
      role: data.role,
      passwordHash:
        data.password && data.password.length > 0
          ? sha256Hex(data.password)
          : existing!.passwordHash,
      email: data.email?.trim() || '',
      phone: data.phone?.trim() || '',
      position: data.position?.trim() || '',
    };

    try {
      const saved = await dbUpsertUser(record);
      setUsers((prev) =>
        existing ? prev.map((u) => (u.id === existing.id ? saved : u)) : [...prev, saved]
      );
      return { ok: true, user: saved };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar usuario.';
      console.error('Error guardando usuario en Supabase:', err);
      return { ok: false, error: `No se pudo guardar en Supabase: ${msg}` };
    }
  };

  const deleteTeamUser = async (id: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (currentUser?.id === id) return { ok: false, error: 'No puedes eliminar tu propio usuario.' };
    const target = users.find((u) => u.id === id);
    if (!target) return { ok: false, error: 'Usuario no encontrado.' };
    if (target.role === 'admin' && users.filter((u) => u.role === 'admin').length <= 1) {
      return { ok: false, error: 'Debe permanecer al menos un administrador.' };
    }
    try {
      await dbDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar usuario.';
      console.error('Error eliminando usuario en Supabase:', err);
      return { ok: false, error: `No se pudo eliminar en Supabase: ${msg}` };
    }
  };

  // Resolve dynamic relational names so catalog edits reflect immediately everywhere
  const costCenters = useMemo<CODCostCenter[]>(() => {
    return rawCostCenters.map((obra) => {
      const cli = obra.clientId ? clients.find((c) => c.id === obra.clientId) : undefined;
      return {
        ...obra,
        clientName: cli?.name || obra.clientName,
      };
    });
  }, [rawCostCenters, clients]);

  const incomes = useMemo<CODIncome[]>(() => {
    return rawIncomes.map((inc) => {
      const comp = companies.find((c) => c.id === inc.companyId);
      const acc = baseAccounts.find((a) => a.id === inc.accountId);
      const proj = inc.projectId ? costCenters.find((p) => p.id === inc.projectId) : undefined;
      const cli = inc.clientId ? clients.find((c) => c.id === inc.clientId) : undefined;
      return {
        ...inc,
        companyName: comp?.name || inc.companyName,
        accountName: acc?.name || inc.accountName,
        projectName: proj?.name || inc.projectName,
        clientName: cli?.name || inc.clientName,
      };
    });
  }, [rawIncomes, companies, baseAccounts, costCenters, clients]);

  const expenses = useMemo<CODExpense[]>(() => {
    return rawExpenses.map((exp) => {
      const comp = companies.find((c) => c.id === exp.companyId);
      const acc = baseAccounts.find((a) => a.id === exp.accountId);
      const proj = costCenters.find((p) => p.id === exp.projectId);
      const cli = exp.clientId
        ? clients.find((c) => c.id === exp.clientId)
        : proj?.clientId
        ? clients.find((c) => c.id === proj.clientId)
        : undefined;
      return {
        ...exp,
        companyName: comp?.name || exp.companyName,
        accountName: acc?.name || exp.accountName,
        projectName: proj?.name || exp.projectName,
        clientId: cli?.id || exp.clientId,
        clientName: cli?.name || exp.clientName,
        expenseKind: exp.expenseKind || 'gasto',
        approvalStatus: exp.approvalStatus || 'autorizado',
      };
    });
  }, [rawExpenses, companies, baseAccounts, costCenters, clients]);

  const loansCredits = useMemo<CDOLoanCredit[]>(() => {
    return rawLoans.map((loan) => {
      const comp = companies.find((c) => c.id === loan.companyId);
      const acc = loan.accountId ? baseAccounts.find((a) => a.id === loan.accountId) : undefined;
      const proj = loan.projectId ? costCenters.find((p) => p.id === loan.projectId) : undefined;
      const cli = loan.clientId
        ? clients.find((c) => c.id === loan.clientId)
        : proj?.clientId
        ? clients.find((c) => c.id === proj.clientId)
        : undefined;
      const paid = round2(Math.max(0, loan.paidAmount));
      const remaining = round2(Math.max(0, loan.originalAmount - paid));
      const computedStatus =
        loan.status === 'pendiente_autorizacion' || loan.status === 'rechazado'
          ? loan.status
          : remaining <= 0
          ? 'liquidado'
          : 'activo';
      return {
        ...loan,
        companyName: comp?.name || loan.companyName,
        accountName: acc?.name || loan.accountName,
        projectName: proj?.name || loan.projectName,
        clientId: cli?.id || loan.clientId,
        clientName: cli?.name || loan.clientName,
        paidAmount: paid,
        remainingAmount: remaining,
        status: computedStatus,
      };
    });
  }, [rawLoans, companies, baseAccounts, costCenters, clients]);

  // Real-time automatic bank & cash balance computation: Saldo Inicial + Ingresos - Egresos Autorizados
  const accounts = useMemo<CODAccountComputed[]>(() => {
    return baseAccounts.map((acc) => {
      const companyName = companies.find((c) => c.id === acc.companyId)?.name || acc.companyId;
      const totalIncomes = round2(
        incomes
          .filter((inc) => inc.accountId === acc.id)
          .reduce((sum, inc) => sum + inc.total, 0)
      );
      const totalExpenses = round2(
        expenses
          .filter((exp) => exp.accountId === acc.id && exp.approvalStatus === 'autorizado')
          .reduce((sum, exp) => sum + exp.total, 0)
      );
      const currentBalance = round2(acc.initialBalance + totalIncomes - totalExpenses);

      return {
        ...acc,
        companyName,
        totalIncomes,
        totalExpenses,
        currentBalance,
      };
    });
  }, [baseAccounts, companies, incomes, expenses]);

  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) return 0;
    return notifications.filter(
      (n) => n.targetRole === currentUser.role && !n.readByUserIds.includes(currentUser.id)
    ).length;
  }, [notifications, currentUser]);

  const pendingApprovalsCount = useMemo(() => {
    return (
      expenses.filter((e) => e.approvalStatus === 'pendiente').length +
      loansCredits.filter((l) => l.status === 'pendiente_autorizacion' && !l.sourceExpenseId).length
    );
  }, [expenses, loansCredits]);

  // INCOMES CRUD
  const addIncome = (input: AddCODIncomeInput): CODIncome => {
    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = input.projectId ? costCenters.find((p) => p.id === input.projectId) : undefined;
    const client = input.clientId
      ? clients.find((c) => c.id === input.clientId)
      : project?.clientId
      ? clients.find((c) => c.id === project.clientId)
      : undefined;

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);
    const nextMov =
      rawIncomes.length > 0 ? Math.max(...rawIncomes.map((i) => i.movNumber)) + 1 : 1;

    const record: CODIncome = {
      id: `inc-${Date.now()}`,
      movNumber: nextMov,
      concept: input.concept.trim(),
      date: input.date,
      companyId: company?.id || input.companyId,
      companyName: company?.name || input.companyId,
      clientId: client?.id,
      clientName: client?.name,
      subtotal,
      iva,
      total,
      accountId: account?.id || input.accountId,
      accountName: account?.name || input.accountId,
      projectId: project?.id,
      projectName: project?.name,
      timestamp: Date.now(),
    };

    setRawIncomes((prev) => [...prev, record]);
    persistToSupabase(dbUpsertIncome(record), 'Error al guardar ingreso en Supabase');
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'ingreso',
      title: `Ingreso #${nextMov} registrado y sincronizado`,
      detail: `+$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/IVA en ${record.accountName} (${record.companyName})`,
      timestamp: Date.now(),
    });

    return record;
  };

  const updateIncome = (id: string, input: AddCODIncomeInput) => {
    const existing = rawIncomes.find((item) => item.id === id);
    if (!existing) return;

    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = input.projectId ? costCenters.find((p) => p.id === input.projectId) : undefined;
    const client = input.clientId
      ? clients.find((c) => c.id === input.clientId)
      : project?.clientId
      ? clients.find((c) => c.id === project.clientId)
      : undefined;

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);

    const updated: CODIncome = {
      ...existing,
      concept: input.concept.trim(),
      date: input.date,
      companyId: company?.id || input.companyId,
      companyName: company?.name || input.companyId,
      clientId: client?.id,
      clientName: client?.name,
      projectId: project?.id,
      projectName: project?.name,
      accountId: account?.id || input.accountId,
      accountName: account?.name || input.accountId,
      subtotal,
      iva,
      total,
    };

    setRawIncomes((prev) => prev.map((item) => (item.id === id ? updated : item)));
    persistToSupabase(dbUpsertIncome(updated), 'Error al actualizar ingreso en Supabase');

    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'ingreso',
      title: 'Ingreso actualizado',
      detail: `Recálculo automático aplicado: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/IVA en ${account?.name || ''}`,
      timestamp: Date.now(),
    });
  };

  const deleteIncome = (id: string) => {
    setRawIncomes((prev) => prev.filter((item) => item.id !== id));
    persistToSupabase(dbDeleteIncome(id), 'Error al eliminar ingreso en Supabase');
  };

  // EXPENSES CRUD + LOAN SYNC + NOTIFICATION WORKFLOW
  const addExpense = (input: AddCODExpenseInput): CODExpense => {
    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = costCenters.find((p) => p.id === input.projectId) || costCenters[0];
    const client = input.clientId
      ? clients.find((c) => c.id === input.clientId)
      : project?.clientId
      ? clients.find((c) => c.id === project.clientId)
      : undefined;

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);
    const nextMov =
      rawExpenses.length > 0 ? Math.max(...rawExpenses.map((e) => e.movNumber)) + 1 : 1;

    const now = Date.now();
    const isAdmin = currentUser?.role === 'admin';
    const approvalStatus: ExpenseApprovalStatus = isAdmin ? 'autorizado' : 'pendiente';
    const expenseKind: ExpenseKind = input.expenseKind || 'gasto';
    const expenseId = `egr-${now}`;

    let linkedLoanId = input.linkedLoanId;

    // Sync into Préstamos y Tarjetas Bancarias if creating a loan or bank credit from Egresos
    if (expenseKind === 'prestamo' || expenseKind === 'credito_bancario') {
      const loanId = `loan-${now}`;
      linkedLoanId = loanId;
      const newLoan: CDOLoanCredit = {
        id: loanId,
        kind: expenseKind,
        title: input.concept.trim(),
        institution: input.loanInstitution?.trim() || account?.name || 'Banco / Financiera',
        cardLast4: input.cardLast4?.trim() || undefined,
        date: input.date,
        dueDate: input.dueDate?.trim() || undefined,
        companyId: company?.id || input.companyId,
        companyName: company?.name || input.companyId,
        clientId: client?.id,
        clientName: client?.name,
        projectId: project?.id || input.projectId,
        projectName: project?.name || 'Obra General',
        accountId: account?.id || input.accountId,
        accountName: account?.name || input.accountId,
        originalAmount: total,
        paidAmount: 0,
        remainingAmount: total,
        sourceExpenseId: expenseId,
        status: isAdmin ? 'activo' : 'pendiente_autorizacion',
        notes: `Sincronizado desde Egreso #${nextMov}`,
        requestedByUserId: currentUser?.id,
        requestedByName: currentUser?.fullName,
        timestamp: now,
      };
      setRawLoans((prev) => [newLoan, ...prev]);
      persistToSupabase(dbUpsertLoanCredit(newLoan), 'Error al guardar préstamo en Supabase');
    } else if (expenseKind === 'abono_prestamo' && linkedLoanId && isAdmin) {
      const targetLoan = rawLoans.find((l) => l.id === linkedLoanId);
      if (targetLoan) {
        const nextPaid = round2(targetLoan.paidAmount + total);
        const nextRemaining = round2(Math.max(0, targetLoan.originalAmount - nextPaid));
        const updatedLoan: CDOLoanCredit = {
          ...targetLoan,
          paidAmount: nextPaid,
          remainingAmount: nextRemaining,
          status: nextRemaining <= 0 ? 'liquidado' : 'activo',
        };
        setRawLoans((prev) => prev.map((loan) => (loan.id === linkedLoanId ? updatedLoan : loan)));
        persistToSupabase(dbUpsertLoanCredit(updatedLoan), 'Error al actualizar abono en Supabase');
      }
    }

    const record: CODExpense = {
      id: expenseId,
      movNumber: nextMov,
      concept: input.concept.trim(),
      date: input.date,
      projectId: project?.id || input.projectId,
      projectName: project?.name || 'Obra General',
      clientId: client?.id,
      clientName: client?.name,
      companyId: company?.id || input.companyId,
      companyName: company?.name || input.companyId,
      subtotal,
      iva,
      total,
      accountId: account?.id || input.accountId,
      accountName: account?.name || input.accountId,
      capturedVia: input.capturedVia,
      expenseKind,
      linkedLoanId,
      approvalStatus,
      requestedByUserId: currentUser?.id,
      requestedByName: currentUser?.fullName || 'Usuario',
      reviewedByUserId: isAdmin ? currentUser?.id : undefined,
      reviewedByName: isAdmin ? currentUser?.fullName : undefined,
      reviewedAt: isAdmin ? now : undefined,
      timestamp: now,
    };

    setRawExpenses((prev) => [...prev, record]);
    persistToSupabase(dbUpsertExpense(record), 'Error al guardar egreso en Supabase');

    if (!isAdmin) {
      const kindLabel =
        expenseKind === 'prestamo'
          ? 'Préstamo'
          : expenseKind === 'credito_bancario'
          ? 'Crédito / Tarjeta Bancaria'
          : expenseKind === 'abono_prestamo'
          ? 'Abono a Préstamo/Crédito'
          : 'Egreso';

      const notif: CDONotification = {
        id: `notif-${now}`,
        type:
          expenseKind === 'prestamo' || expenseKind === 'credito_bancario'
            ? 'solicitud_prestamo'
            : 'solicitud_egreso',
        targetRole: 'admin',
        title: `Solicitud de Autorización · ${kindLabel} ($${total.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
        })})`,
        message: `${currentUser?.fullName || 'Administración'} solicita retirar $${total.toLocaleString(
          'es-MX',
          { minimumFractionDigits: 2 }
        )} de la cuenta ${record.accountName} (${record.companyName}) · Proyecto: ${
          record.projectName
        }${record.clientName ? ` · Cliente: ${record.clientName}` : ''}. Concepto: ${record.concept}`,
        expenseId: record.id,
        loanId: linkedLoanId,
        amount: total,
        accountName: record.accountName,
        companyName: record.companyName,
        projectName: record.projectName,
        clientName: record.clientName,
        expenseKind,
        createdByUserId: currentUser?.id || 'usr-contadora',
        createdByName: currentUser?.fullName || 'Administración',
        readByUserIds: [],
        actionStatus: 'pendiente',
        timestamp: now,
      };
      setNotifications((prev) => [notif, ...prev]);
      persistToSupabase(dbUpsertNotification(notif), 'Error al guardar notificación en Supabase');

      setLastSync({
        id: `sync-${now}`,
        kind: 'notificacion',
        title: `Solicitud #${nextMov} enviada al Admin`,
        detail: `Pendiente de autorizar salida de $${total.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
        })} en ${record.accountName}`,
        timestamp: now,
      });
    } else {
      setLastSync({
        id: `sync-${now}`,
        kind: expenseKind === 'prestamo' || expenseKind === 'credito_bancario' ? 'prestamo' : 'egreso',
        title:
          expenseKind === 'prestamo'
            ? `Egreso #${nextMov} y Préstamo sincronizados`
            : expenseKind === 'credito_bancario'
            ? `Egreso #${nextMov} y Crédito Bancario sincronizados`
            : `Egreso #${nextMov} (${input.capturedVia}) sincronizado`,
        detail: `-$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/IVA de ${record.accountName} · Obra: ${record.projectName} (${record.companyName})`,
        timestamp: now,
      });
    }

    return record;
  };

  const approveExpense = (expenseId: string) => {
    if (currentUser?.role !== 'admin') return;
    const rawTarget = rawExpenses.find((e) => e.id === expenseId);
    const target = expenses.find((e) => e.id === expenseId);
    if (!rawTarget || !target || rawTarget.approvalStatus === 'autorizado') return;
    const now = Date.now();

    const updatedExpense: CODExpense = {
      ...rawTarget,
      approvalStatus: 'autorizado',
      reviewedByUserId: currentUser.id,
      reviewedByName: currentUser.fullName,
      reviewedAt: now,
      rejectionReason: undefined,
    };
    setRawExpenses((prev) => prev.map((item) => (item.id === expenseId ? updatedExpense : item)));
    persistToSupabase(dbUpsertExpense(updatedExpense), 'Error al autorizar egreso en Supabase');

    if (target.linkedLoanId) {
      const targetLoan = rawLoans.find((l) => l.id === target.linkedLoanId);
      if (targetLoan) {
        const updatedLoan: CDOLoanCredit =
          target.expenseKind === 'abono_prestamo'
            ? (() => {
                const nextPaid = round2(targetLoan.paidAmount + target.total);
                const nextRem = round2(Math.max(0, targetLoan.originalAmount - nextPaid));
                return {
                  ...targetLoan,
                  paidAmount: nextPaid,
                  remainingAmount: nextRem,
                  status: nextRem <= 0 ? 'liquidado' : 'activo',
                };
              })()
            : {
                ...targetLoan,
                status: targetLoan.remainingAmount <= 0 ? 'liquidado' : 'activo',
              };
        setRawLoans((prev) => prev.map((l) => (l.id === targetLoan.id ? updatedLoan : l)));
        persistToSupabase(dbUpsertLoanCredit(updatedLoan), 'Error al actualizar préstamo en Supabase');
      }
    }

    const updatedNotifs: CDONotification[] = [];
    const nextNotifList = notifications.map((n) => {
      if (n.expenseId === expenseId && n.actionStatus === 'pendiente') {
        const nextN: CDONotification = {
          ...n,
          actionStatus: 'autorizado',
          readByUserIds: n.readByUserIds.includes(currentUser.id)
            ? n.readByUserIds
            : [...n.readByUserIds, currentUser.id],
        };
        updatedNotifs.push(nextN);
        return nextN;
      }
      return n;
    });

    const replyNotif: CDONotification = {
      id: `notif-res-${now}`,
      type: 'egreso_autorizado',
      targetRole: 'administracion',
      title: `Egreso #${target.movNumber} Autorizado`,
      message: `${currentUser.fullName} autorizó la salida de $${target.total.toLocaleString(
        'es-MX',
        { minimumFractionDigits: 2 }
      )} de ${target.accountName} (${target.concept}). Aplicado a bancos y módulos.`,
      expenseId: target.id,
      loanId: target.linkedLoanId,
      amount: target.total,
      accountName: target.accountName,
      companyName: target.companyName,
      projectName: target.projectName,
      clientName: target.clientName,
      expenseKind: target.expenseKind,
      createdByUserId: currentUser.id,
      createdByName: currentUser.fullName,
      readByUserIds: [],
      actionStatus: 'autorizado',
      timestamp: now,
    };

    setNotifications([replyNotif, ...nextNotifList]);
    updatedNotifs.forEach((n) =>
      persistToSupabase(dbUpsertNotification(n), 'Error al actualizar notificación en Supabase')
    );
    persistToSupabase(dbUpsertNotification(replyNotif), 'Error al enviar notificación en Supabase');

    setLastSync({
      id: `sync-${now}`,
      kind: 'egreso',
      title: `Egreso #${target.movNumber} autorizado`,
      detail: `-$${target.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} descontado de ${target.accountName}`,
      timestamp: now,
    });
  };

  const rejectExpense = (expenseId: string, reason?: string) => {
    if (currentUser?.role !== 'admin') return;
    const rawTarget = rawExpenses.find((e) => e.id === expenseId);
    const target = expenses.find((e) => e.id === expenseId);
    if (!rawTarget || !target || rawTarget.approvalStatus === 'rechazado') return;
    const now = Date.now();
    const cleanReason = reason?.trim() || 'Rechazado por dirección / administración';

    const updatedExpense: CODExpense = {
      ...rawTarget,
      approvalStatus: 'rechazado',
      reviewedByUserId: currentUser.id,
      reviewedByName: currentUser.fullName,
      reviewedAt: now,
      rejectionReason: cleanReason,
    };
    setRawExpenses((prev) => prev.map((item) => (item.id === expenseId ? updatedExpense : item)));
    persistToSupabase(dbUpsertExpense(updatedExpense), 'Error al rechazar egreso en Supabase');

    if (
      target.linkedLoanId &&
      (target.expenseKind === 'prestamo' || target.expenseKind === 'credito_bancario')
    ) {
      const targetLoan = rawLoans.find((l) => l.id === target.linkedLoanId);
      if (targetLoan) {
        const updatedLoan: CDOLoanCredit = {
          ...targetLoan,
          status: 'rechazado',
        };
        setRawLoans((prev) => prev.map((l) => (l.id === targetLoan.id ? updatedLoan : l)));
        persistToSupabase(dbUpsertLoanCredit(updatedLoan), 'Error al actualizar préstamo en Supabase');
      }
    }

    const updatedNotifs: CDONotification[] = [];
    const nextNotifList = notifications.map((n) => {
      if (n.expenseId === expenseId && n.actionStatus === 'pendiente') {
        const nextN: CDONotification = {
          ...n,
          actionStatus: 'rechazado',
          rejectionReason: cleanReason,
          readByUserIds: n.readByUserIds.includes(currentUser.id)
            ? n.readByUserIds
            : [...n.readByUserIds, currentUser.id],
        };
        updatedNotifs.push(nextN);
        return nextN;
      }
      return n;
    });

    const replyNotif: CDONotification = {
      id: `notif-rej-${now}`,
      type: 'egreso_rechazado',
      targetRole: 'administracion',
      title: `Egreso #${target.movNumber} Rechazado`,
      message: `${currentUser.fullName} rechazó el movimiento de $${target.total.toLocaleString(
        'es-MX',
        { minimumFractionDigits: 2 }
      )} en ${target.accountName}. Motivo: ${cleanReason}`,
      expenseId: target.id,
      loanId: target.linkedLoanId,
      amount: target.total,
      accountName: target.accountName,
      companyName: target.companyName,
      projectName: target.projectName,
      clientName: target.clientName,
      expenseKind: target.expenseKind,
      createdByUserId: currentUser.id,
      createdByName: currentUser.fullName,
      readByUserIds: [],
      actionStatus: 'rechazado',
      rejectionReason: cleanReason,
      timestamp: now,
    };

    setNotifications([replyNotif, ...nextNotifList]);
    updatedNotifs.forEach((n) =>
      persistToSupabase(dbUpsertNotification(n), 'Error al actualizar notificación en Supabase')
    );
    persistToSupabase(dbUpsertNotification(replyNotif), 'Error al enviar notificación en Supabase');
  };

  const updateExpense = (id: string, input: AddCODExpenseInput) => {
    const existing = rawExpenses.find((item) => item.id === id);
    if (!existing) return;

    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = costCenters.find((p) => p.id === input.projectId) || costCenters[0];
    const client = input.clientId
      ? clients.find((c) => c.id === input.clientId)
      : project?.clientId
      ? clients.find((c) => c.id === project.clientId)
      : undefined;

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);

    const updated: CODExpense = {
      ...existing,
      concept: input.concept.trim(),
      date: input.date,
      projectId: project?.id || input.projectId,
      projectName: project?.name || existing.projectName,
      clientId: client?.id,
      clientName: client?.name,
      companyId: company?.id || input.companyId,
      companyName: company?.name || existing.companyName,
      accountId: account?.id || input.accountId,
      accountName: account?.name || existing.accountName,
      subtotal,
      iva,
      total,
      capturedVia: input.capturedVia,
      expenseKind: input.expenseKind || existing.expenseKind || 'gasto',
    };

    setRawExpenses((prev) => prev.map((item) => (item.id === id ? updated : item)));
    persistToSupabase(dbUpsertExpense(updated), 'Error al actualizar egreso en Supabase');

    if (
      updated.linkedLoanId &&
      (updated.expenseKind === 'prestamo' || updated.expenseKind === 'credito_bancario')
    ) {
      const linkedLoan = rawLoans.find((l) => l.id === updated.linkedLoanId);
      if (linkedLoan) {
        const nextRem = round2(Math.max(0, total - linkedLoan.paidAmount));
        const syncedLoan: CDOLoanCredit = {
          ...linkedLoan,
          title: updated.concept,
          date: updated.date,
          companyId: updated.companyId,
          companyName: updated.companyName,
          clientId: updated.clientId,
          clientName: updated.clientName,
          projectId: updated.projectId,
          projectName: updated.projectName,
          accountId: updated.accountId,
          accountName: updated.accountName,
          originalAmount: total,
          remainingAmount: nextRem,
          status:
            linkedLoan.status === 'pendiente_autorizacion' || linkedLoan.status === 'rechazado'
              ? linkedLoan.status
              : nextRem <= 0
              ? 'liquidado'
              : 'activo',
        };
        setRawLoans((prev) => prev.map((l) => (l.id === syncedLoan.id ? syncedLoan : l)));
        persistToSupabase(dbUpsertLoanCredit(syncedLoan), 'Error al sincronizar préstamo en Supabase');
      }
    }

    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'egreso',
      title: 'Egreso actualizado',
      detail: `-$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/IVA ajustado en ${account?.name || ''}`,
      timestamp: Date.now(),
    });
  };

  const deleteExpense = (id: string) => {
    setRawExpenses((prev) => prev.filter((item) => item.id !== id));
    persistToSupabase(dbDeleteExpense(id), 'Error al eliminar egreso en Supabase');
  };

  // LOANS & BANK CREDIT CARDS CRUD
  const addLoanCredit = (input: AddCDOLoanCreditInput): CDOLoanCredit => {
    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = input.accountId ? baseAccounts.find((a) => a.id === input.accountId) : undefined;
    const project = input.projectId ? costCenters.find((p) => p.id === input.projectId) : undefined;
    const client = input.clientId
      ? clients.find((c) => c.id === input.clientId)
      : project?.clientId
      ? clients.find((c) => c.id === project.clientId)
      : undefined;

    const now = Date.now();
    const isAdmin = currentUser?.role === 'admin';
    const originalAmount = round2(Math.max(0, input.originalAmount));
    const paidAmount = round2(Math.max(0, input.paidAmount || 0));
    const remainingAmount = round2(Math.max(0, originalAmount - paidAmount));

    const record: CDOLoanCredit = {
      id: `loan-${now}`,
      kind: input.kind,
      title: input.title.trim(),
      institution: input.institution.trim(),
      cardLast4: input.cardLast4?.trim() || undefined,
      date: input.date,
      dueDate: input.dueDate?.trim() || undefined,
      companyId: company?.id || input.companyId,
      companyName: company?.name || input.companyId,
      clientId: client?.id,
      clientName: client?.name,
      projectId: project?.id,
      projectName: project?.name,
      accountId: account?.id,
      accountName: account?.name,
      originalAmount,
      paidAmount,
      remainingAmount,
      status: isAdmin
        ? remainingAmount <= 0
          ? 'liquidado'
          : 'activo'
        : 'pendiente_autorizacion',
      notes: input.notes?.trim() || undefined,
      requestedByUserId: currentUser?.id,
      requestedByName: currentUser?.fullName || 'Usuario',
      timestamp: now,
    };

    setRawLoans((prev) => [record, ...prev]);
    persistToSupabase(dbUpsertLoanCredit(record), 'Error al guardar préstamo en Supabase');

    if (!isAdmin) {
      const label = input.kind === 'prestamo' ? 'Préstamo' : 'Crédito / Tarjeta Bancaria';
      const notif: CDONotification = {
        id: `notif-loan-${now}`,
        type: 'solicitud_prestamo',
        targetRole: 'admin',
        title: `Solicitud de ${label} ($${originalAmount.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
        })})`,
        message: `${currentUser?.fullName || 'Administración'} registró solicitud de ${label} "${
          record.title
        }" (${record.institution}) por $${originalAmount.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
        })}${record.accountName ? ` · Cuenta: ${record.accountName}` : ''}${
          record.projectName ? ` · Proyecto: ${record.projectName}` : ''
        }${record.clientName ? ` · Cliente: ${record.clientName}` : ''}.`,
        loanId: record.id,
        amount: originalAmount,
        accountName: record.accountName || record.institution,
        companyName: record.companyName,
        projectName: record.projectName,
        clientName: record.clientName,
        expenseKind: input.kind,
        createdByUserId: currentUser?.id || 'usr-contadora',
        createdByName: currentUser?.fullName || 'Administración',
        readByUserIds: [],
        actionStatus: 'pendiente',
        timestamp: now,
      };
      setNotifications((prev) => [notif, ...prev]);
      persistToSupabase(dbUpsertNotification(notif), 'Error al guardar notificación en Supabase');
    }

    setLastSync({
      id: `sync-${now}`,
      kind: 'prestamo',
      title: isAdmin
        ? `${input.kind === 'prestamo' ? 'Préstamo' : 'Tarjeta / Crédito'} registrado`
        : 'Solicitud enviada al Admin para autorización',
      detail: `${record.title} · $${originalAmount.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
      })}`,
      timestamp: now,
    });

    return record;
  };

  const updateLoanCredit = (id: string, data: Partial<Omit<CDOLoanCredit, 'id'>>) => {
    const existing = rawLoans.find((l) => l.id === id);
    if (!existing) return;

    const orig =
      data.originalAmount !== undefined ? round2(Math.max(0, data.originalAmount)) : existing.originalAmount;
    const paid =
      data.paidAmount !== undefined ? round2(Math.max(0, data.paidAmount)) : existing.paidAmount;
    const rem = round2(Math.max(0, orig - paid));
    const nextStatus =
      data.status ||
      (existing.status === 'pendiente_autorizacion' || existing.status === 'rechazado'
        ? existing.status
        : rem <= 0
        ? 'liquidado'
        : 'activo');
    const updated: CDOLoanCredit = {
      ...existing,
      ...data,
      originalAmount: orig,
      paidAmount: paid,
      remainingAmount: rem,
      status: nextStatus,
    };

    setRawLoans((prev) => prev.map((loan) => (loan.id === id ? updated : loan)));
    persistToSupabase(dbUpsertLoanCredit(updated), 'Error al actualizar préstamo en Supabase');
  };

  const registerLoanPayment = (
    loanId: string,
    amount: number,
    options?: { deductFromAccountId?: string; date?: string; notes?: string }
  ) => {
    const loan = loansCredits.find((l) => l.id === loanId);
    if (!loan || amount <= 0) return;

    if (options?.deductFromAccountId) {
      const subtotalSinIva = round2(amount / 1.16);
      addExpense({
        concept: `Abono a ${loan.kind === 'prestamo' ? 'Préstamo' : 'Crédito'}: ${loan.title}`,
        date: options.date || new Date().toISOString().split('T')[0],
        projectId: loan.projectId || costCenters[0]?.id || '',
        clientId: loan.clientId,
        companyId: loan.companyId,
        accountId: options.deductFromAccountId,
        subtotal: subtotalSinIva,
        capturedVia: 'Manual',
        expenseKind: 'abono_prestamo',
        linkedLoanId: loan.id,
      });
      return;
    }

    const nextPaid = round2(loan.paidAmount + amount);
    updateLoanCredit(loanId, {
      paidAmount: nextPaid,
      notes: options?.notes ? `${loan.notes ? loan.notes + ' · ' : ''}${options.notes}` : loan.notes,
    });
  };

  const approveLoanDirect = (loanId: string) => {
    if (currentUser?.role !== 'admin') return;
    const loan = loansCredits.find((l) => l.id === loanId);
    if (!loan) return;
    if (loan.sourceExpenseId) {
      approveExpense(loan.sourceExpenseId);
      return;
    }
    const now = Date.now();
    updateLoanCredit(loanId, {
      status: loan.remainingAmount <= 0 ? 'liquidado' : 'activo',
    });

    const updatedNotifs: CDONotification[] = [];
    const nextList = notifications.map((n) => {
      if (n.loanId === loanId && n.actionStatus === 'pendiente') {
        const nextN: CDONotification = {
          ...n,
          actionStatus: 'autorizado',
          readByUserIds: n.readByUserIds.includes(currentUser.id)
            ? n.readByUserIds
            : [...n.readByUserIds, currentUser.id],
        };
        updatedNotifs.push(nextN);
        return nextN;
      }
      return n;
    });
    const replyNotif: CDONotification = {
      id: `notif-loan-ok-${now}`,
      type: 'egreso_autorizado',
      targetRole: 'administracion',
      title: `${loan.kind === 'prestamo' ? 'Préstamo' : 'Crédito Bancario'} Autorizado`,
      message: `${currentUser.fullName} autorizó "${loan.title}" por $${loan.originalAmount.toLocaleString(
        'es-MX',
        { minimumFractionDigits: 2 }
      )}.`,
      loanId: loan.id,
      amount: loan.originalAmount,
      accountName: loan.accountName || loan.institution,
      companyName: loan.companyName,
      projectName: loan.projectName,
      clientName: loan.clientName,
      expenseKind: loan.kind,
      createdByUserId: currentUser.id,
      createdByName: currentUser.fullName,
      readByUserIds: [],
      actionStatus: 'autorizado',
      timestamp: now,
    };
    setNotifications([replyNotif, ...nextList]);
    updatedNotifs.forEach((n) =>
      persistToSupabase(dbUpsertNotification(n), 'Error al actualizar notificación en Supabase')
    );
    persistToSupabase(dbUpsertNotification(replyNotif), 'Error al enviar notificación en Supabase');
  };

  const rejectLoanDirect = (loanId: string, reason?: string) => {
    if (currentUser?.role !== 'admin') return;
    const loan = loansCredits.find((l) => l.id === loanId);
    if (!loan) return;
    if (loan.sourceExpenseId) {
      rejectExpense(loan.sourceExpenseId, reason);
      return;
    }
    const now = Date.now();
    const cleanReason = reason?.trim() || 'Solicitud rechazada por Admin';
    updateLoanCredit(loanId, { status: 'rechazado' });

    const updatedNotifs: CDONotification[] = [];
    const nextList = notifications.map((n) => {
      if (n.loanId === loanId && n.actionStatus === 'pendiente') {
        const nextN: CDONotification = {
          ...n,
          actionStatus: 'rechazado',
          rejectionReason: cleanReason,
          readByUserIds: n.readByUserIds.includes(currentUser.id)
            ? n.readByUserIds
            : [...n.readByUserIds, currentUser.id],
        };
        updatedNotifs.push(nextN);
        return nextN;
      }
      return n;
    });
    const replyNotif: CDONotification = {
      id: `notif-loan-rej-${now}`,
      type: 'egreso_rechazado',
      targetRole: 'administracion',
      title: `${loan.kind === 'prestamo' ? 'Préstamo' : 'Crédito Bancario'} Rechazado`,
      message: `${currentUser.fullName} rechazó "${loan.title}". Motivo: ${cleanReason}`,
      loanId: loan.id,
      amount: loan.originalAmount,
      accountName: loan.accountName || loan.institution,
      companyName: loan.companyName,
      projectName: loan.projectName,
      clientName: loan.clientName,
      expenseKind: loan.kind,
      createdByUserId: currentUser.id,
      createdByName: currentUser.fullName,
      readByUserIds: [],
      actionStatus: 'rechazado',
      rejectionReason: cleanReason,
      timestamp: now,
    };
    setNotifications([replyNotif, ...nextList]);
    updatedNotifs.forEach((n) =>
      persistToSupabase(dbUpsertNotification(n), 'Error al actualizar notificación en Supabase')
    );
    persistToSupabase(dbUpsertNotification(replyNotif), 'Error al enviar notificación en Supabase');
  };

  const deleteLoanCredit = (id: string) => {
    setRawLoans((prev) => prev.filter((l) => l.id !== id));
    persistToSupabase(dbDeleteLoanCredit(id), 'Error al eliminar préstamo en Supabase');
  };

  const markNotificationRead = (id: string) => {
    if (!currentUser) return;
    const target = notifications.find((n) => n.id === id);
    if (!target || target.readByUserIds.includes(currentUser.id)) return;
    const updated: CDONotification = {
      ...target,
      readByUserIds: [...target.readByUserIds, currentUser.id],
    };
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    persistToSupabase(dbUpsertNotification(updated), 'Error al marcar notificación en Supabase');
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    const changed: CDONotification[] = [];
    const nextList = notifications.map((n) => {
      if (n.targetRole !== currentUser.role || n.readByUserIds.includes(currentUser.id)) return n;
      const updated: CDONotification = {
        ...n,
        readByUserIds: [...n.readByUserIds, currentUser.id],
      };
      changed.push(updated);
      return updated;
    });
    if (changed.length === 0) return;
    setNotifications(nextList);
    changed.forEach((n) =>
      persistToSupabase(dbUpsertNotification(n), 'Error al marcar notificaciones en Supabase')
    );
  };

  // COMPANIES (S.A.) CRUD
  const addCompany = (name: string, shortName?: string, rfc?: string): CODCompany => {
    const trimmed = name.trim();
    const newCo: CODCompany = {
      id: `sa-${Date.now()}`,
      name: trimmed,
      shortName: (shortName || trimmed).trim(),
      rfc: rfc?.trim() || undefined,
    };
    setCompanies((prev) => [...prev, newCo]);
    persistToSupabase(dbUpsertCompany(newCo), 'Error al guardar S.A. en Supabase');
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'catalogo',
      title: `S.A. "${newCo.name}" agregada`,
      detail: 'Columna añadida automáticamente al Resumen Consolidado',
      timestamp: Date.now(),
    });
    return newCo;
  };

  const updateCompany = (id: string, data: Partial<Omit<CODCompany, 'id'>>) => {
    const existing = companies.find((c) => c.id === id);
    if (!existing) return;
    const updated: CODCompany = { ...existing, ...data };
    setCompanies((prev) => prev.map((c) => (c.id === id ? updated : c)));
    persistToSupabase(dbUpsertCompany(updated), 'Error al actualizar S.A. en Supabase');
  };

  const deleteCompany = (id: string): boolean => {
    if (companies.length <= 1) return false;
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    persistToSupabase(dbDeleteCompany(id), 'Error al eliminar S.A. en Supabase');
    if (selectedCompanyFilter === id) setSelectedCompanyFilter('ALL');
    return true;
  };

  // CLIENTS CRUD
  const addClient = (name: string, rfc?: string, contact?: string): CODClient => {
    const newClient: CODClient = {
      id: `cli-${Date.now()}`,
      name: name.trim(),
      rfc: rfc?.trim() || undefined,
      contact: contact?.trim() || undefined,
    };
    setClients((prev) => [...prev, newClient]);
    persistToSupabase(dbUpsertClient(newClient), 'Error al guardar cliente en Supabase');
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'catalogo',
      title: `Cliente "${newClient.name}" agregado`,
      detail: 'Disponible en Proyectos, Ingresos y Catálogos',
      timestamp: Date.now(),
    });
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Omit<CODClient, 'id'>>) => {
    const existing = clients.find((c) => c.id === id);
    if (!existing) return;
    const updated: CODClient = { ...existing, ...data };
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
    persistToSupabase(dbUpsertClient(updated), 'Error al actualizar cliente en Supabase');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    persistToSupabase(dbDeleteClient(id), 'Error al eliminar cliente en Supabase');
  };

  // COST CENTERS (PROJECTS / OBRAS) CRUD
  const addCostCenter = (name: string, companyId: string, clientId?: string): CODCostCenter => {
    const cli = clientId ? clients.find((c) => c.id === clientId) : undefined;
    const newObra: CODCostCenter = {
      id: `obra-${Date.now()}`,
      name: name.trim(),
      companyId,
      clientId: cli?.id,
      clientName: cli?.name,
    };
    setRawCostCenters((prev) => [...prev, newObra]);
    persistToSupabase(dbUpsertProject(newObra), 'Error al guardar proyecto en Supabase');
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'catalogo',
      title: `Proyecto "${newObra.name}" creado`,
      detail: cli ? `Ligado al cliente ${cli.name}` : 'Disponible en Ingresos y Egresos',
      timestamp: Date.now(),
    });
    return newObra;
  };

  const updateCostCenter = (id: string, data: Partial<Omit<CODCostCenter, 'id'>>) => {
    const existing = rawCostCenters.find((o) => o.id === id);
    if (!existing) return;
    const cli =
      data.clientId !== undefined
        ? clients.find((c) => c.id === data.clientId)
        : undefined;
    const updated: CODCostCenter = {
      ...existing,
      ...data,
      clientName: data.clientId !== undefined ? cli?.name : existing.clientName,
    };
    setRawCostCenters((prev) => prev.map((o) => (o.id === id ? updated : o)));
    persistToSupabase(dbUpsertProject(updated), 'Error al actualizar proyecto en Supabase');
  };

  const deleteCostCenter = (id: string) => {
    setRawCostCenters((prev) => prev.filter((o) => o.id !== id));
    persistToSupabase(dbDeleteProject(id), 'Error al eliminar proyecto en Supabase');
  };

  // ACCOUNTS (BANKS & CASH) CRUD
  const addAccount = (input: AddCODAccountInput): CODAccount => {
    const newAcc: CODAccount = {
      id: `acc-${Date.now()}`,
      name: input.name.trim(),
      accountNumber: input.accountNumber?.trim() || undefined,
      type: input.type,
      companyId: input.companyId,
      initialBalance: round2(Math.max(0, input.initialBalance)),
    };
    setBaseAccounts((prev) => [...prev, newAcc]);
    persistToSupabase(dbUpsertAccount(newAcc), 'Error al guardar cuenta bancaria en Supabase');
    const companyName = companies.find((c) => c.id === input.companyId)?.name || input.companyId;
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'cuenta',
      title: `Cuenta "${newAcc.name}" agregada`,
      detail: `Asociada a ${companyName} · Saldo Inicial $${newAcc.initialBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      timestamp: Date.now(),
    });
    return newAcc;
  };

  const updateAccount = (id: string, data: Partial<Omit<CODAccount, 'id'>>) => {
    const existing = baseAccounts.find((acc) => acc.id === id);
    if (!existing) return;
    const updated: CODAccount = {
      ...existing,
      ...data,
      initialBalance:
        data.initialBalance !== undefined
          ? round2(Math.max(0, data.initialBalance))
          : existing.initialBalance,
    };
    setBaseAccounts((prev) => prev.map((acc) => (acc.id === id ? updated : acc)));
    persistToSupabase(dbUpsertAccount(updated), 'Error al actualizar cuenta bancaria en Supabase');
  };

  const updateAccountInitialBalance = (accountId: string, newInitialBalance: number) => {
    updateAccount(accountId, { initialBalance: newInitialBalance });
  };

  const deleteAccount = (id: string): boolean => {
    if (baseAccounts.length <= 1) return false;
    setBaseAccounts((prev) => prev.filter((a) => a.id !== id));
    persistToSupabase(dbDeleteAccount(id), 'Error al eliminar cuenta bancaria en Supabase');
    return true;
  };

  // CONCEPTS CRUD
  const addConcept = (name: string, kind: 'ingreso' | 'egreso'): CODConceptItem => {
    const newConcept: CODConceptItem = {
      id: `con-${Date.now()}`,
      name: name.trim(),
      kind,
    };
    setConcepts((prev) => [...prev, newConcept]);
    persistToSupabase(dbUpsertConcept(newConcept), 'Error al guardar concepto en Supabase');
    return newConcept;
  };

  const deleteConcept = (id: string) => {
    setConcepts((prev) => prev.filter((c) => c.id !== id));
    persistToSupabase(dbDeleteConcept(id), 'Error al eliminar concepto en Supabase');
  };

  // RESET / START FROM ZERO
  const clearMovementsToZero = () => {
    setRawIncomes([]);
    setRawExpenses([]);
    setRawLoans([]);
    setNotifications([]);
    setBaseAccounts((prev) => prev.map((a) => ({ ...a, initialBalance: 0 })));
    persistToSupabase(dbClearMovementsToZero(), 'Error al limpiar movimientos en Supabase');
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'catalogo',
      title: 'Movimientos y saldos en $0.00',
      detail: 'Catálogos conservados; listo para registrar operación real',
      timestamp: Date.now(),
    });
  };

  const clearAllToZero = () => {
    const primarySa: CODCompany = companies[0] || {
      id: 'sa-1',
      name: 'Mi Empresa S.A.',
      shortName: 'Empresa 1',
    };
    const primaryAcc: CODAccount = {
      id: 'acc-principal',
      name: 'Cuenta Principal',
      accountNumber: '0001',
      type: 'banco',
      companyId: primarySa.id,
      initialBalance: 0,
    };
    setCompanies([primarySa]);
    setClients([]);
    setRawCostCenters([]);
    setBaseAccounts([primaryAcc]);
    setRawIncomes([]);
    setRawExpenses([]);
    setRawLoans([]);
    setNotifications([]);
    setSelectedCompanyFilter('ALL');
    persistToSupabase(
      dbSyncFullSnapshot({
        companies: [primarySa],
        clients: [],
        costCenters: [],
        accounts: [primaryAcc],
        concepts,
        incomes: [],
        expenses: [],
        loansCredits: [],
        notifications: [],
      }),
      'Error al reiniciar sistema en Supabase'
    );
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'catalogo',
      title: 'Sistema reiniciado en cero',
      detail: 'Puedes dar de alta tus propias S.A., Clientes, Proyectos y Cuentas Bancarias',
      timestamp: Date.now(),
    });
  };

  const resetCODData = () => {
    setCompanies(INITIAL_COD_COMPANIES);
    setClients(INITIAL_COD_CLIENTS);
    setRawCostCenters(INITIAL_COD_COST_CENTERS);
    setBaseAccounts(INITIAL_COD_ACCOUNTS);
    setConcepts(INITIAL_COD_CONCEPTS);
    setRawIncomes(INITIAL_COD_INCOMES);
    setRawExpenses(INITIAL_COD_EXPENSES);
    setRawLoans(INITIAL_COD_LOANS_CREDITS);
    setNotifications([]);
    setSelectedCompanyFilter('ALL');
    setLastSync(null);
    persistToSupabase(
      dbSyncFullSnapshot({
        companies: INITIAL_COD_COMPANIES,
        clients: INITIAL_COD_CLIENTS,
        costCenters: INITIAL_COD_COST_CENTERS,
        accounts: INITIAL_COD_ACCOUNTS,
        concepts: INITIAL_COD_CONCEPTS,
        incomes: INITIAL_COD_INCOMES,
        expenses: INITIAL_COD_EXPENSES,
        loansCredits: INITIAL_COD_LOANS_CREDITS,
        notifications: [],
      }),
      'Error al restablecer datos en Supabase'
    );
  };

  return (
    <CODContext.Provider
      value={{
        users,
        currentUser,
        login,
        logout,
        updateCurrentUserProfile,
        changeCurrentUserPassword,
        upsertTeamUser,
        deleteTeamUser,
        companies,
        clients,
        costCenters,
        accounts,
        concepts,
        incomes,
        expenses,
        loansCredits,
        notifications,
        unreadNotificationsCount,
        pendingApprovalsCount,
        selectedCompanyFilter,
        setSelectedCompanyFilter,
        lastSync,
        clearLastSync: () => setLastSync(null),
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        approveExpense,
        rejectExpense,
        addLoanCredit,
        updateLoanCredit,
        registerLoanPayment,
        approveLoanDirect,
        rejectLoanDirect,
        deleteLoanCredit,
        markNotificationRead,
        markAllNotificationsRead,
        addCompany,
        updateCompany,
        deleteCompany,
        addClient,
        updateClient,
        deleteClient,
        addCostCenter,
        updateCostCenter,
        deleteCostCenter,
        addAccount,
        updateAccount,
        updateAccountInitialBalance,
        deleteAccount,
        addConcept,
        deleteConcept,
        clearMovementsToZero,
        clearAllToZero,
        resetCODData,
      }}
    >
      {children}
    </CODContext.Provider>
  );
};

export const useCOD = () => {
  const ctx = useContext(CODContext);
  if (!ctx) throw new Error('useCOD must be used inside CODProvider');
  return ctx;
};
