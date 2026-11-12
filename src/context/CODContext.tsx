import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface CODCompany {
  id: string;
  name: string;
  shortName: string;
}

export interface CODCostCenter {
  id: string;
  name: string;
  companyId: string;
}

export interface CODAccount {
  id: string;
  name: string;
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

export interface CODIncome {
  id: string;
  movNumber: number;
  concept: string;
  date: string;
  companyId: string;
  companyName: string;
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
  kind: 'ingreso' | 'egreso' | 'cuenta';
  title: string;
  detail: string;
  timestamp: number;
}

export const INITIAL_COD_COMPANIES: CODCompany[] = [
  { id: 'sa-1', name: 'S.A. Constructora 1', shortName: 'Constructora 1' },
  { id: 'sa-2', name: 'S.A. Inmobiliaria 2', shortName: 'Inmobiliaria 2' },
  { id: 'sa-3', name: 'S.A. Fabricación 3', shortName: 'Fabricación 3' },
];

export const INITIAL_COD_COST_CENTERS: CODCostCenter[] = [
  { id: 'obra-juarez', name: 'Obra Juárez 150', companyId: 'sa-1' },
  { id: 'obra-corp', name: 'Corporativo Reforma', companyId: 'sa-2' },
  { id: 'obra-mob', name: 'Obra Mobiliario Especial', companyId: 'sa-3' },
  { id: 'obra-nave', name: 'Nave Industrial Norte', companyId: 'sa-1' },
  { id: 'obra-plaza', name: 'Plaza Mirador', companyId: 'sa-2' },
];

export const INITIAL_COD_ACCOUNTS: CODAccount[] = [
  { id: 'acc-banorte', name: 'Banorte', type: 'banco', companyId: 'sa-1', initialBalance: 200000 },
  { id: 'acc-ixe', name: 'IXE', type: 'banco', companyId: 'sa-2', initialBalance: 150000 },
  { id: 'acc-banregio', name: 'Banregio', type: 'banco', companyId: 'sa-3', initialBalance: 80000 },
  { id: 'acc-efectivo', name: 'Caja Chica / Efectivo', type: 'efectivo', companyId: 'sa-1', initialBalance: 0 },
];

export const INITIAL_COD_INCOMES: CODIncome[] = [
  {
    id: 'inc-1',
    movNumber: 1,
    concept: 'Anticipo Obra Juárez 150',
    date: '2026-11-01',
    companyId: 'sa-1',
    companyName: 'S.A. Constructora 1',
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

interface AddCODIncomeInput {
  concept: string;
  date: string;
  companyId: string;
  subtotal: number; // Monto s/IVA -> el sistema calcula IVA 16% y Total c/IVA
  accountId: string;
  projectId?: string;
}

interface AddCODExpenseInput {
  concept: string;
  date: string;
  projectId: string; // Obra (Centro de Costos)
  companyId: string; // S.A. pagadora
  accountId: string; // Cuenta de origen
  subtotal: number;
  capturedVia: 'Manual' | 'WhatsApp OCR';
}

interface AddCODAccountInput {
  name: string;
  type: 'banco' | 'efectivo';
  companyId: string;
  initialBalance: number;
}

interface CODContextType {
  companies: CODCompany[];
  costCenters: CODCostCenter[];
  accounts: CODAccountComputed[];
  incomes: CODIncome[];
  expenses: CODExpense[];
  selectedCompanyFilter: string;
  setSelectedCompanyFilter: (id: string) => void;
  lastSync: CODSyncBanner | null;
  clearLastSync: () => void;
  addIncome: (input: AddCODIncomeInput) => CODIncome;
  deleteIncome: (id: string) => void;
  addExpense: (input: AddCODExpenseInput) => CODExpense;
  deleteExpense: (id: string) => void;
  addCostCenter: (name: string, companyId: string) => CODCostCenter;
  addAccount: (input: AddCODAccountInput) => CODAccount;
  updateAccountInitialBalance: (accountId: string, newInitialBalance: number) => void;
  resetCODData: () => void;
}

const CODContext = createContext<CODContextType | undefined>(undefined);

const STORAGE_KEYS = {
  version: 'pc_cod_schema_v1',
  costCenters: 'pc_cod_v1_obras',
  accounts: 'pc_cod_v1_accounts',
  incomes: 'pc_cod_v1_incomes',
  expenses: 'pc_cod_v1_expenses',
};

function loadCODStored<T>(key: string, fallback: T): T {
  if (localStorage.getItem(STORAGE_KEYS.version) !== '1') {
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
  const [companies] = useState<CODCompany[]>(INITIAL_COD_COMPANIES);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('ALL');

  const [costCenters, setCostCenters] = useState<CODCostCenter[]>(() =>
    loadCODStored(STORAGE_KEYS.costCenters, INITIAL_COD_COST_CENTERS)
  );
  const [baseAccounts, setBaseAccounts] = useState<CODAccount[]>(() =>
    loadCODStored(STORAGE_KEYS.accounts, INITIAL_COD_ACCOUNTS)
  );
  const [incomes, setIncomes] = useState<CODIncome[]>(() =>
    loadCODStored(STORAGE_KEYS.incomes, INITIAL_COD_INCOMES)
  );
  const [expenses, setExpenses] = useState<CODExpense[]>(() =>
    loadCODStored(STORAGE_KEYS.expenses, INITIAL_COD_EXPENSES)
  );
  const [lastSync, setLastSync] = useState<CODSyncBanner | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.version, '1');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.costCenters, JSON.stringify(costCenters));
  }, [costCenters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(baseAccounts));
  }, [baseAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.incomes, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
  }, [expenses]);

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

  const addIncome = (input: AddCODIncomeInput): CODIncome => {
    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = input.projectId
      ? costCenters.find((p) => p.id === input.projectId)
      : undefined;

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);
    const nextMov =
      incomes.length > 0 ? Math.max(...incomes.map((i) => i.movNumber)) + 1 : 1;

    const record: CODIncome = {
      id: `inc-${Date.now()}`,
      movNumber: nextMov,
      concept: input.concept.trim(),
      date: input.date,
      companyId: company.id,
      companyName: company.name,
      subtotal,
      iva,
      total,
      accountId: account.id,
      accountName: account.name,
      projectId: project?.id,
      projectName: project?.name,
      timestamp: Date.now(),
    };

    setIncomes((prev) => [...prev, record]);
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'ingreso',
      title: `Ingreso #${nextMov} registrado y sincronizado`,
      detail: `+$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/IVA en ${account.name} (${company.name})`,
      timestamp: Date.now(),
    });

    return record;
  };

  const deleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((item) => item.id !== id));
  };

  const addExpense = (input: AddCODExpenseInput): CODExpense => {
    const company = companies.find((c) => c.id === input.companyId) || companies[0];
    const account = baseAccounts.find((a) => a.id === input.accountId) || baseAccounts[0];
    const project = costCenters.find((p) => p.id === input.projectId) || costCenters[0];

    const subtotal = round2(Math.max(0, input.subtotal));
    const iva = round2(subtotal * 0.16);
    const total = round2(subtotal + iva);
    const nextMov =
      expenses.length > 0 ? Math.max(...expenses.map((e) => e.movNumber)) + 1 : 1;

    const record: CODExpense = {
      id: `egr-${Date.now()}`,
      movNumber: nextMov,
      concept: input.concept.trim(),
      date: input.date,
      projectId: project.id,
      projectName: project.name,
      companyId: company.id,
      companyName: company.name,
      subtotal,
      iva,
      total,
      accountId: account.id,
      accountName: account.name,
      capturedVia: input.capturedVia,
      timestamp: Date.now(),
    };

    setExpenses((prev) => [...prev, record]);
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'egreso',
      title: `Egreso #${nextMov} (${input.capturedVia}) sincronizado`,
      detail: `-$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} c/IVA de ${account.name} · Obra: ${project.name} (${company.name})`,
      timestamp: Date.now(),
    });

    return record;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const addCostCenter = (name: string, companyId: string): CODCostCenter => {
    const newObra: CODCostCenter = {
      id: `obra-${Date.now()}`,
      name: name.trim(),
      companyId,
    };
    setCostCenters((prev) => [...prev, newObra]);
    return newObra;
  };

  const addAccount = (input: AddCODAccountInput): CODAccount => {
    const newAcc: CODAccount = {
      id: `acc-${Date.now()}`,
      name: input.name.trim(),
      type: input.type,
      companyId: input.companyId,
      initialBalance: round2(Math.max(0, input.initialBalance)),
    };
    setBaseAccounts((prev) => [...prev, newAcc]);
    const companyName = companies.find((c) => c.id === input.companyId)?.name || input.companyId;
    setLastSync({
      id: `sync-${Date.now()}`,
      kind: 'cuenta',
      title: `Cuenta "${newAcc.name}" agregada`,
      detail: `Asociada a ${companyName} con Saldo Inicial de $${newAcc.initialBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      timestamp: Date.now(),
    });
    return newAcc;
  };

  const updateAccountInitialBalance = (accountId: string, newInitialBalance: number) => {
    setBaseAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, initialBalance: round2(Math.max(0, newInitialBalance)) }
          : acc
      )
    );
  };

  const resetCODData = () => {
    setCostCenters(INITIAL_COD_COST_CENTERS);
    setBaseAccounts(INITIAL_COD_ACCOUNTS);
    setIncomes(INITIAL_COD_INCOMES);
    setExpenses(INITIAL_COD_EXPENSES);
    setLastSync(null);
  };

  return (
    <CODContext.Provider
      value={{
        companies,
        costCenters,
        accounts,
        incomes,
        expenses,
        selectedCompanyFilter,
        setSelectedCompanyFilter,
        lastSync,
        clearLastSync: () => setLastSync(null),
        addIncome,
        deleteIncome,
        addExpense,
        deleteExpense,
        addCostCenter,
        addAccount,
        updateAccountInitialBalance,
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
