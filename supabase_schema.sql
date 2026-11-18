-- ============================================================================
-- SUPABASE SQL SCHEMA — PROYECTO: projectos_inmobiliarios (qflgjlwfzfqspxvwoegs)
-- Módulos CDO: Resumen, Ingresos, Egresos (con Autorización), Control Bancario,
--              Préstamos y Tarjetas Bancarias, Notificaciones, Catálogos y Perfil
-- Ejecutar completo en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Es idempotente: puedes ejecutarlo aunque ya hayas corrido la versión anterior.
-- ============================================================================

-- 0. USUARIOS Y ROLES (Admin y Administración)
CREATE TABLE IF NOT EXISTS public.cdo_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'administracion')),
  email TEXT,
  phone TEXT,
  position TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. SOCIEDADES ANÓNIMAS (S.A.)
CREATE TABLE IF NOT EXISTS public.cdo_companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  rfc TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CLIENTES
CREATE TABLE IF NOT EXISTS public.cdo_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rfc TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PROYECTOS / OBRAS (CENTROS DE COSTOS)
CREATE TABLE IF NOT EXISTS public.cdo_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_id TEXT REFERENCES public.cdo_clients(id) ON DELETE SET NULL,
  client_name TEXT,
  company_id TEXT REFERENCES public.cdo_companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CUENTAS BANCARIAS Y EFECTIVO (Soporte ilimitado: 8+ cuentas y cajas)
CREATE TABLE IF NOT EXISTS public.cdo_accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  account_number TEXT,
  type TEXT NOT NULL CHECK (type IN ('banco', 'efectivo')),
  company_id TEXT REFERENCES public.cdo_companies(id) ON DELETE SET NULL,
  initial_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CATÁLOGO DE CONCEPTOS (INGRESOS Y EGRESOS)
CREATE TABLE IF NOT EXISTS public.cdo_concepts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('ingreso', 'egreso')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. REGISTRO CENTRALIZADO DE INGRESOS
CREATE TABLE IF NOT EXISTS public.cdo_incomes (
  id TEXT PRIMARY KEY,
  mov_number INTEGER NOT NULL,
  concept TEXT NOT NULL,
  date TEXT NOT NULL,
  company_id TEXT REFERENCES public.cdo_companies(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  client_id TEXT REFERENCES public.cdo_clients(id) ON DELETE SET NULL,
  client_name TEXT,
  project_id TEXT REFERENCES public.cdo_projects(id) ON DELETE SET NULL,
  project_name TEXT,
  subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
  iva NUMERIC(14, 2) NOT NULL CHECK (iva >= 0),
  total NUMERIC(14, 2) NOT NULL CHECK (total >= 0),
  account_id TEXT REFERENCES public.cdo_accounts(id) ON DELETE SET NULL,
  account_name TEXT NOT NULL,
  timestamp_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. REGISTRO CENTRALIZADO DE EGRESOS (CON AUTORIZACIÓN Y SINCRONIZACIÓN A PRÉSTAMOS)
CREATE TABLE IF NOT EXISTS public.cdo_expenses (
  id TEXT PRIMARY KEY,
  mov_number INTEGER NOT NULL,
  concept TEXT NOT NULL,
  date TEXT NOT NULL,
  project_id TEXT REFERENCES public.cdo_projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  client_id TEXT REFERENCES public.cdo_clients(id) ON DELETE SET NULL,
  client_name TEXT,
  company_id TEXT REFERENCES public.cdo_companies(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
  iva NUMERIC(14, 2) NOT NULL CHECK (iva >= 0),
  total NUMERIC(14, 2) NOT NULL CHECK (total >= 0),
  account_id TEXT REFERENCES public.cdo_accounts(id) ON DELETE SET NULL,
  account_name TEXT NOT NULL,
  captured_via TEXT NOT NULL CHECK (captured_via IN ('Manual', 'WhatsApp OCR')),
  expense_kind TEXT NOT NULL DEFAULT 'gasto' CHECK (expense_kind IN ('gasto', 'prestamo', 'credito_bancario', 'abono_prestamo')),
  linked_loan_id TEXT,
  approval_status TEXT NOT NULL DEFAULT 'autorizado' CHECK (approval_status IN ('pendiente', 'autorizado', 'rechazado')),
  requested_by_user_id TEXT,
  requested_by_name TEXT,
  reviewed_by_user_id TEXT,
  reviewed_by_name TEXT,
  reviewed_at_ms BIGINT,
  rejection_reason TEXT,
  timestamp_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migración idempotente por si la tabla cdo_expenses ya existía de la versión anterior
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS client_id TEXT REFERENCES public.cdo_clients(id) ON DELETE SET NULL;
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS expense_kind TEXT NOT NULL DEFAULT 'gasto';
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS linked_loan_id TEXT;
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'autorizado';
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS requested_by_user_id TEXT;
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS requested_by_name TEXT;
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS reviewed_by_user_id TEXT;
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS reviewed_by_name TEXT;
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS reviewed_at_ms BIGINT;
ALTER TABLE public.cdo_expenses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 8. PRÉSTAMOS Y TARJETAS / CRÉDITOS BANCARIOS (Ligados a Proyecto/Cliente y Egresos)
CREATE TABLE IF NOT EXISTS public.cdo_loans_credits (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('prestamo', 'credito_bancario')),
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  card_last4 TEXT,
  date TEXT NOT NULL,
  due_date TEXT,
  company_id TEXT REFERENCES public.cdo_companies(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  client_id TEXT REFERENCES public.cdo_clients(id) ON DELETE SET NULL,
  client_name TEXT,
  project_id TEXT REFERENCES public.cdo_projects(id) ON DELETE SET NULL,
  project_name TEXT,
  account_id TEXT REFERENCES public.cdo_accounts(id) ON DELETE SET NULL,
  account_name TEXT,
  original_amount NUMERIC(14, 2) NOT NULL CHECK (original_amount >= 0),
  paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  remaining_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (remaining_amount >= 0),
  source_expense_id TEXT,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'liquidado', 'pendiente_autorizacion', 'rechazado')),
  notes TEXT,
  requested_by_user_id TEXT,
  requested_by_name TEXT,
  timestamp_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTIFICACIONES Y FLUJO DE AUTORIZACIÓN ENTRE ROLES
CREATE TABLE IF NOT EXISTS public.cdo_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('solicitud_egreso', 'solicitud_prestamo', 'egreso_autorizado', 'egreso_rechazado')),
  target_role TEXT NOT NULL CHECK (target_role IN ('admin', 'administracion')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  expense_id TEXT,
  loan_id TEXT,
  amount NUMERIC(14, 2),
  account_name TEXT,
  company_name TEXT,
  project_name TEXT,
  client_name TEXT,
  expense_kind TEXT,
  created_by_user_id TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  read_by_user_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_status TEXT CHECK (action_status IN ('pendiente', 'autorizado', 'rechazado')),
  rejection_reason TEXT,
  timestamp_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA CONSULTAS Y BÚSQUEDA AVANZADA RÁPIDA
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cdo_users_username ON public.cdo_users(username);
CREATE INDEX IF NOT EXISTS idx_cdo_incomes_company ON public.cdo_incomes(company_id);
CREATE INDEX IF NOT EXISTS idx_cdo_incomes_account ON public.cdo_incomes(account_id);
CREATE INDEX IF NOT EXISTS idx_cdo_incomes_date ON public.cdo_incomes(date);
CREATE INDEX IF NOT EXISTS idx_cdo_expenses_company ON public.cdo_expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_cdo_expenses_account ON public.cdo_expenses(account_id);
CREATE INDEX IF NOT EXISTS idx_cdo_expenses_project ON public.cdo_expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_cdo_expenses_date ON public.cdo_expenses(date);
CREATE INDEX IF NOT EXISTS idx_cdo_expenses_status ON public.cdo_expenses(approval_status);
CREATE INDEX IF NOT EXISTS idx_cdo_loans_project ON public.cdo_loans_credits(project_id);
CREATE INDEX IF NOT EXISTS idx_cdo_loans_client ON public.cdo_loans_credits(client_id);
CREATE INDEX IF NOT EXISTS idx_cdo_notifications_role ON public.cdo_notifications(target_role);

-- ============================================================================
-- VISTAS EN TIEMPO REAL (SOLO EGRESOS AUTORIZADOS DESCUENTAN DE BANCOS)
-- ============================================================================
CREATE OR REPLACE VIEW public.cdo_bank_balances_view AS
SELECT
  a.id,
  a.name AS cuenta_banco,
  a.account_number,
  a.type AS tipo,
  c.name AS sa_asociada,
  a.initial_balance AS saldo_inicial,
  COALESCE(inc.total_ingresos, 0) AS total_ingresos,
  COALESCE(egr.total_egresos, 0) AS total_egresos,
  (a.initial_balance + COALESCE(inc.total_ingresos, 0) - COALESCE(egr.total_egresos, 0)) AS saldo_actual
FROM public.cdo_accounts a
LEFT JOIN public.cdo_companies c ON c.id = a.company_id
LEFT JOIN (
  SELECT account_id, SUM(total) AS total_ingresos
  FROM public.cdo_incomes
  GROUP BY account_id
) inc ON inc.account_id = a.id
LEFT JOIN (
  SELECT account_id, SUM(total) AS total_egresos
  FROM public.cdo_expenses
  WHERE approval_status = 'autorizado'
  GROUP BY account_id
) egr ON egr.account_id = a.id;

CREATE OR REPLACE VIEW public.cdo_resumen_sa_view AS
SELECT
  c.id AS company_id,
  c.name AS sociedad_anonima,
  COALESCE(inc.total_ingresos, 0) AS total_ingresos,
  COALESCE(egr.total_egresos, 0) AS total_egresos,
  (COALESCE(inc.total_ingresos, 0) - COALESCE(egr.total_egresos, 0)) AS flujo_caja_neto,
  COALESCE(b.saldo_bancos, 0) AS saldo_bancos_y_efectivo
FROM public.cdo_companies c
LEFT JOIN (
  SELECT company_id, SUM(total) AS total_ingresos
  FROM public.cdo_incomes
  GROUP BY company_id
) inc ON inc.company_id = c.id
LEFT JOIN (
  SELECT company_id, SUM(total) AS total_egresos
  FROM public.cdo_expenses
  WHERE approval_status = 'autorizado'
  GROUP BY company_id
) egr ON egr.company_id = c.id
LEFT JOIN (
  SELECT a.company_id, SUM(v.saldo_actual) AS saldo_bancos
  FROM public.cdo_accounts a
  JOIN public.cdo_bank_balances_view v ON v.id = a.id
  GROUP BY a.company_id
) b ON b.company_id = c.id;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.cdo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_loans_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cdo_users_all" ON public.cdo_users;
CREATE POLICY "cdo_users_all" ON public.cdo_users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_companies_all" ON public.cdo_companies;
CREATE POLICY "cdo_companies_all" ON public.cdo_companies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_clients_all" ON public.cdo_clients;
CREATE POLICY "cdo_clients_all" ON public.cdo_clients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_projects_all" ON public.cdo_projects;
CREATE POLICY "cdo_projects_all" ON public.cdo_projects FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_accounts_all" ON public.cdo_accounts;
CREATE POLICY "cdo_accounts_all" ON public.cdo_accounts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_concepts_all" ON public.cdo_concepts;
CREATE POLICY "cdo_concepts_all" ON public.cdo_concepts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_incomes_all" ON public.cdo_incomes;
CREATE POLICY "cdo_incomes_all" ON public.cdo_incomes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_expenses_all" ON public.cdo_expenses;
CREATE POLICY "cdo_expenses_all" ON public.cdo_expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_loans_credits_all" ON public.cdo_loans_credits;
CREATE POLICY "cdo_loans_credits_all" ON public.cdo_loans_credits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cdo_notifications_all" ON public.cdo_notifications;
CREATE POLICY "cdo_notifications_all" ON public.cdo_notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- USUARIOS Y CREDENCIALES INICIALES (SHA-256)
-- ============================================================================
INSERT INTO public.cdo_users (id, full_name, username, password_hash, role, position) VALUES
  ('usr-luis', 'Luis Treviño', 'luis_trevi', encode(sha256(convert_to('Chevropar#1970', 'UTF8')), 'hex'), 'admin', 'Director / Admin'),
  ('usr-contadora', 'Contadora General', 'contadora', encode(sha256(convert_to('Contadora_123', 'UTF8')), 'hex'), 'administracion', 'Administración y Contabilidad'),
  ('usr-harold', 'Harold Anguiano', 'haroldo90', encode(sha256(convert_to('Chevropar#1970', 'UTF8')), 'hex'), 'admin', 'Socio / Admin')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  position = EXCLUDED.position;

-- ============================================================================
-- DATOS INICIALES BASE (OPCIONAL — Puedes limpiarlos desde "Iniciar en Cero")
-- ============================================================================
INSERT INTO public.cdo_companies (id, name, short_name, rfc) VALUES
  ('sa-1', 'S.A. Constructora 1', 'Constructora 1', 'CON200115AB1'),
  ('sa-2', 'S.A. Inmobiliaria 2', 'Inmobiliaria 2', 'INM190422CD2'),
  ('sa-3', 'S.A. Fabricación 3', 'Fabricación 3', 'FAB210810EF3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cdo_clients (id, name, rfc, contact) VALUES
  ('cli-1', 'Desarrollos Juárez S.A.', 'DJU180312XX1', 'Lic. Mariana Ortiz'),
  ('cli-2', 'Grupo Corporativo Reforma', 'GCR150908YY2', 'Ing. Arturo Méndez'),
  ('cli-3', 'Comercializadora del Norte', 'CNO201105ZZ3', 'Arq. Sofía Garza')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cdo_projects (id, name, client_id, client_name, company_id) VALUES
  ('obra-juarez', 'Obra Juárez 150', 'cli-1', 'Desarrollos Juárez S.A.', 'sa-1'),
  ('obra-corp', 'Corporativo Reforma', 'cli-2', 'Grupo Corporativo Reforma', 'sa-2'),
  ('obra-mob', 'Obra Mobiliario Especial', 'cli-3', 'Comercializadora del Norte', 'sa-3'),
  ('obra-nave', 'Nave Industrial Norte', 'cli-1', 'Desarrollos Juárez S.A.', 'sa-1'),
  ('obra-plaza', 'Plaza Mirador', 'cli-2', 'Grupo Corporativo Reforma', 'sa-2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cdo_accounts (id, name, account_number, type, company_id, initial_balance) VALUES
  ('acc-banorte', 'Banorte', '0184-9921', 'banco', 'sa-1', 200000.00),
  ('acc-ixe', 'IXE', '4420-1105', 'banco', 'sa-2', 150000.00),
  ('acc-banregio', 'Banregio', '8871-3044', 'banco', 'sa-3', 80000.00),
  ('acc-efectivo', 'Caja Chica / Efectivo', 'CAJA-01', 'efectivo', 'sa-1', 0.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cdo_concepts (id, name, kind) VALUES
  ('con-ing-1', 'Anticipo de Obra', 'ingreso'),
  ('con-ing-2', 'Estimación de Obra', 'ingreso'),
  ('con-ing-3', 'Finiquito de Contrato', 'ingreso'),
  ('con-ing-4', 'Venta de Mobiliario / Equipo', 'ingreso'),
  ('con-ing-5', 'Aditiva / Trabajo Extra', 'ingreso'),
  ('con-egr-1', 'Materiales de Construcción', 'egreso'),
  ('con-egr-2', 'Mano de Obra / Nómina', 'egreso'),
  ('con-egr-3', 'Subcontratos Especializados', 'egreso'),
  ('con-egr-4', 'Renta de Maquinaria y Equipo', 'egreso'),
  ('con-egr-5', 'Combustible, Fletes y Viáticos', 'egreso'),
  ('con-egr-6', 'Gastos Administrativos y Oficina', 'egreso')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cdo_incomes (id, mov_number, concept, date, company_id, company_name, client_id, client_name, project_id, project_name, subtotal, iva, total, account_id, account_name, timestamp_ms) VALUES
  ('inc-1', 1, 'Anticipo Obra Juárez 150', '2026-11-01', 'sa-1', 'S.A. Constructora 1', 'cli-1', 'Desarrollos Juárez S.A.', 'obra-juarez', 'Obra Juárez 150', 500000.00, 80000.00, 580000.00, 'acc-banorte', 'Banorte', 1793577600000),
  ('inc-2', 2, 'Estimación 1 - Corporativo', '2026-11-05', 'sa-2', 'S.A. Inmobiliaria 2', 'cli-2', 'Grupo Corporativo Reforma', 'obra-corp', 'Corporativo Reforma', 300000.00, 48000.00, 348000.00, 'acc-ixe', 'IXE', 1793923200000),
  ('inc-3', 3, 'Venta de Mobiliario Especial', '2026-11-10', 'sa-3', 'S.A. Fabricación 3', 'cli-3', 'Comercializadora del Norte', 'obra-mob', 'Obra Mobiliario Especial', 150000.00, 24000.00, 174000.00, 'acc-banregio', 'Banregio', 1794355200000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cdo_expenses (id, mov_number, concept, date, project_id, project_name, client_id, client_name, company_id, company_name, subtotal, iva, total, account_id, account_name, captured_via, expense_kind, approval_status, timestamp_ms) VALUES
  ('egr-1', 1, 'Acero y Varilla · Aceros del Norte', '2026-11-02', 'obra-juarez', 'Obra Juárez 150', 'cli-1', 'Desarrollos Juárez S.A.', 'sa-1', 'S.A. Constructora 1', 45000.00, 7200.00, 52200.00, 'acc-banorte', 'Banorte', 'Manual', 'gasto', 'autorizado', 1793664000000),
  ('egr-2', 2, 'Concreto Premezclado · Cemex', '2026-11-06', 'obra-corp', 'Corporativo Reforma', 'cli-2', 'Grupo Corporativo Reforma', 'sa-2', 'S.A. Inmobiliaria 2', 120000.00, 19200.00, 139200.00, 'acc-ixe', 'IXE', 'Manual', 'gasto', 'autorizado', 1794009600000),
  ('egr-3', 3, 'Tablero Melamina y Herrajes · Ticket #4481', '2026-11-11', 'obra-mob', 'Obra Mobiliario Especial', 'cli-3', 'Comercializadora del Norte', 'sa-3', 'S.A. Fabricación 3', 35000.00, 5600.00, 40600.00, 'acc-banregio', 'Banregio', 'WhatsApp OCR', 'gasto', 'autorizado', 1794441600000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cdo_loans_credits (id, kind, title, institution, card_last4, date, due_date, company_id, company_name, client_id, client_name, project_id, project_name, account_id, account_name, original_amount, paid_amount, remaining_amount, status, notes, timestamp_ms) VALUES
  ('loan-1', 'prestamo', 'Préstamo Capital de Trabajo · Obra Juárez 150', 'Financiera Regio', NULL, '2026-11-03', '2027-02-03', 'sa-1', 'S.A. Constructora 1', 'cli-1', 'Desarrollos Juárez S.A.', 'obra-juarez', 'Obra Juárez 150', 'acc-banorte', 'Banorte', 50000.00, 10000.00, 40000.00, 'activo', 'Préstamo asignado a arranque de cimentación', 1793750400000),
  ('loan-2', 'credito_bancario', 'Tarjeta Corporativa Banorte · Materiales', 'Banorte', '4421', '2026-11-08', '2026-12-15', 'sa-2', 'S.A. Inmobiliaria 2', 'cli-2', 'Grupo Corporativo Reforma', 'obra-corp', 'Corporativo Reforma', 'acc-ixe', 'IXE', 85000.00, 25000.00, 60000.00, 'activo', 'Línea revolvente para insumos de obra', 1794182400000)
ON CONFLICT (id) DO NOTHING;
