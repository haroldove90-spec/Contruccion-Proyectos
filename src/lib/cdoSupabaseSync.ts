import { supabase } from './supabase';
import type {
  CODCompany,
  CODClient,
  CODCostCenter,
  CODAccount,
  CODConceptItem,
  CODIncome,
  CODExpense,
  CDOLoanCredit,
  CDONotification,
  CDOUser,
  ExpenseKind,
  ExpenseApprovalStatus,
} from '../context/CODContext';

export interface CDOHydratedData {
  users: CDOUser[];
  hasCoreRows: boolean;
  loansLoaded: boolean;
  notificationsLoaded: boolean;
  companies: CODCompany[];
  clients: CODClient[];
  costCenters: CODCostCenter[];
  accounts: CODAccount[];
  concepts: CODConceptItem[];
  incomes: CODIncome[];
  expenses: CODExpense[];
  loansCredits: CDOLoanCredit[];
  notifications: CDONotification[];
}

function assertOk(
  res: { error: { message: string; details?: string; hint?: string } | null },
  operation: string
) {
  if (res.error) {
    throw new Error(`${operation}: ${res.error.message}`);
  }
}

export async function fetchAllCDOFromSupabase(): Promise<CDOHydratedData | null> {
  try {
    const [usrRes, coRes, cliRes, projRes, accRes, conRes, incRes, expRes, loanRes, notifRes] =
      await Promise.all([
        supabase.from('cdo_users').select('*').order('created_at', { ascending: true }),
        supabase.from('cdo_companies').select('*').order('created_at', { ascending: true }),
        supabase.from('cdo_clients').select('*').order('created_at', { ascending: true }),
        supabase.from('cdo_projects').select('*').order('created_at', { ascending: true }),
        supabase.from('cdo_accounts').select('*').order('created_at', { ascending: true }),
        supabase.from('cdo_concepts').select('*').order('created_at', { ascending: true }),
        supabase.from('cdo_incomes').select('*').order('mov_number', { ascending: true }),
        supabase.from('cdo_expenses').select('*').order('mov_number', { ascending: true }),
        supabase.from('cdo_loans_credits').select('*').order('timestamp_ms', { ascending: false }),
        supabase.from('cdo_notifications').select('*').order('timestamp_ms', { ascending: false }),
      ]);

    if (
      coRes.error ||
      cliRes.error ||
      projRes.error ||
      accRes.error ||
      conRes.error ||
      incRes.error ||
      expRes.error
    ) {
      return null;
    }

    const hasCoreRows =
      (coRes.data?.length || 0) > 0 || (accRes.data?.length || 0) > 0;

    return {
      users:
        usrRes.error || !usrRes.data
          ? []
          : usrRes.data.map((r) => ({
              id: r.id,
              fullName: r.full_name,
              username: r.username,
              passwordHash: r.password_hash,
              role: r.role as 'admin' | 'administracion',
              email: r.email || '',
              phone: r.phone || '',
              position: r.position || '',
            })),
      hasCoreRows,
      loansLoaded: !loanRes.error,
      notificationsLoaded: !notifRes.error,
      companies: (coRes.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        shortName: r.short_name,
        rfc: r.rfc || undefined,
      })),
      clients: (cliRes.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        rfc: r.rfc || undefined,
        contact: r.contact || undefined,
      })),
      costCenters: (projRes.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        clientId: r.client_id || undefined,
        clientName: r.client_name || undefined,
        companyId: r.company_id || '',
      })),
      accounts: (accRes.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        accountNumber: r.account_number || undefined,
        type: r.type as 'banco' | 'efectivo',
        companyId: r.company_id || '',
        initialBalance: Number(r.initial_balance) || 0,
      })),
      concepts: (conRes.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        kind: r.kind as 'ingreso' | 'egreso',
      })),
      incomes: (incRes.data || []).map((r) => ({
        id: r.id,
        movNumber: Number(r.mov_number) || 1,
        concept: r.concept,
        date: r.date,
        companyId: r.company_id || '',
        companyName: r.company_name,
        clientId: r.client_id || undefined,
        clientName: r.client_name || undefined,
        projectId: r.project_id || undefined,
        projectName: r.project_name || undefined,
        subtotal: Number(r.subtotal) || 0,
        iva: Number(r.iva) || 0,
        total: Number(r.total) || 0,
        accountId: r.account_id || '',
        accountName: r.account_name,
        timestamp: Number(r.timestamp_ms) || Date.now(),
      })),
      expenses: (expRes.data || []).map((r) => ({
        id: r.id,
        movNumber: Number(r.mov_number) || 1,
        concept: r.concept,
        date: r.date,
        projectId: r.project_id || '',
        projectName: r.project_name,
        clientId: r.client_id || undefined,
        clientName: r.client_name || undefined,
        companyId: r.company_id || '',
        companyName: r.company_name,
        subtotal: Number(r.subtotal) || 0,
        iva: Number(r.iva) || 0,
        total: Number(r.total) || 0,
        accountId: r.account_id || '',
        accountName: r.account_name,
        capturedVia: r.captured_via as 'Manual' | 'WhatsApp OCR',
        expenseKind: (r.expense_kind || 'gasto') as ExpenseKind,
        linkedLoanId: r.linked_loan_id || undefined,
        approvalStatus: (r.approval_status || 'autorizado') as ExpenseApprovalStatus,
        requestedByUserId: r.requested_by_user_id || undefined,
        requestedByName: r.requested_by_name || undefined,
        reviewedByUserId: r.reviewed_by_user_id || undefined,
        reviewedByName: r.reviewed_by_name || undefined,
        reviewedAt: r.reviewed_at_ms ? Number(r.reviewed_at_ms) : undefined,
        rejectionReason: r.rejection_reason || undefined,
        timestamp: Number(r.timestamp_ms) || Date.now(),
      })),
      loansCredits:
        loanRes.error || !loanRes.data
          ? []
          : loanRes.data.map((r) => ({
              id: r.id,
              kind: r.kind as 'prestamo' | 'credito_bancario',
              title: r.title,
              institution: r.institution,
              cardLast4: r.card_last4 || undefined,
              date: r.date,
              dueDate: r.due_date || undefined,
              companyId: r.company_id || '',
              companyName: r.company_name,
              clientId: r.client_id || undefined,
              clientName: r.client_name || undefined,
              projectId: r.project_id || undefined,
              projectName: r.project_name || undefined,
              accountId: r.account_id || undefined,
              accountName: r.account_name || undefined,
              originalAmount: Number(r.original_amount) || 0,
              paidAmount: Number(r.paid_amount) || 0,
              remainingAmount: Number(r.remaining_amount) || 0,
              sourceExpenseId: r.source_expense_id || undefined,
              status: r.status as CDOLoanCredit['status'],
              notes: r.notes || undefined,
              requestedByUserId: r.requested_by_user_id || undefined,
              requestedByName: r.requested_by_name || undefined,
              timestamp: Number(r.timestamp_ms) || Date.now(),
            })),
      notifications:
        notifRes.error || !notifRes.data
          ? []
          : notifRes.data.map((r) => ({
              id: r.id,
              type: r.type as CDONotification['type'],
              targetRole: r.target_role as 'admin' | 'administracion',
              title: r.title,
              message: r.message,
              expenseId: r.expense_id || undefined,
              loanId: r.loan_id || undefined,
              amount: r.amount !== null && r.amount !== undefined ? Number(r.amount) : undefined,
              accountName: r.account_name || undefined,
              companyName: r.company_name || undefined,
              projectName: r.project_name || undefined,
              clientName: r.client_name || undefined,
              expenseKind: (r.expense_kind || undefined) as ExpenseKind | undefined,
              createdByUserId: r.created_by_user_id,
              createdByName: r.created_by_name,
              readByUserIds: Array.isArray(r.read_by_user_ids) ? r.read_by_user_ids : [],
              actionStatus: (r.action_status || undefined) as CDONotification['actionStatus'],
              rejectionReason: r.rejection_reason || undefined,
              timestamp: Number(r.timestamp_ms) || Date.now(),
            })),
    };
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

export async function dbUpsertCompany(c: CODCompany) {
  const res = await supabase
    .from('cdo_companies')
    .upsert(
      {
        id: c.id,
        name: c.name,
        short_name: c.shortName,
        rfc: c.rfc || null,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar S.A.');
}

export async function dbDeleteCompany(id: string) {
  const res = await supabase.from('cdo_companies').delete().eq('id', id);
  assertOk(res, 'Eliminar S.A.');
}

export async function dbUpsertClient(c: CODClient) {
  const res = await supabase
    .from('cdo_clients')
    .upsert(
      {
        id: c.id,
        name: c.name,
        rfc: c.rfc || null,
        contact: c.contact || null,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar Cliente');
}

export async function dbDeleteClient(id: string) {
  const res = await supabase.from('cdo_clients').delete().eq('id', id);
  assertOk(res, 'Eliminar Cliente');
}

export async function dbUpsertProject(p: CODCostCenter) {
  const res = await supabase
    .from('cdo_projects')
    .upsert(
      {
        id: p.id,
        name: p.name,
        client_id: p.clientId || null,
        client_name: p.clientName || null,
        company_id: p.companyId || null,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar Proyecto');
}

export async function dbDeleteProject(id: string) {
  const res = await supabase.from('cdo_projects').delete().eq('id', id);
  assertOk(res, 'Eliminar Proyecto');
}

export async function dbUpsertAccount(a: CODAccount) {
  const res = await supabase
    .from('cdo_accounts')
    .upsert(
      {
        id: a.id,
        name: a.name,
        account_number: a.accountNumber || null,
        type: a.type,
        company_id: a.companyId || null,
        initial_balance: a.initialBalance,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar Cuenta Bancaria');
}

export async function dbDeleteAccount(id: string) {
  const res = await supabase.from('cdo_accounts').delete().eq('id', id);
  assertOk(res, 'Eliminar Cuenta Bancaria');
}

export async function dbUpsertConcept(c: CODConceptItem) {
  const res = await supabase
    .from('cdo_concepts')
    .upsert(
      {
        id: c.id,
        name: c.name,
        kind: c.kind,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar Concepto');
}

export async function dbDeleteConcept(id: string) {
  const res = await supabase.from('cdo_concepts').delete().eq('id', id);
  assertOk(res, 'Eliminar Concepto');
}

export async function dbUpsertIncome(i: CODIncome) {
  const res = await supabase
    .from('cdo_incomes')
    .upsert(
      {
        id: i.id,
        mov_number: i.movNumber,
        concept: i.concept,
        date: i.date,
        company_id: i.companyId || null,
        company_name: i.companyName,
        client_id: i.clientId || null,
        client_name: i.clientName || null,
        project_id: i.projectId || null,
        project_name: i.projectName || null,
        subtotal: i.subtotal,
        iva: i.iva,
        total: i.total,
        account_id: i.accountId || null,
        account_name: i.accountName,
        timestamp_ms: i.timestamp,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar Ingreso');
}

export async function dbDeleteIncome(id: string) {
  const res = await supabase.from('cdo_incomes').delete().eq('id', id);
  assertOk(res, 'Eliminar Ingreso');
}

export async function dbUpsertExpense(e: CODExpense) {
  const res = await supabase
    .from('cdo_expenses')
    .upsert(
      {
        id: e.id,
        mov_number: e.movNumber,
        concept: e.concept,
        date: e.date,
        project_id: e.projectId || null,
        project_name: e.projectName,
        client_id: e.clientId || null,
        client_name: e.clientName || null,
        company_id: e.companyId || null,
        company_name: e.companyName,
        subtotal: e.subtotal,
        iva: e.iva,
        total: e.total,
        account_id: e.accountId || null,
        account_name: e.accountName,
        captured_via: e.capturedVia,
        expense_kind: e.expenseKind || 'gasto',
        linked_loan_id: e.linkedLoanId || null,
        approval_status: e.approvalStatus || 'autorizado',
        requested_by_user_id: e.requestedByUserId || null,
        requested_by_name: e.requestedByName || null,
        reviewed_by_user_id: e.reviewedByUserId || null,
        reviewed_by_name: e.reviewedByName || null,
        reviewed_at_ms: e.reviewedAt || null,
        rejection_reason: e.rejectionReason || null,
        timestamp_ms: e.timestamp,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar Egreso');
}

export async function dbDeleteExpense(id: string) {
  const res = await supabase.from('cdo_expenses').delete().eq('id', id);
  assertOk(res, 'Eliminar Egreso');
}

export async function dbUpsertLoanCredit(l: CDOLoanCredit) {
  const res = await supabase
    .from('cdo_loans_credits')
    .upsert(
      {
        id: l.id,
        kind: l.kind,
        title: l.title,
        institution: l.institution,
        card_last4: l.cardLast4 || null,
        date: l.date,
        due_date: l.dueDate || null,
        company_id: l.companyId || null,
        company_name: l.companyName,
        client_id: l.clientId || null,
        client_name: l.clientName || null,
        project_id: l.projectId || null,
        project_name: l.projectName || null,
        account_id: l.accountId || null,
        account_name: l.accountName || null,
        original_amount: l.originalAmount,
        paid_amount: l.paidAmount,
        remaining_amount: l.remainingAmount,
        source_expense_id: l.sourceExpenseId || null,
        status: l.status,
        notes: l.notes || null,
        requested_by_user_id: l.requestedByUserId || null,
        requested_by_name: l.requestedByName || null,
        timestamp_ms: l.timestamp,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar Préstamo / Crédito');
}

export async function dbDeleteLoanCredit(id: string) {
  const res = await supabase.from('cdo_loans_credits').delete().eq('id', id);
  assertOk(res, 'Eliminar Préstamo / Crédito');
}

export async function dbUpsertNotification(n: CDONotification) {
  const res = await supabase
    .from('cdo_notifications')
    .upsert(
      {
        id: n.id,
        type: n.type,
        target_role: n.targetRole,
        title: n.title,
        message: n.message,
        expense_id: n.expenseId || null,
        loan_id: n.loanId || null,
        amount: n.amount ?? null,
        account_name: n.accountName || null,
        company_name: n.companyName || null,
        project_name: n.projectName || null,
        client_name: n.clientName || null,
        expense_kind: n.expenseKind || null,
        created_by_user_id: n.createdByUserId,
        created_by_name: n.createdByName,
        read_by_user_ids: n.readByUserIds,
        action_status: n.actionStatus || null,
        rejection_reason: n.rejectionReason || null,
        timestamp_ms: n.timestamp,
      },
      { onConflict: 'id' }
    );
  assertOk(res, 'Guardar Notificación');
}

export async function dbUpsertUser(u: CDOUser): Promise<CDOUser> {
  const res = await supabase
    .from('cdo_users')
    .upsert(
      {
        id: u.id,
        full_name: u.fullName,
        username: u.username,
        password_hash: u.passwordHash,
        role: u.role,
        email: u.email || null,
        phone: u.phone || null,
        position: u.position || null,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();
  assertOk(res, 'Guardar Usuario');
  const row = res.data;
  return {
    id: row.id,
    fullName: row.full_name,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role as 'admin' | 'administracion',
    email: row.email || '',
    phone: row.phone || '',
    position: row.position || '',
  };
}

export async function dbDeleteUser(id: string) {
  const res = await supabase.from('cdo_users').delete().eq('id', id);
  assertOk(res, 'Eliminar Usuario');
}

export async function dbClearMovementsToZero() {
  const results = await Promise.all([
    supabase.from('cdo_notifications').delete().neq('id', ''),
    supabase.from('cdo_loans_credits').delete().neq('id', ''),
    supabase.from('cdo_incomes').delete().neq('id', ''),
    supabase.from('cdo_expenses').delete().neq('id', ''),
    supabase.from('cdo_accounts').update({ initial_balance: 0 }).neq('id', ''),
  ]);
  results.forEach((r, idx) => assertOk(r, `Limpiar movimientos (${idx})`));
}

export async function dbSyncFullSnapshot(
  data: Omit<CDOHydratedData, 'users' | 'hasCoreRows' | 'loansLoaded' | 'notificationsLoaded'>
) {
  const delMovs = await Promise.all([
    supabase.from('cdo_notifications').delete().neq('id', ''),
    supabase.from('cdo_loans_credits').delete().neq('id', ''),
    supabase.from('cdo_incomes').delete().neq('id', ''),
    supabase.from('cdo_expenses').delete().neq('id', ''),
  ]);
  delMovs.forEach((r, idx) => assertOk(r, `Reiniciar movimientos (${idx})`));

  const delRefs = await Promise.all([
    supabase.from('cdo_projects').delete().neq('id', ''),
    supabase.from('cdo_accounts').delete().neq('id', ''),
  ]);
  delRefs.forEach((r, idx) => assertOk(r, `Reiniciar referencias (${idx})`));

  const delCats = await Promise.all([
    supabase.from('cdo_clients').delete().neq('id', ''),
    supabase.from('cdo_concepts').delete().neq('id', ''),
  ]);
  delCats.forEach((r, idx) => assertOk(r, `Reiniciar catálogos (${idx})`));

  const delCo = await supabase.from('cdo_companies').delete().neq('id', '');
  assertOk(delCo, 'Reiniciar empresas');

  if (data.companies.length) {
    assertOk(
      await supabase.from('cdo_companies').upsert(
        data.companies.map((c) => ({
          id: c.id,
          name: c.name,
          short_name: c.shortName,
          rfc: c.rfc || null,
        })),
        { onConflict: 'id' }
      ),
      'Insertar empresas'
    );
  }
  if (data.clients.length) {
    assertOk(
      await supabase.from('cdo_clients').upsert(
        data.clients.map((c) => ({
          id: c.id,
          name: c.name,
          rfc: c.rfc || null,
          contact: c.contact || null,
        })),
        { onConflict: 'id' }
      ),
      'Insertar clientes'
    );
  }
  if (data.costCenters.length) {
    assertOk(
      await supabase.from('cdo_projects').upsert(
        data.costCenters.map((p) => ({
          id: p.id,
          name: p.name,
          client_id: p.clientId || null,
          client_name: p.clientName || null,
          company_id: p.companyId || null,
        })),
        { onConflict: 'id' }
      ),
      'Insertar proyectos'
    );
  }
  if (data.accounts.length) {
    assertOk(
      await supabase.from('cdo_accounts').upsert(
        data.accounts.map((a) => ({
          id: a.id,
          name: a.name,
          account_number: a.accountNumber || null,
          type: a.type,
          company_id: a.companyId || null,
          initial_balance: a.initialBalance,
        })),
        { onConflict: 'id' }
      ),
      'Insertar cuentas'
    );
  }
  if (data.concepts.length) {
    assertOk(
      await supabase.from('cdo_concepts').upsert(
        data.concepts.map((c) => ({
          id: c.id,
          name: c.name,
          kind: c.kind,
        })),
        { onConflict: 'id' }
      ),
      'Insertar conceptos'
    );
  }
  if (data.incomes.length) {
    assertOk(
      await supabase.from('cdo_incomes').upsert(
        data.incomes.map((i) => ({
          id: i.id,
          mov_number: i.movNumber,
          concept: i.concept,
          date: i.date,
          company_id: i.companyId || null,
          company_name: i.companyName,
          client_id: i.clientId || null,
          client_name: i.clientName || null,
          project_id: i.projectId || null,
          project_name: i.projectName || null,
          subtotal: i.subtotal,
          iva: i.iva,
          total: i.total,
          account_id: i.accountId || null,
          account_name: i.accountName,
          timestamp_ms: i.timestamp,
        })),
        { onConflict: 'id' }
      ),
      'Insertar ingresos'
    );
  }
  if (data.expenses.length) {
    assertOk(
      await supabase.from('cdo_expenses').upsert(
        data.expenses.map((e) => ({
          id: e.id,
          mov_number: e.movNumber,
          concept: e.concept,
          date: e.date,
          project_id: e.projectId || null,
          project_name: e.projectName,
          client_id: e.clientId || null,
          client_name: e.clientName || null,
          company_id: e.companyId || null,
          company_name: e.companyName,
          subtotal: e.subtotal,
          iva: e.iva,
          total: e.total,
          account_id: e.accountId || null,
          account_name: e.accountName,
          captured_via: e.capturedVia,
          expense_kind: e.expenseKind || 'gasto',
          linked_loan_id: e.linkedLoanId || null,
          approval_status: e.approvalStatus || 'autorizado',
          requested_by_user_id: e.requestedByUserId || null,
          requested_by_name: e.requestedByName || null,
          reviewed_by_user_id: e.reviewedByUserId || null,
          reviewed_by_name: e.reviewedByName || null,
          reviewed_at_ms: e.reviewedAt || null,
          rejection_reason: e.rejectionReason || null,
          timestamp_ms: e.timestamp,
        })),
        { onConflict: 'id' }
      ),
      'Insertar egresos'
    );
  }
  if (data.loansCredits.length) {
    assertOk(
      await supabase.from('cdo_loans_credits').upsert(
        data.loansCredits.map((l) => ({
          id: l.id,
          kind: l.kind,
          title: l.title,
          institution: l.institution,
          card_last4: l.cardLast4 || null,
          date: l.date,
          due_date: l.dueDate || null,
          company_id: l.companyId || null,
          company_name: l.companyName,
          client_id: l.clientId || null,
          client_name: l.clientName || null,
          project_id: l.projectId || null,
          project_name: l.projectName || null,
          account_id: l.accountId || null,
          account_name: l.accountName || null,
          original_amount: l.originalAmount,
          paid_amount: l.paidAmount,
          remaining_amount: l.remainingAmount,
          source_expense_id: l.sourceExpenseId || null,
          status: l.status,
          notes: l.notes || null,
          requested_by_user_id: l.requestedByUserId || null,
          requested_by_name: l.requestedByName || null,
          timestamp_ms: l.timestamp,
        })),
        { onConflict: 'id' }
      ),
      'Insertar préstamos'
    );
  }
}
