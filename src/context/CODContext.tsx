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
  dbClearMovementsToZero,
  dbSyncFullSnapshot,
} from '../lib/cdoSupabaseSync';

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

export interface CODExpense {
  id: string;
  movNumber: number;
  concept: string;
  date: string;
  projectId: string;
  projectName: string;
  companyId: string;
  companyName: string;
  subtotal: number;
  iva: number;
  total: number;
  accountId: string;
  accountName: string;
  capturedVia: 'Manual' | 'WhatsApp OCR';
  timestamp: number;
}

export interface CODSyncBanner {
  id: string;
  kind: 'ingreso' | 'egreso' | 'cuenta' | 'catalogo';
  title: string;
  detail: string;
  timestamp: number;
}

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
    timestamp: 1794441600000,
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
  companyId: string;
  accountId: string;
  subtotal: number;
  capturedVia: 'Manual' | 'WhatsApp OCR';
}

export interface AddCODAccountInput {
  name: string;
  accountNumber?: string;
  type: 'banco' | 'efectivo';
  companyId: string;
  initialBalance: number;
}

interface CODContextType {
  companies: CODCompany[];
  clients: CODClient[];
  costCenters: CODCostCenter[];
  accounts: CODAccountComputed[];
  concepts: CODConceptItem[];
  incomes: CODIncome[];
  expenses: CODExpense[];
  selectedCompanyFilter: string;
  setSelectedCompanyFilter: (id: string) => void;
  lastSync: CODSyncBanner | null;
  clearLastSync: () => void;

  // Incomes CRUD
  addIncome: (input: AddCODIncomeInput) => CODIncome;
  updateIncome: (id: string, input: AddCODIncomeInput) => void;
  deleteIncome: (id: string) => void;

  // Expenses CRUD
  addExpense: (input: AddCODExpenseInput) => CODExpense;
  updateExpense: (id: string, input: AddCODExpenseInput) => void;
  deleteExpense: (id: string) => void;

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
  companies: 'pc_cdo_v2_companies',
  clients: 'pc_cdo_v2_clients',
  costCenters: 'pc_cdo_v2_obras',
  accounts: 'pc_cdo_v2_accounts',
  concepts: 'pc_cdo_v2_concepts',
  incomes: 'pc_cdo_v2_incomes',
  expenses: 'pc_cdo_v2_expenses',
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
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');

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
    loadCODStored(STORAGE_KEYS.expenses, INITIAL_COD_EXPENSES)
  );
  const [lastSync, setLastSync] = useState<CODSyncBanner | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.version, '2');
  }, []);

  // Silent Supabase hydration on mount
  useEffect(() => {
    let active = true;
    fetchAllCDOFromSupabase().then((remote) => {
      if (!active || !remote) return;
      setCompanies(remote.companies);
      setClients(remote.clients);
      setRawCostCenters(remote.costCenters);
      setBaseAccounts(remote.accounts);
      if (remote.concepts.length > 0) setConcepts(remote.concepts);
      setRawIncomes(remote.incomes);
      setRawExpenses(remote.expenses);
    });
    return () => {
      active = false;
    };
  }, []);

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
      return {
        ...exp,
        companyName: comp?.name || exp.companyName,
        accountName: acc?.name || exp.accountName,
        projectName: proj?.name || exp.projectName,
      };
    });
  }, [rawExpenses, companies, baseAccounts, costCenters]);

  // Real-time automatic bank & cash balance computation: Saldo Inicial + Ingresos - Egresos
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
          .filter((exp) => exp.accountId === acc.id)
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
    void dbUpsertIncome(record).catch(console.error);
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
    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = input.projectId ? costCenters.find((p) => p.id === input.projectId) : undefined;
    const client = input.clientId ? clients.find((c) => c.id === input.clientId) : undefined;

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);

    setRawIncomes((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated: CODIncome = {
          ...item,
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
        void dbUpsertIncome(updated).catch(console.error);
        return updated;
      })
    );

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
    void dbDeleteIncome(id).catch(console.error);
  };

  // EXPENSES CRUD
  const addExpense = (input: AddCODExpenseInput): CODExpense => {
    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = costCenters.find((p) => p.id === input.projectId) || costCenters[0];

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);
    const nextMov =
      rawExpenses.length > 0 ? Math.max(...rawExpenses.map((e) => e.movNumber)) + 1 : 1;

    const record: CODExpense = {
      id: `egr-${Date.now()}`,
      movNumber: nextMov,
      concept: input.concept.trim(),
      date: input.date,
      projectId: project?.id || input.projectId,
      projectName: project?.name || 'Obra General',
      companyId: company?.id || input.companyId,
      companyName: company?.name || input.companyId,
      subtotal,
      iva,
      total,
      accountId: account?.id || input.accountId,
      accountName: account?.name || input.accountId,
      capturedVia: input.capturedVia,
      timestamp: Date.now(),
    };

    setRawExpenses((prev) => [...prev, record]);
    void dbUpsertExpense(record).catch(console.error);
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'egreso',
      title: `Egreso #${nextMov} (${input.capturedVia}) sincronizado`,
      detail: `-$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/IVA de ${record.accountName} · Obra: ${record.projectName} (${record.companyName})`,
      timestamp: Date.now(),
    });

    return record;
  };

  const updateExpense = (id: string, input: AddCODExpenseInput) => {
    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = costCenters.find((p) => p.id === input.projectId) || costCenters[0];

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);

    setRawExpenses((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated: CODExpense = {
          ...item,
          concept: input.concept.trim(),
          date: input.date,
          projectId: project?.id || input.projectId,
          projectName: project?.name || item.projectName,
          companyId: company?.id || input.companyId,
          companyName: company?.name || item.companyName,
          accountId: account?.id || input.accountId,
          accountName: account?.name || item.accountName,
          subtotal,
          iva,
          total,
          capturedVia: input.capturedVia,
        };
        void dbUpsertExpense(updated).catch(console.error);
        return updated;
      })
    );

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
    void dbDeleteExpense(id).catch(console.error);
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
    void dbUpsertCompany(newCo).catch(console.error);
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
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...data };
        void dbUpsertCompany(updated).catch(console.error);
        return updated;
      })
    );
  };

  const deleteCompany = (id: string): boolean => {
    if (companies.length <= 1) return false;
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    void dbDeleteCompany(id).catch(console.error);
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
    void dbUpsertClient(newClient).catch(console.error);
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
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, ...data };
        void dbUpsertClient(updated).catch(console.error);
        return updated;
      })
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    void dbDeleteClient(id).catch(console.error);
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
    void dbUpsertProject(newObra).catch(console.error);
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
    setRawCostCenters((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const updated = { ...o, ...data };
        void dbUpsertProject(updated).catch(console.error);
        return updated;
      })
    );
  };

  const deleteCostCenter = (id: string) => {
    setRawCostCenters((prev) => prev.filter((o) => o.id !== id));
    void dbDeleteProject(id).catch(console.error);
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
    void dbUpsertAccount(newAcc).catch(console.error);
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
    setBaseAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== id) return acc;
        const updated: CODAccount = {
          ...acc,
          ...data,
          initialBalance:
            data.initialBalance !== undefined
              ? round2(Math.max(0, data.initialBalance))
              : acc.initialBalance,
        };
        void dbUpsertAccount(updated).catch(console.error);
        return updated;
      })
    );
  };

  const updateAccountInitialBalance = (accountId: string, newInitialBalance: number) => {
    updateAccount(accountId, { initialBalance: newInitialBalance });
  };

  const deleteAccount = (id: string): boolean => {
    if (baseAccounts.length <= 1) return false;
    setBaseAccounts((prev) => prev.filter((a) => a.id !== id));
    void dbDeleteAccount(id).catch(console.error);
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
    void dbUpsertConcept(newConcept).catch(console.error);
    return newConcept;
  };

  const deleteConcept = (id: string) => {
    setConcepts((prev) => prev.filter((c) => c.id !== id));
    void dbDeleteConcept(id).catch(console.error);
  };

  // RESET / START FROM ZERO
  const clearMovementsToZero = () => {
    setRawIncomes([]);
    setRawExpenses([]);
    setBaseAccounts((prev) => prev.map((a) => ({ ...a, initialBalance: 0 })));
    void dbClearMovementsToZero().catch(console.error);
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
    setSelectedCompanyFilter('ALL');
    void dbSyncFullSnapshot({
      companies: [primarySa],
      clients: [],
      costCenters: [],
      accounts: [primaryAcc],
      concepts,
      incomes: [],
      expenses: [],
    }).catch(console.error);
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
    setSelectedCompanyFilter('ALL');
    setLastSync(null);
    void dbSyncFullSnapshot({
      companies: INITIAL_COD_COMPANIES,
      clients: INITIAL_COD_CLIENTS,
      costCenters: INITIAL_COD_COST_CENTERS,
      accounts: INITIAL_COD_ACCOUNTS,
      concepts: INITIAL_COD_CONCEPTS,
      incomes: INITIAL_COD_INCOMES,
      expenses: INITIAL_COD_EXPENSES,
    }).catch(console.error);
  };

  return (
    <CODContext.Provider
      value={{
        companies,
        clients,
        costCenters,
        accounts,
        concepts,
        incomes,
        expenses,
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
