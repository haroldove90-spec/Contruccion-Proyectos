import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  Project,
  BankAccount,
  IncomeRecord,
  Expense,
  AccountPayable,
  AccountReceivable,
  Estimation,
  AccountingSeat,
  BankMovement,
  Company,
} from '../types/erp';
import {
  INITIAL_COMPANIES,
  INITIAL_PROJECTS,
  INITIAL_ACCOUNTS,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_MOVEMENTS,
  INITIAL_PAYABLES,
  INITIAL_RECEIVABLES,
  INITIAL_ESTIMATIONS,
  INITIAL_SEATS,
} from '../data/mockData';
import { ControlTipo1Store } from '../types/controlTipo1';
import { INITIAL_CONTROL_TIPO1_DATA, createEmptyControlTipo1Data } from '../data/controlTipo1Mock';
import { ControlTipo4DStore } from '../types/controlTipo4D';
import { INITIAL_CONTROL_TIPO4D_DATA, createEmptyControlTipo4DData } from '../data/controlTipo4DMock';
import { ControlledProject } from '../types/projectControl';
import { INITIAL_CONTROLLED_PROJECTS } from '../data/controlledProjectsMock';

export type SubmoduleTipo1Key =
  | 'control_general'
  | 'presupuesto_aditivas'
  | 'mano_obra'
  | 'subcontratos'
  | 'materiales'
  | 'materiales_cliente';

export type SubmoduleTipo4DKey =
  | 'control_general_4d'
  | 'bitacora_observaciones'
  | 'materiales_cliente_4d';

export interface AddIncomeParams {
  subtotal: number; // Monto s/IVA (el sistema calcula automáticamente 16% IVA y Total c/IVA)
  companyId: string; // S.A. facturadora
  accountId: string; // Cuenta de depósito
  projectId?: string;
  estimationId?: string;
  client: string;
  concept: string;
  invoiceNumber?: string;
  date?: string;
}

export interface AddExpenseParams {
  projectId: string; // Obra (Centro de Costos)
  companyId: string; // S.A. pagadora
  accountId: string; // Cuenta de origen
  provider: string;
  category: string;
  amount: number; // Total c/IVA
  subtotal: number;
  iva: number;
  date: string;
  paymentMethod: Expense['paymentMethod'];
  invoiceFolio: string;
  capturedVia: 'whatsapp' | 'manual';
  notes?: string;
}

export interface LastSingleEntryImpact {
  kind: 'egreso' | 'ingreso';
  expense?: Expense;
  income?: IncomeRecord;
  accountingSeat: AccountingSeat;
  impactSummary: {
    costCenter: string;
    treasury: string;
    payables: string;
    accounting: string;
  };
}

interface ERPContextType {
  currentRole: UserRole | null;
  setCurrentRole: (role: UserRole | null) => void;
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
  activeModule: string;
  setActiveModule: (mod: string) => void;
  companies: Company[];
  projects: Project[];
  accounts: BankAccount[];
  incomes: IncomeRecord[];
  expenses: Expense[];
  payables: AccountPayable[];
  receivables: AccountReceivable[];
  estimations: Estimation[];
  accountingSeats: AccountingSeat[];
  bankMovements: BankMovement[];

  // Single Entry Load Actions (Principio de Carga Única)
  registerSingleEntryIncome: (params: AddIncomeParams) => {
    income: IncomeRecord;
    accountingSeat: AccountingSeat;
    impactSummary: {
      costCenter: string;
      treasury: string;
      payables: string;
      accounting: string;
    };
  };

  registerSingleEntryExpense: (params: AddExpenseParams) => {
    expense: Expense;
    accountingSeat: AccountingSeat;
    impactSummary: {
      costCenter: string;
      treasury: string;
      payables: string;
      accounting: string;
    };
  };

  createProject: (projectData: Omit<Project, 'id' | 'spent' | 'billed' | 'collected' | 'financialProgress'>) => void;
  updatePhysicalProgress: (projectId: string, newPercent: number) => void;
  createEstimation: (estimationData: {
    projectId: string;
    period: string;
    advancePercent: number;
    grossAmount: number;
  }) => void;
  collectEstimationPayment: (
    estimationId: string,
    accountId: string,
    companyId?: string,
    subtotalOverride?: number
  ) => void;
  transferBetweenAccounts: (sourceAccId: string, destAccId: string, amount: number, concept: string) => void;
  resetAllData: () => void;
  lastSingleEntryImpact: LastSingleEntryImpact | null;
  clearLastImpact: () => void;

  controlTipo1Data: ControlTipo1Store;
  updateControlTipo1Data: (updaterOrPartial: Partial<ControlTipo1Store> | ((prev: ControlTipo1Store) => ControlTipo1Store)) => void;
  resetControlTipo1Data: () => void;
  getProjectTipo1Data: (projectId: string) => ControlTipo1Store;
  activeSubTipo1: SubmoduleTipo1Key;
  setActiveSubTipo1: (sub: SubmoduleTipo1Key) => void;

  controlTipo4DData: ControlTipo4DStore;
  updateControlTipo4DData: (updaterOrPartial: Partial<ControlTipo4DStore> | ((prev: ControlTipo4DStore) => ControlTipo4DStore)) => void;
  resetControlTipo4DData: () => void;
  getProjectTipo3mData: (projectId: string) => ControlTipo4DStore;
  activeSubTipo4D: SubmoduleTipo4DKey;
  setActiveSubTipo4D: (sub: SubmoduleTipo4DKey) => void;

  controlledProjects: ControlledProject[];
  activeControlledProjectId: string;
  setActiveControlledProjectId: (id: string) => void;
  activeControlledProject: ControlledProject;
  addControlledProject: (project: Omit<ControlledProject, 'id'>) => ControlledProject;
  deleteControlledProject: (id: string) => void;
  projectWorkspaceMode: 'catalog' | 'workspace';
  setProjectWorkspaceMode: (mode: 'catalog' | 'workspace') => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const SCHEMA_VERSION_KEY = 'pc_erp_schema_v2';

function readStored<T>(key: string, fallback: T): T {
  if (localStorage.getItem(SCHEMA_VERSION_KEY) !== '2') {
    return fallback;
  }
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('pc_erp_role');
    if (saved === 'null') return null;
    return 'cod';
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string>('ALL');
  const [activeModule, setActiveModule] = useState<string>('cod_resumen');

  const [companies] = useState<Company[]>(INITIAL_COMPANIES);

  const [projects, setProjects] = useState<Project[]>(() =>
    readStored<Project[]>('pc_erp_v2_projects', INITIAL_PROJECTS)
  );

  const [baseAccounts, setBaseAccounts] = useState<BankAccount[]>(() =>
    readStored<BankAccount[]>('pc_erp_v2_accounts', INITIAL_ACCOUNTS)
  );

  const [incomes, setIncomes] = useState<IncomeRecord[]>(() =>
    readStored<IncomeRecord[]>('pc_erp_v2_incomes', INITIAL_INCOMES)
  );

  const [expenses, setExpenses] = useState<Expense[]>(() =>
    readStored<Expense[]>('pc_erp_v2_expenses', INITIAL_EXPENSES)
  );

  const [bankMovements, setBankMovements] = useState<BankMovement[]>(() =>
    readStored<BankMovement[]>('pc_erp_v2_movements', INITIAL_MOVEMENTS)
  );

  const [payables, setPayables] = useState<AccountPayable[]>(() =>
    readStored<AccountPayable[]>('pc_erp_v2_payables', INITIAL_PAYABLES)
  );

  const [receivables, setReceivables] = useState<AccountReceivable[]>(() =>
    readStored<AccountReceivable[]>('pc_erp_v2_receivables', INITIAL_RECEIVABLES)
  );

  const [estimations, setEstimations] = useState<Estimation[]>(() =>
    readStored<Estimation[]>('pc_erp_v2_estimations', INITIAL_ESTIMATIONS)
  );

  const [accountingSeats, setAccountingSeats] = useState<AccountingSeat[]>(() =>
    readStored<AccountingSeat[]>('pc_erp_v2_seats', INITIAL_SEATS)
  );

  const [lastSingleEntryImpact, setLastSingleEntryImpact] = useState<LastSingleEntryImpact | null>(null);

  // Compute real-time bank balances automatically from initialBalance + inflows - outflows
  const accounts = useMemo<BankAccount[]>(() => {
    return baseAccounts.map((acc) => {
      const inflows = bankMovements
        .filter(
          (m) =>
            m.accountId === acc.id &&
            (m.type === 'ingreso' || m.type === 'transferencia_entrada')
        )
        .reduce((sum, m) => sum + m.amount, 0);
      const outflows = bankMovements
        .filter(
          (m) =>
            m.accountId === acc.id &&
            (m.type === 'egreso' || m.type === 'transferencia_salida')
        )
        .reduce((sum, m) => sum + m.amount, 0);

      return {
        ...acc,
        currentBalance: Number((acc.initialBalance + inflows - outflows).toFixed(2)),
      };
    });
  }, [baseAccounts, bankMovements]);

  // Mark schema v2 ready and sync to localStorage
  useEffect(() => {
    localStorage.setItem(SCHEMA_VERSION_KEY, '2');
  }, []);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_accounts', JSON.stringify(baseAccounts));
  }, [baseAccounts]);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_movements', JSON.stringify(bankMovements));
  }, [bankMovements]);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_payables', JSON.stringify(payables));
  }, [payables]);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_receivables', JSON.stringify(receivables));
  }, [receivables]);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_estimations', JSON.stringify(estimations));
  }, [estimations]);

  useEffect(() => {
    localStorage.setItem('pc_erp_v2_seats', JSON.stringify(accountingSeats));
  }, [accountingSeats]);

  const [controlledProjects, setControlledProjects] = useState<ControlledProject[]>(() => {
    const saved = localStorage.getItem('pc_erp_controlled_projects');
    return saved ? JSON.parse(saved) : INITIAL_CONTROLLED_PROJECTS;
  });

  const [activeControlledProjectId, setActiveControlledProjectIdState] = useState<string>(() => {
    const saved = localStorage.getItem('pc_erp_active_controlled_proj_id');
    return saved || 'proj-p0-00';
  });

  const [tipo1DataByProject, setTipo1DataByProject] = useState<Record<string, ControlTipo1Store>>(() => {
    const saved = localStorage.getItem('pc_erp_tipo1_by_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const singleSaved = localStorage.getItem('pc_erp_control_tipo1');
    const p00Data = singleSaved ? JSON.parse(singleSaved) : INITIAL_CONTROL_TIPO1_DATA;
    return {
      'proj-p0-00': p00Data,
    };
  });

  const [tipo3mDataByProject, setTipo3mDataByProject] = useState<Record<string, ControlTipo4DStore>>(() => {
    const saved = localStorage.getItem('pc_erp_tipo3m_by_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    const singleSaved = localStorage.getItem('pc_erp_control_tipo4d');
    const p01Data = singleSaved ? JSON.parse(singleSaved) : INITIAL_CONTROL_TIPO4D_DATA;
    return {
      'proj-p0-01': p01Data,
    };
  });

  const [activeSubTipo1, setActiveSubTipo1] = useState<SubmoduleTipo1Key>('control_general');
  const [activeSubTipo4D, setActiveSubTipo4D] = useState<SubmoduleTipo4DKey>('control_general_4d');

  useEffect(() => {
    localStorage.setItem('pc_erp_controlled_projects', JSON.stringify(controlledProjects));
  }, [controlledProjects]);

  useEffect(() => {
    localStorage.setItem('pc_erp_active_controlled_proj_id', activeControlledProjectId);
  }, [activeControlledProjectId]);

  const [projectWorkspaceMode, setProjectWorkspaceMode] = useState<'catalog' | 'workspace'>('catalog');

  useEffect(() => {
    localStorage.setItem('pc_erp_tipo1_by_project', JSON.stringify(tipo1DataByProject));
  }, [tipo1DataByProject]);

  useEffect(() => {
    localStorage.setItem('pc_erp_tipo3m_by_project', JSON.stringify(tipo3mDataByProject));
  }, [tipo3mDataByProject]);

  const activeControlledProject =
    controlledProjects.find((p) => p.id === activeControlledProjectId) || controlledProjects[0];

  const getProjectTipo1Data = (projectId: string): ControlTipo1Store => {
    if (tipo1DataByProject[projectId]) {
      return tipo1DataByProject[projectId];
    }
    if (projectId === 'proj-p0-00') {
      return INITIAL_CONTROL_TIPO1_DATA;
    }
    const targetProj = controlledProjects.find((p) => p.id === projectId);
    return createEmptyControlTipo1Data(targetProj?.initialBudget || 0);
  };

  const getProjectTipo3mData = (projectId: string): ControlTipo4DStore => {
    if (tipo3mDataByProject[projectId]) {
      return tipo3mDataByProject[projectId];
    }
    if (projectId === 'proj-p0-01') {
      return INITIAL_CONTROL_TIPO4D_DATA;
    }
    const targetProj = controlledProjects.find((p) => p.id === projectId);
    return createEmptyControlTipo4DData(targetProj?.name || '');
  };

  const controlTipo1Data = getProjectTipo1Data(activeControlledProjectId);
  const controlTipo4DData = getProjectTipo3mData(activeControlledProjectId);

  const updateControlTipo1Data = (
    updaterOrPartial: Partial<ControlTipo1Store> | ((prev: ControlTipo1Store) => ControlTipo1Store)
  ) => {
    setTipo1DataByProject((prev) => {
      const current = prev[activeControlledProjectId] || getProjectTipo1Data(activeControlledProjectId);
      const updated =
        typeof updaterOrPartial === 'function' ? updaterOrPartial(current) : { ...current, ...updaterOrPartial };
      return {
        ...prev,
        [activeControlledProjectId]: updated,
      };
    });
  };

  const resetControlTipo1Data = () => {
    setTipo1DataByProject((prev) => {
      const copy = { ...prev };
      if (activeControlledProjectId === 'proj-p0-00') {
        copy[activeControlledProjectId] = INITIAL_CONTROL_TIPO1_DATA;
      } else {
        const targetProj = controlledProjects.find((p) => p.id === activeControlledProjectId);
        copy[activeControlledProjectId] = createEmptyControlTipo1Data(targetProj?.initialBudget || 0);
      }
      return copy;
    });
  };

  const updateControlTipo4DData = (
    updaterOrPartial: Partial<ControlTipo4DStore> | ((prev: ControlTipo4DStore) => ControlTipo4DStore)
  ) => {
    setTipo3mDataByProject((prev) => {
      const current = prev[activeControlledProjectId] || getProjectTipo3mData(activeControlledProjectId);
      const updated =
        typeof updaterOrPartial === 'function' ? updaterOrPartial(current) : { ...current, ...updaterOrPartial };
      return {
        ...prev,
        [activeControlledProjectId]: updated,
      };
    });
  };

  const resetControlTipo4DData = () => {
    setTipo3mDataByProject((prev) => {
      const copy = { ...prev };
      if (activeControlledProjectId === 'proj-p0-01') {
        copy[activeControlledProjectId] = INITIAL_CONTROL_TIPO4D_DATA;
      } else {
        const targetProj = controlledProjects.find((p) => p.id === activeControlledProjectId);
        copy[activeControlledProjectId] = createEmptyControlTipo4DData(targetProj?.name || '');
      }
      return copy;
    });
  };

  const setActiveControlledProjectId = (id: string) => {
    setActiveControlledProjectIdState(id);
    const targetProj = controlledProjects.find((p) => p.id === id);
    if (targetProj) {
      if (targetProj.controlType === 'tipo1') {
        setActiveModule('control_tipo1');
      } else {
        setActiveModule('control_tipo4d');
      }
    }
  };

  const addControlledProject = (projectData: Omit<ControlledProject, 'id'>) => {
    const newId = `proj-${Date.now()}`;
    const newProj: ControlledProject = {
      ...projectData,
      id: newId,
    };

    if (newProj.controlType === 'tipo1') {
      const emptyStore = createEmptyControlTipo1Data(newProj.initialBudget);
      setTipo1DataByProject((prev) => ({
        ...prev,
        [newId]: emptyStore,
      }));
    } else {
      const emptyStore = createEmptyControlTipo4DData(newProj.name);
      setTipo3mDataByProject((prev) => ({
        ...prev,
        [newId]: emptyStore,
      }));
    }

    setControlledProjects((prev) => [newProj, ...prev]);
    setActiveControlledProjectId(newId);
    setProjectWorkspaceMode('workspace');
    return newProj;
  };

  const deleteControlledProject = (id: string) => {
    setControlledProjects((prev) => prev.filter((p) => p.id !== id));
    setTipo1DataByProject((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setTipo3mDataByProject((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    if (activeControlledProjectId === id) {
      const remaining = controlledProjects.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActiveControlledProjectId(remaining[0].id);
      }
    }
  };

  const setCurrentRole = (role: UserRole | null) => {
    setCurrentRoleState(role);
    if (role) {
      localStorage.setItem('pc_erp_role', role);
      setActiveModule('cod_resumen');
    } else {
      localStorage.setItem('pc_erp_role', 'null');
    }
  };

  /**
   * 🔄 PRINCIPIO DE CARGA ÚNICA — MÓDULO DE INGRESOS
   * Entrada: Monto s/IVA, S.A. facturadora y Cuenta de Depósito.
   * Cálculo automático: IVA 16% y Total c/IVA.
   * Afectación simultánea:
   * 1. Registro de Ingreso fiscal
   * 2. Tesorería (suma Total c/IVA a la Cuenta de Depósito y crea movimiento)
   * 3. Obra / Estimación / CXC (si está vinculado)
   * 4. Contabilidad (Póliza automática de ingreso con IVA trasladado)
   */
  const registerSingleEntryIncome = (params: AddIncomeParams) => {
    const targetCompany = companies.find((c) => c.id === params.companyId) || companies[0];
    const targetAccount = accounts.find((a) => a.id === params.accountId) || accounts[0];
    const targetProject = params.projectId
      ? projects.find((p) => p.id === params.projectId)
      : undefined;

    const subtotal = Number(Number(params.subtotal).toFixed(2));
    const iva = Number((subtotal * 0.16).toFixed(2));
    const total = Number((subtotal + iva).toFixed(2));

    const now = Date.now();
    const dateStr = params.date || new Date().toISOString().split('T')[0];
    const incId = `inc-${now.toString().slice(-6)}`;
    const folio = `COB-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
    const seatId = `AS-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
    const invoiceNumber =
      params.invoiceNumber?.trim() ||
      `FAC-${targetCompany.id}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const newIncome: IncomeRecord = {
      id: incId,
      folio,
      date: dateStr,
      concept: params.concept,
      client: params.client,
      projectId: targetProject?.id,
      projectName: targetProject?.name,
      companyId: targetCompany.id,
      companyName: targetCompany.shortName,
      accountId: targetAccount.id,
      accountName: targetAccount.bankName,
      estimationId: params.estimationId,
      invoiceNumber,
      subtotal,
      iva,
      total,
      accountingSeatId: seatId,
      timestamp: now,
    };

    // 1. Registrar Ingreso
    setIncomes((prev) => [newIncome, ...prev]);

    // 2. Tesorería: crear movimiento de ingreso (el saldo del banco se recalcula automáticamente)
    const newMovement: BankMovement = {
      id: `mov-ing-${now}`,
      accountId: targetAccount.id,
      companyId: targetCompany.id,
      date: dateStr,
      type: 'ingreso',
      amount: total,
      subtotal,
      iva,
      concept: `${params.concept} (${targetCompany.shortName})`,
      reference: invoiceNumber,
      projectId: targetProject?.id,
      status: 'conciliado',
      timestamp: now,
    };
    setBankMovements((prev) => [newMovement, ...prev]);

    // 3. Obra / Estimación / CXC
    if (params.estimationId) {
      const matchedEst = estimations.find((e) => e.id === params.estimationId);
      setEstimations((prev) =>
        prev.map((e) => (e.id === params.estimationId ? { ...e, status: 'cobrada' } : e))
      );
      if (matchedEst) {
        setReceivables((prev) =>
          prev.map((r) =>
            r.projectId === matchedEst.projectId && r.estimationNumber === matchedEst.estimationNumber
              ? { ...r, balance: 0, status: 'cobrado' }
              : r
          )
        );
      }
    }

    if (targetProject) {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== targetProject.id) return p;
          return {
            ...p,
            collected: Number((p.collected + total).toFixed(2)),
            billed: params.estimationId ? p.billed : Number((p.billed + total).toFixed(2)),
          };
        })
      );
    }

    // 4. Póliza contable de Ingreso
    const newSeat: AccountingSeat = {
      id: seatId,
      seatNumber: `POL-ING-${seatId.split('-')[2]}`,
      date: dateStr,
      concept: `Ingreso cobrado [${targetCompany.shortName}] - ${params.concept}`,
      reference: invoiceNumber,
      companyId: targetCompany.id,
      projectId: targetProject?.id,
      lines: [
        {
          accountCode: targetAccount.accountType === 'efectivo' ? '101-01-CAJ' : '102-01-BAN',
          accountName: targetAccount.bankName,
          debit: total,
          credit: 0,
        },
        {
          accountCode: '400-01-ING',
          accountName: `Ingresos Facturados - ${targetCompany.shortName}`,
          debit: 0,
          credit: subtotal,
        },
        {
          accountCode: '208-01-IVA',
          accountName: 'IVA Trasladado Cobrado (16%)',
          debit: 0,
          credit: iva,
        },
      ],
    };
    setAccountingSeats((prev) => [newSeat, ...prev]);

    const impact: LastSingleEntryImpact = {
      kind: 'ingreso',
      income: newIncome,
      accountingSeat: newSeat,
      impactSummary: {
        costCenter: targetProject
          ? `+ $${total.toLocaleString('es-MX')} cobrado en ${targetProject.name}`
          : `Ingreso directo facturado por ${targetCompany.shortName}`,
        treasury: `+ $${total.toLocaleString('es-MX')} depositado en ${targetAccount.bankName}`,
        payables: `CFDI ${invoiceNumber} · s/IVA $${subtotal.toLocaleString('es-MX')} + IVA $${iva.toLocaleString('es-MX')}`,
        accounting: `Póliza ${newSeat.seatNumber} generada (D: Banco, H: Ingreso/IVA 16%)`,
      },
    };
    setLastSingleEntryImpact(impact);

    return {
      income: newIncome,
      accountingSeat: newSeat,
      impactSummary: impact.impactSummary,
    };
  };

  /**
   * 🔄 PRINCIPIO DE CARGA ÚNICA — MÓDULO DE EGRESOS
   * Ligado explícitamente a: Obra (Centro de Costos) + S.A. Pagadora + Cuenta de Origen.
   * Afectación simultánea:
   * 1. Centros de Costos (suma al gasto acumulado de la obra)
   * 2. Tesorería (resta de la Cuenta de Origen y registra movimiento)
   * 3. Cuentas por Pagar / Proveedores (registra el comprobante liquidado bajo la S.A. pagadora)
   * 4. Contabilidad General (asiento contable automático con desglose IVA)
   */
  const registerSingleEntryExpense = (params: AddExpenseParams) => {
    const targetProject = projects.find((p) => p.id === params.projectId) || projects[0];
    const targetCompany =
      companies.find((c) => c.id === params.companyId) ||
      companies.find((c) => c.id === targetProject.companyId) ||
      companies[0];
    const targetAccount = accounts.find((a) => a.id === params.accountId) || accounts[0];

    const now = Date.now();
    const expId = `exp-${now.toString().slice(-6)}`;
    const seatId = `AS-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
    const folio = `OC-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;

    const totalAmount = Number(Number(params.amount).toFixed(2));
    const subtotal = Number(Number(params.subtotal).toFixed(2));
    const iva = Number(Number(params.iva).toFixed(2));

    const newExpense: Expense = {
      id: expId,
      folio,
      projectId: targetProject.id,
      projectName: targetProject.name,
      companyId: targetCompany.id,
      companyName: targetCompany.shortName,
      provider: params.provider,
      category: params.category,
      amount: totalAmount,
      subtotal,
      iva,
      date: params.date,
      accountId: targetAccount.id,
      accountName: targetAccount.bankName,
      paymentMethod: params.paymentMethod,
      invoiceFolio: params.invoiceFolio || `TK-${Math.floor(Math.random() * 80000 + 10000)}`,
      capturedVia: params.capturedVia,
      notes: params.notes,
      accountingSeatId: seatId,
      timestamp: now,
    };

    // 1. AFECTA CENTRO DE COSTOS (Suma al gasto y recalcula % financiero)
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === targetProject.id) {
          const newSpent = Number((p.spent + totalAmount).toFixed(2));
          const newFinProgress =
            p.initialBudget > 0 ? Number(((newSpent / p.initialBudget) * 100).toFixed(1)) : 0;
          return {
            ...p,
            spent: newSpent,
            financialProgress: newFinProgress,
          };
        }
        return p;
      })
    );

    // 2. AFECTA TESORERÍA (Crea movimiento de egreso — el saldo del banco se recalcula automáticamente)
    const newMovement: BankMovement = {
      id: `mov-egr-${now}`,
      accountId: targetAccount.id,
      companyId: targetCompany.id,
      date: params.date,
      type: 'egreso',
      amount: totalAmount,
      subtotal,
      iva,
      concept: `Pago ${params.provider} · ${targetProject.name} (${targetCompany.shortName})`,
      reference: newExpense.invoiceFolio,
      projectId: targetProject.id,
      status: 'conciliado',
      timestamp: now,
    };
    setBankMovements((prev) => [newMovement, ...prev]);

    // 3. AFECTA CUENTAS POR PAGAR (Registra comprobante liquidado con S.A. pagadora)
    const newPayable: AccountPayable = {
      id: `cxp-${now.toString().slice(-5)}`,
      provider: params.provider,
      invoiceNumber: newExpense.invoiceFolio,
      amount: totalAmount,
      balance: 0,
      dueDate: params.date,
      companyId: targetCompany.id,
      projectId: targetProject.id,
      status: 'pagada',
    };
    setPayables((prev) => [newPayable, ...prev]);

    // 4. AFECTA CONTABILIDAD GENERAL
    const newSeat: AccountingSeat = {
      id: seatId,
      seatNumber: `POL-EGR-${seatId.split('-')[2]}`,
      date: params.date,
      concept: `Egreso [${targetCompany.shortName}] ${params.category} - ${params.provider} (${targetProject.name})`,
      reference: newExpense.invoiceFolio,
      companyId: targetCompany.id,
      projectId: targetProject.id,
      lines: [
        {
          accountCode: '500-01-OBR',
          accountName: `Costo Directo de Obra - ${targetProject.name}`,
          debit: subtotal,
          credit: 0,
        },
        {
          accountCode: '118-01-IVA',
          accountName: 'IVA Acreditable en Operación (16%)',
          debit: iva,
          credit: 0,
        },
        {
          accountCode: targetAccount.accountType === 'efectivo' ? '101-01-CAJ' : '102-01-BAN',
          accountName: `${targetAccount.bankName} (${targetCompany.shortName})`,
          debit: 0,
          credit: totalAmount,
        },
      ],
    };
    setAccountingSeats((prev) => [newSeat, ...prev]);
    setExpenses((prev) => [newExpense, ...prev]);

    const impact: LastSingleEntryImpact = {
      kind: 'egreso',
      expense: newExpense,
      accountingSeat: newSeat,
      impactSummary: {
        costCenter: `+ $${totalAmount.toLocaleString('es-MX')} sumado a ${targetProject.name} (${targetCompany.shortName})`,
        treasury: `- $${totalAmount.toLocaleString('es-MX')} debitado de ${targetAccount.bankName}`,
        payables: `Comprobante ${newExpense.invoiceFolio} de ${params.provider} liquidado`,
        accounting: `Póliza ${newSeat.seatNumber} generada (D: Obra/IVA, H: ${targetAccount.bankShortName})`,
      },
    };

    setLastSingleEntryImpact(impact);
    return {
      expense: newExpense,
      accountingSeat: newSeat,
      impactSummary: impact.impactSummary,
    };
  };

  const createProject = (
    data: Omit<Project, 'id' | 'spent' | 'billed' | 'collected' | 'financialProgress'>
  ) => {
    const newP: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      spent: 0,
      billed: 0,
      collected: 0,
      financialProgress: 0,
    };
    setProjects((prev) => [newP, ...prev]);
  };

  const updatePhysicalProgress = (projectId: string, newPercent: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, physicalProgress: Math.min(100, Math.max(0, newPercent)) } : p))
    );
  };

  const createEstimation = (data: {
    projectId: string;
    period: string;
    advancePercent: number;
    grossAmount: number;
  }) => {
    const proj = projects.find((p) => p.id === data.projectId);
    if (!proj) return;

    const retention = data.grossAmount * 0.05;
    const net = data.grossAmount - retention;
    const estCount = estimations.filter((e) => e.projectId === data.projectId).length + 1;
    const estNum = `EST-${estCount < 10 ? '0' + estCount : estCount}`;
    const invoiceNum = `FAC-${proj.companyId}-${Math.floor(Math.random() * 8000 + 1000)}`;

    const newEst: Estimation = {
      id: `est-${Date.now()}`,
      estimationNumber: estNum,
      projectId: proj.id,
      projectName: proj.name,
      companyId: proj.companyId,
      period: data.period,
      physicalAdvancePercent: data.advancePercent,
      cumulativeAdvancePercent: Math.min(100, proj.physicalProgress + data.advancePercent),
      grossAmount: data.grossAmount,
      retentionGuarantee: retention,
      netAmount: net,
      invoiceNumber: invoiceNum,
      status: 'facturada',
      date: new Date().toISOString().split('T')[0],
    };

    setEstimations((prev) => [newEst, ...prev]);

    setProjects((prev) =>
      prev.map((p) => (p.id === proj.id ? { ...p, billed: p.billed + net } : p))
    );

    const newReceivable: AccountReceivable = {
      id: `cxc-${Date.now()}`,
      client: proj.client,
      estimationNumber: estNum,
      projectId: proj.id,
      companyId: proj.companyId,
      amount: net,
      balance: net,
      issueDate: newEst.date,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
      status: 'pendiente',
    };
    setReceivables((prev) => [newReceivable, ...prev]);
  };

  const collectEstimationPayment = (
    estimationId: string,
    accountId: string,
    companyIdOverride?: string,
    subtotalOverride?: number
  ) => {
    const est = estimations.find((e) => e.id === estimationId);
    if (!est) return;
    const proj = projects.find((p) => p.id === est.projectId);
    const subtotalSinIva =
      typeof subtotalOverride === 'number' && subtotalOverride > 0
        ? subtotalOverride
        : Number((est.netAmount / 1.16).toFixed(2));

    registerSingleEntryIncome({
      subtotal: subtotalSinIva,
      companyId: companyIdOverride || est.companyId,
      accountId,
      projectId: est.projectId,
      estimationId: est.id,
      client: proj?.client || 'Cliente de Obra',
      concept: `Cobro ${est.estimationNumber} - ${est.projectName}`,
      invoiceNumber: est.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
    });
  };

  const transferBetweenAccounts = (
    sourceAccId: string,
    destAccId: string,
    amount: number,
    concept: string
  ) => {
    const sourceAcc = accounts.find((a) => a.id === sourceAccId);
    const destAcc = accounts.find((a) => a.id === destAccId);
    if (!sourceAcc || !destAcc || amount <= 0) return;

    const now = Date.now();
    const dateStr = new Date().toISOString().split('T')[0];
    const ref = `TRF-${Math.floor(Math.random() * 9000 + 1000)}`;

    const movOut: BankMovement = {
      id: `mov-trf-out-${now}`,
      accountId: sourceAcc.id,
      companyId: sourceAcc.companyId,
      date: dateStr,
      type: 'transferencia_salida',
      amount,
      concept: `Traspaso enviado a ${destAcc.bankName}: ${concept}`,
      reference: ref,
      status: 'conciliado',
      timestamp: now,
    };

    const movIn: BankMovement = {
      id: `mov-trf-in-${now}`,
      accountId: destAcc.id,
      companyId: destAcc.companyId,
      date: dateStr,
      type: 'transferencia_entrada',
      amount,
      concept: `Traspaso recibido de ${sourceAcc.bankName}: ${concept}`,
      reference: ref,
      status: 'conciliado',
      timestamp: now + 1,
    };

    setBankMovements((prev) => [movIn, movOut, ...prev]);
  };

  const resetAllData = () => {
    localStorage.removeItem('pc_erp_v2_projects');
    localStorage.removeItem('pc_erp_v2_accounts');
    localStorage.removeItem('pc_erp_v2_incomes');
    localStorage.removeItem('pc_erp_v2_expenses');
    localStorage.removeItem('pc_erp_v2_movements');
    localStorage.removeItem('pc_erp_v2_payables');
    localStorage.removeItem('pc_erp_v2_receivables');
    localStorage.removeItem('pc_erp_v2_estimations');
    localStorage.removeItem('pc_erp_v2_seats');
    setProjects(INITIAL_PROJECTS);
    setBaseAccounts(INITIAL_ACCOUNTS);
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    setBankMovements(INITIAL_MOVEMENTS);
    setPayables(INITIAL_PAYABLES);
    setReceivables(INITIAL_RECEIVABLES);
    setEstimations(INITIAL_ESTIMATIONS);
    setAccountingSeats(INITIAL_SEATS);
    setLastSingleEntryImpact(null);
  };

  const clearLastImpact = () => setLastSingleEntryImpact(null);

  return (
    <ERPContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeCompanyId,
        setActiveCompanyId,
        activeModule,
        setActiveModule,
        companies,
        projects,
        accounts,
        incomes,
        expenses,
        payables,
        receivables,
        estimations,
        accountingSeats,
        bankMovements,
        registerSingleEntryIncome,
        registerSingleEntryExpense,
        createProject,
        updatePhysicalProgress,
        createEstimation,
        collectEstimationPayment,
        transferBetweenAccounts,
        resetAllData,
        lastSingleEntryImpact,
        clearLastImpact,
        controlTipo1Data,
        updateControlTipo1Data,
        resetControlTipo1Data,
        getProjectTipo1Data,
        activeSubTipo1,
        setActiveSubTipo1,
        controlTipo4DData,
        updateControlTipo4DData,
        resetControlTipo4DData,
        getProjectTipo3mData,
        activeSubTipo4D,
        setActiveSubTipo4D,
        controlledProjects,
        activeControlledProjectId,
        setActiveControlledProjectId,
        activeControlledProject,
        addControlledProject,
        deleteControlledProject,
        projectWorkspaceMode,
        setProjectWorkspaceMode,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
}
