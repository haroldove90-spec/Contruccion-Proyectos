export type UserRole = 'socio' | 'admin' | 'residente' | 'compras';

export interface RoleInfo {
  id: UserRole;
  name: string;
  shortTitle: string;
  description: string;
  allowedModules: string[];
}

export interface Company {
  id: string;
  name: string;
  shortName: string;
  rfc: string;
  specialty: string;
}

export type ProjectStatus = 'ejecucion' | 'por_iniciar' | 'cierre' | 'finalizada';

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  companyId: string;
  initialBudget: number;
  spent: number;
  billed: number;
  collected: number;
  physicalProgress: number; // 0 to 100
  financialProgress: number; // 0 to 100 (spent / initialBudget)
  location: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  residente: string;
}

export type PaymentMethod = 'transferencia' | 'efectivo' | 'tarjeta';

export interface Expense {
  id: string;
  folio: string;
  projectId: string;
  projectName: string;
  provider: string;
  category: string;
  amount: number;
  subtotal: number;
  iva: number;
  date: string;
  accountId: string;
  accountName: string;
  paymentMethod: PaymentMethod;
  invoiceFolio: string;
  capturedVia: 'whatsapp' | 'manual';
  notes?: string;
  accountingSeatId?: string;
  timestamp: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'banco' | 'efectivo' | 'tarjeta';
  companyId: string;
  currency: string;
  currentBalance: number;
}

export interface BankMovement {
  id: string;
  accountId: string;
  date: string;
  type: 'ingreso' | 'egreso' | 'transferencia';
  amount: number;
  concept: string;
  reference: string;
  projectId?: string;
  status: 'conciliado' | 'pendiente';
}

export interface AccountPayable {
  id: string;
  provider: string;
  invoiceNumber: string;
  amount: number;
  balance: number;
  dueDate: string;
  companyId: string;
  projectId: string;
  status: 'pendiente' | 'pagada' | 'vencida';
}

export interface AccountReceivable {
  id: string;
  client: string;
  estimationNumber: string;
  projectId: string;
  companyId: string;
  amount: number;
  balance: number;
  issueDate: string;
  dueDate: string;
  status: 'cobrado' | 'pendiente' | 'vencido';
}

export interface Estimation {
  id: string;
  estimationNumber: string;
  projectId: string;
  projectName: string;
  companyId: string;
  period: string;
  physicalAdvancePercent: number;
  cumulativeAdvancePercent: number;
  grossAmount: number;
  retentionGuarantee: number;
  netAmount: number;
  invoiceNumber: string;
  status: 'en_revision' | 'facturada' | 'cobrada';
  date: string;
}

export interface AccountingSeatLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface AccountingSeat {
  id: string;
  seatNumber: string;
  date: string;
  concept: string;
  reference: string;
  projectId?: string;
  lines: AccountingSeatLine[];
}

export interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  image?: string;
  receiptData?: {
    provider: string;
    amount: number;
    subtotal: number;
    iva: number;
    date: string;
    category: string;
    projectName: string;
    accountName: string;
    impacts: {
      costCenter: string;
      treasury: string;
      payables: string;
      accounting: string;
    };
  };
}
