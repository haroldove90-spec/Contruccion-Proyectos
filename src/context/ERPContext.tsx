import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Project,
  BankAccount,
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
  INITIAL_EXPENSES,
  INITIAL_PAYABLES,
  INITIAL_RECEIVABLES,
  INITIAL_ESTIMATIONS,
  INITIAL_SEATS,
} from '../data/mockData';

interface AddExpenseParams {
  projectId: string;
  provider: string;
  category: string;
  amount: number;
  subtotal: number;
  iva: number;
  date: string;
  accountId: string;
  paymentMethod: Expense['paymentMethod'];
  invoiceFolio: string;
  capturedVia: 'whatsapp' | 'manual';
  notes?: string;
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
  expenses: Expense[];
  payables: AccountPayable[];
  receivables: AccountReceivable[];
  estimations: Estimation[];
  accountingSeats: AccountingSeat[];
  bankMovements: BankMovement[];
  
  // Single Entry Load Action (Principio de Carga Única)
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
  collectEstimationPayment: (estimationId: string, accountId: string) => void;
  transferBetweenAccounts: (sourceAccId: string, destAccId: string, amount: number, concept: string) => void;
  resetAllData: () => void;
  lastSingleEntryImpact: {
    expense: Expense;
    accountingSeat: AccountingSeat;
    impactSummary: {
      costCenter: string;
      treasury: string;
      payables: string;
      accounting: string;
    };
  } | null;
  clearLastImpact: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('pc_erp_role');
    return (saved as UserRole) || null;
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string>('ALL');
  const [activeModule, setActiveModule] = useState<string>('centros_costos');

  const [companies] = useState<Company[]>(INITIAL_COMPANIES);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('pc_erp_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('pc_erp_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('pc_erp_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [payables, setPayables] = useState<AccountPayable[]>(() => {
    const saved = localStorage.getItem('pc_erp_payables');
    return saved ? JSON.parse(saved) : INITIAL_PAYABLES;
  });

  const [receivables, setReceivables] = useState<AccountReceivable[]>(() => {
    const saved = localStorage.getItem('pc_erp_receivables');
    return saved ? JSON.parse(saved) : INITIAL_RECEIVABLES;
  });

  const [estimations, setEstimations] = useState<Estimation[]>(() => {
    const saved = localStorage.getItem('pc_erp_estimations');
    return saved ? JSON.parse(saved) : INITIAL_ESTIMATIONS;
  });

  const [accountingSeats, setAccountingSeats] = useState<AccountingSeat[]>(() => {
    const saved = localStorage.getItem('pc_erp_seats');
    return saved ? JSON.parse(saved) : INITIAL_SEATS;
  });

  const [bankMovements, setBankMovements] = useState<BankMovement[]>([]);

  const [lastSingleEntryImpact, setLastSingleEntryImpact] = useState<ERPContextType['lastSingleEntryImpact']>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('pc_erp_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('pc_erp_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('pc_erp_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('pc_erp_payables', JSON.stringify(payables));
  }, [payables]);

  useEffect(() => {
    localStorage.setItem('pc_erp_receivables', JSON.stringify(receivables));
  }, [receivables]);

  useEffect(() => {
    localStorage.setItem('pc_erp_estimations', JSON.stringify(estimations));
  }, [estimations]);

  useEffect(() => {
    localStorage.setItem('pc_erp_seats', JSON.stringify(accountingSeats));
  }, [accountingSeats]);

  const setCurrentRole = (role: UserRole | null) => {
    setCurrentRoleState(role);
    if (role) {
      localStorage.setItem('pc_erp_role', role);
      // Set appropriate initial view according to role
      if (role === 'socio') setActiveModule('reportes_financieros');
      else if (role === 'admin') setActiveModule('tesoreria');
      else if (role === 'residente') setActiveModule('programa_obra');
      else if (role === 'compras') setActiveModule('whatsapp_ocr');
    } else {
      localStorage.removeItem('pc_erp_role');
    }
  };

  /**
   * 🔄 PRINCIPIO DE CARGA ÚNICA
   * Un solo registro de gasto afecta simultáneamente:
   * 1. Centros de Costos (suma al gasto acumulado de la obra)
   * 2. Tesorería (disminuye saldo de la cuenta/efectivo o tarjeta y registra movimiento)
   * 3. Cuentas por Pagar / Proveedores (registra el pasivo o comprobante liquidado)
   * 4. Contabilidad General (asiento contable automático con desglose IVA)
   */
  const registerSingleEntryExpense = (params: AddExpenseParams) => {
    const targetProject = projects.find((p) => p.id === params.projectId) || projects[0];
    const targetAccount = accounts.find((a) => a.id === params.accountId) || accounts[0];

    const expId = `exp-${Date.now().toString().slice(-5)}`;
    const seatId = `AS-2026-${Math.floor(Math.random() * 900 + 100)}`;
    const folio = `OC-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;

    const newExpense: Expense = {
      id: expId,
      folio,
      projectId: targetProject.id,
      projectName: targetProject.name,
      provider: params.provider,
      category: params.category,
      amount: params.amount,
      subtotal: params.subtotal,
      iva: params.iva,
      date: params.date,
      accountId: targetAccount.id,
      accountName: targetAccount.bankName,
      paymentMethod: params.paymentMethod,
      invoiceFolio: params.invoiceFolio || `TK-${Math.floor(Math.random() * 80000 + 10000)}`,
      capturedVia: params.capturedVia,
      notes: params.notes,
      accountingSeatId: seatId,
      timestamp: Date.now(),
    };

    // 1. AFECTA CENTRO DE COSTOS (Suma al gasto y recalcula % financiero)
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === targetProject.id) {
          const newSpent = p.spent + params.amount;
          const newFinProgress = Number(((newSpent / p.initialBudget) * 100).toFixed(1));
          return {
            ...p,
            spent: newSpent,
            financialProgress: newFinProgress,
          };
        }
        return p;
      })
    );

    // 2. AFECTA TESORERÍA (Disminuye saldo y crea movimiento)
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === targetAccount.id) {
          return {
            ...acc,
            currentBalance: acc.currentBalance - params.amount,
          };
        }
        return acc;
      })
    );

    const newMovement: BankMovement = {
      id: `mov-${Date.now()}`,
      accountId: targetAccount.id,
      date: params.date,
      type: 'egreso',
      amount: params.amount,
      concept: `Pago Gasto ${params.provider} - ${targetProject.name}`,
      reference: newExpense.invoiceFolio,
      projectId: targetProject.id,
      status: 'conciliado',
    };
    setBankMovements((prev) => [newMovement, ...prev]);

    // 3. AFECTA CUENTAS POR PAGAR (Registra comprobante)
    const newPayable: AccountPayable = {
      id: `cxp-${Date.now().toString().slice(-4)}`,
      provider: params.provider,
      invoiceNumber: newExpense.invoiceFolio,
      amount: params.amount,
      balance: 0, // Inmediatamente cubierto por tesorería
      dueDate: params.date,
      companyId: targetProject.companyId,
      projectId: targetProject.id,
      status: 'pagada',
    };
    setPayables((prev) => [newPayable, ...prev]);

    // 4. AFECTA CONTABILIDAD GENERAL (Genera Asiento Contable Automático)
    const newSeat: AccountingSeat = {
      id: seatId,
      seatNumber: `POL-EGR-${seatId.split('-')[2]}`,
      date: params.date,
      concept: `Registro único de compra [${params.category}] - ${params.provider} (${targetProject.name})`,
      reference: newExpense.invoiceFolio,
      projectId: targetProject.id,
      lines: [
        {
          accountCode: '500-01-OBR',
          accountName: `Costo Directo de Obra - ${targetProject.name}`,
          debit: params.subtotal,
          credit: 0,
        },
        {
          accountCode: '118-01-IVA',
          accountName: 'IVA Acreditable en Operación',
          debit: params.iva,
          credit: 0,
        },
        {
          accountCode: targetAccount.accountType === 'efectivo' ? '101-01-CAJ' : '102-01-BAN',
          accountName: targetAccount.bankName,
          debit: 0,
          credit: params.amount,
        },
      ],
    };
    setAccountingSeats((prev) => [newSeat, ...prev]);
    setExpenses((prev) => [newExpense, ...prev]);

    const impact = {
      expense: newExpense,
      accountingSeat: newSeat,
      impactSummary: {
        costCenter: `+ $${params.amount.toLocaleString('es-MX')} sumado a ${targetProject.name}`,
        treasury: `- $${params.amount.toLocaleString('es-MX')} debitado de ${targetAccount.bankName}`,
        payables: `Comprobante ${newExpense.invoiceFolio} de ${params.provider} liquidado`,
        accounting: `Póliza ${newSeat.seatNumber} generada automáticamente (D: Obra/IVA, H: Tesorería)`,
      },
    };

    setLastSingleEntryImpact(impact);
    return impact;
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

    const retention = data.grossAmount * 0.05; // 5% fondo de garantía
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

    // Update project billed amount
    setProjects((prev) =>
      prev.map((p) => (p.id === proj.id ? { ...p, billed: p.billed + net } : p))
    );

    // Create Account Receivable
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

  const collectEstimationPayment = (estimationId: string, accountId: string) => {
    const est = estimations.find((e) => e.id === estimationId);
    const targetAccount = accounts.find((a) => a.id === accountId) || accounts[0];
    if (!est) return;

    // Update estimation status
    setEstimations((prev) =>
      prev.map((e) => (e.id === estimationId ? { ...e, status: 'cobrada' } : e))
    );

    // Update receivables
    setReceivables((prev) =>
      prev.map((r) =>
        r.projectId === est.projectId && r.estimationNumber === est.estimationNumber
          ? { ...r, balance: 0, status: 'cobrado' }
          : r
      )
    );

    // Deposit into bank account
    setAccounts((prev) =>
      prev.map((a) => (a.id === targetAccount.id ? { ...a, currentBalance: a.currentBalance + est.netAmount } : a))
    );

    // Update project collected
    setProjects((prev) =>
      prev.map((p) => (p.id === est.projectId ? { ...p, collected: p.collected + est.netAmount } : p))
    );

    // Add bank movement
    const mov: BankMovement = {
      id: `mov-${Date.now()}`,
      accountId: targetAccount.id,
      date: new Date().toISOString().split('T')[0],
      type: 'ingreso',
      amount: est.netAmount,
      concept: `Cobro de ${est.estimationNumber} - ${est.projectName}`,
      reference: est.invoiceNumber,
      projectId: est.projectId,
      status: 'conciliado',
    };
    setBankMovements((prev) => [mov, ...prev]);
  };

  const transferBetweenAccounts = (
    sourceAccId: string,
    destAccId: string,
    amount: number,
    concept: string
  ) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === sourceAccId) return { ...a, currentBalance: a.currentBalance - amount };
        if (a.id === destAccId) return { ...a, currentBalance: a.currentBalance + amount };
        return a;
      })
    );

    const movOut: BankMovement = {
      id: `mov-${Date.now()}-1`,
      accountId: sourceAccId,
      date: new Date().toISOString().split('T')[0],
      type: 'transferencia',
      amount,
      concept: `Traspaso a otra cuenta: ${concept}`,
      reference: `TRF-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: 'conciliado',
    };
    setBankMovements((prev) => [movOut, ...prev]);
  };

  const resetAllData = () => {
    localStorage.removeItem('pc_erp_projects');
    localStorage.removeItem('pc_erp_accounts');
    localStorage.removeItem('pc_erp_expenses');
    localStorage.removeItem('pc_erp_payables');
    localStorage.removeItem('pc_erp_receivables');
    localStorage.removeItem('pc_erp_estimations');
    localStorage.removeItem('pc_erp_seats');
    setProjects(INITIAL_PROJECTS);
    setAccounts(INITIAL_ACCOUNTS);
    setExpenses(INITIAL_EXPENSES);
    setPayables(INITIAL_PAYABLES);
    setReceivables(INITIAL_RECEIVABLES);
    setEstimations(INITIAL_ESTIMATIONS);
    setAccountingSeats(INITIAL_SEATS);
    setBankMovements([]);
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
        expenses,
        payables,
        receivables,
        estimations,
        accountingSeats,
        bankMovements,
        registerSingleEntryExpense,
        createProject,
        updatePhysicalProgress,
        createEstimation,
        collectEstimationPayment,
        transferBetweenAccounts,
        resetAllData,
        lastSingleEntryImpact,
        clearLastImpact,
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
