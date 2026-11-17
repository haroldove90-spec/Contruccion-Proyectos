import { supabase } from './supabase';
import type {
  CODCompany,
  CODClient,
  CODCostCenter,
  CODAccount,
  CODConceptItem,
  CODIncome,
  CODExpense,
} from '../context/CODContext';

export interface CDOHydratedData {
  companies: CODCompany[];
  clients: CODClient[];
  costCenters: CODCostCenter[];
  accounts: CODAccount[];
  concepts: CODConceptItem[];
  incomes: CODIncome[];
  expenses: CODExpense[];
}

export async function fetchAllCDOFromSupabase(): Promise<CDOHydratedData | null> {
  try {
    const [coRes, cliRes, projRes, accRes, conRes, incRes, expRes] = await Promise.all([
      supabase.from('cdo_companies').select('*').order('created_at', { ascending: true }),
      supabase.from('cdo_clients').select('*').order('created_at', { ascending: true }),
      supabase.from('cdo_projects').select('*').order('created_at', { ascending: true }),
      supabase.from('cdo_accounts').select('*').order('created_at', { ascending: true }),
      supabase.from('cdo_concepts').select('*').order('created_at', { ascending: true }),
      supabase.from('cdo_incomes').select('*').order('mov_number', { ascending: true }),
      supabase.from('cdo_expenses').select('*').order('mov_number', { ascending: true }),
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

    // If database has not been seeded/populated yet, keep local initial state
    const hasCoreRows =
      (coRes.data?.length || 0) > 0 || (accRes.data?.length || 0) > 0;
    if (!hasCoreRows) {
      return null;
    }

    return {
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
        companyId: r.company_id || '',
        companyName: r.company_name,
        subtotal: Number(r.subtotal) || 0,
        iva: Number(r.iva) || 0,
        total: Number(r.total) || 0,
        accountId: r.account_id || '',
        accountName: r.account_name,
        capturedVia: r.captured_via as 'Manual' | 'WhatsApp OCR',
        timestamp: Number(r.timestamp_ms) || Date.now(),
      })),
    };
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

export async function dbUpsertCompany(c: CODCompany) {
  await supabase.from('cdo_companies').upsert({
    id: c.id,
    name: c.name,
    short_name: c.shortName,
    rfc: c.rfc || null,
  });
}

export async function dbDeleteCompany(id: string) {
  await supabase.from('cdo_companies').delete().eq('id', id);
}

export async function dbUpsertClient(c: CODClient) {
  await supabase.from('cdo_clients').upsert({
    id: c.id,
    name: c.name,
    rfc: c.rfc || null,
    contact: c.contact || null,
  });
}

export async function dbDeleteClient(id: string) {
  await supabase.from('cdo_clients').delete().eq('id', id);
}

export async function dbUpsertProject(p: CODCostCenter) {
  await supabase.from('cdo_projects').upsert({
    id: p.id,
    name: p.name,
    client_id: p.clientId || null,
    client_name: p.clientName || null,
    company_id: p.companyId || null,
  });
}

export async function dbDeleteProject(id: string) {
  await supabase.from('cdo_projects').delete().eq('id', id);
}

export async function dbUpsertAccount(a: CODAccount) {
  await supabase.from('cdo_accounts').upsert({
    id: a.id,
    name: a.name,
    account_number: a.accountNumber || null,
    type: a.type,
    company_id: a.companyId || null,
    initial_balance: a.initialBalance,
  });
}

export async function dbDeleteAccount(id: string) {
  await supabase.from('cdo_accounts').delete().eq('id', id);
}

export async function dbUpsertConcept(c: CODConceptItem) {
  await supabase.from('cdo_concepts').upsert({
    id: c.id,
    name: c.name,
    kind: c.kind,
  });
}

export async function dbDeleteConcept(id: string) {
  await supabase.from('cdo_concepts').delete().eq('id', id);
}

export async function dbUpsertIncome(i: CODIncome) {
  await supabase.from('cdo_incomes').upsert({
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
  });
}

export async function dbDeleteIncome(id: string) {
  await supabase.from('cdo_incomes').delete().eq('id', id);
}

export async function dbUpsertExpense(e: CODExpense) {
  await supabase.from('cdo_expenses').upsert({
    id: e.id,
    mov_number: e.movNumber,
    concept: e.concept,
    date: e.date,
    project_id: e.projectId || null,
    project_name: e.projectName,
    company_id: e.companyId || null,
    company_name: e.companyName,
    subtotal: e.subtotal,
    iva: e.iva,
    total: e.total,
    account_id: e.accountId || null,
    account_name: e.accountName,
    captured_via: e.capturedVia,
    timestamp_ms: e.timestamp,
  });
}

export async function dbDeleteExpense(id: string) {
  await supabase.from('cdo_expenses').delete().eq('id', id);
}

export async function dbClearMovementsToZero() {
  await Promise.all([
    supabase.from('cdo_incomes').delete().neq('id', ''),
    supabase.from('cdo_expenses').delete().neq('id', ''),
    supabase.from('cdo_accounts').update({ initial_balance: 0 }).neq('id', ''),
  ]);
}

export async function dbSyncFullSnapshot(data: CDOHydratedData) {
  await Promise.all([
    supabase.from('cdo_incomes').delete().neq('id', ''),
    supabase.from('cdo_expenses').delete().neq('id', ''),
  ]);
  await Promise.all([
    supabase.from('cdo_projects').delete().neq('id', ''),
    supabase.from('cdo_accounts').delete().neq('id', ''),
  ]);
  await Promise.all([
    supabase.from('cdo_clients').delete().neq('id', ''),
    supabase.from('cdo_concepts').delete().neq('id', ''),
  ]);
  await supabase.from('cdo_companies').delete().neq('id', '');

  if (data.companies.length) {
    await supabase.from('cdo_companies').upsert(
      data.companies.map((c) => ({
        id: c.id,
        name: c.name,
        short_name: c.shortName,
        rfc: c.rfc || null,
      }))
    );
  }
  if (data.clients.length) {
    await supabase.from('cdo_clients').upsert(
      data.clients.map((c) => ({
        id: c.id,
        name: c.name,
        rfc: c.rfc || null,
        contact: c.contact || null,
      }))
    );
  }
  if (data.costCenters.length) {
    await supabase.from('cdo_projects').upsert(
      data.costCenters.map((p) => ({
        id: p.id,
        name: p.name,
        client_id: p.clientId || null,
        client_name: p.clientName || null,
        company_id: p.companyId || null,
      }))
    );
  }
  if (data.accounts.length) {
    await supabase.from('cdo_accounts').upsert(
      data.accounts.map((a) => ({
        id: a.id,
        name: a.name,
        account_number: a.accountNumber || null,
        type: a.type,
        company_id: a.companyId || null,
        initial_balance: a.initialBalance,
      }))
    );
  }
  if (data.concepts.length) {
    await supabase.from('cdo_concepts').upsert(
      data.concepts.map((c) => ({
        id: c.id,
        name: c.name,
        kind: c.kind,
      }))
    );
  }
  if (data.incomes.length) {
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
      }))
    );
  }
  if (data.expenses.length) {
    await supabase.from('cdo_expenses').upsert(
      data.expenses.map((e) => ({
        id: e.id,
        mov_number: e.movNumber,
        concept: e.concept,
        date: e.date,
        project_id: e.projectId || null,
        project_name: e.projectName,
        company_id: e.companyId || null,
        company_name: e.companyName,
        subtotal: e.subtotal,
        iva: e.iva,
        total: e.total,
        account_id: e.accountId || null,
        account_name: e.accountName,
        captured_via: e.capturedVia,
        timestamp_ms: e.timestamp,
      }))
    );
  }
}
