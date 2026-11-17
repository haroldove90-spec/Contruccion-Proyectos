-- ============================================================================
-- SUPABASE SQL SCHEMA — PROYECTO: projectos_inmobiliarios (qflgjlwfzfqspxvwoegs)
-- Módulos CDO: Resumen, Ingresos, Egresos, Control Bancario y Efectivo, Catálogos
-- Ejecutar completo en: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

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
-- Regla: Se ingresa Monto s/IVA; IVA (16%) y Total c/IVA se calculan automáticamente
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

-- 7. REGISTRO CENTRALIZADO DE EGRESOS (MANUAL Y WHATSAPP OCR)
-- Regla: Ligado a Obra (Centro de Costos), S.A. Pagadora y Cuenta de Origen
CREATE TABLE IF NOT EXISTS public.cdo_expenses (
  id TEXT PRIMARY KEY,
  mov_number INTEGER NOT NULL,
  concept TEXT NOT NULL,
  date TEXT NOT NULL,
  project_id TEXT REFERENCES public.cdo_projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  company_id TEXT REFERENCES public.cdo_companies(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
  iva NUMERIC(14, 2) NOT NULL CHECK (iva >= 0),
  total NUMERIC(14, 2) NOT NULL CHECK (total >= 0),
  account_id TEXT REFERENCES public.cdo_accounts(id) ON DELETE SET NULL,
  account_name TEXT NOT NULL,
  captured_via TEXT NOT NULL CHECK (captured_via IN ('Manual', 'WhatsApp OCR')),
  timestamp_ms BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA CONSULTAS RÁPIDAS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_cdo_incomes_company ON public.cdo_incomes(company_id);
CREATE INDEX IF NOT EXISTS idx_cdo_incomes_account ON public.cdo_incomes(account_id);
CREATE INDEX IF NOT EXISTS idx_cdo_expenses_company ON public.cdo_expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_cdo_expenses_account ON public.cdo_expenses(account_id);
CREATE INDEX IF NOT EXISTS idx_cdo_expenses_project ON public.cdo_expenses(project_id);

-- ============================================================================
-- VISTAS EN TIEMPO REAL (PARA AUDITORÍA DIRECTA EN SUPABASE)
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
  GROUP BY company_id
) egr ON egr.company_id = c.id
LEFT JOIN (
  SELECT a.company_id, SUM(v.saldo_actual) AS saldo_bancos
  FROM public.cdo_accounts a
  JOIN public.cdo_bank_balances_view v ON v.id = a.id
  GROUP BY a.company_id
) b ON b.company_id = c.id;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — Acceso para API pública de la app CDO
-- ============================================================================
ALTER TABLE public.cdo_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cdo_expenses ENABLE ROW LEVEL SECURITY;

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

INSERT INTO public.cdo_expenses (id, mov_number, concept, date, project_id, project_name, company_id, company_name, subtotal, iva, total, account_id, account_name, captured_via, timestamp_ms) VALUES
  ('egr-1', 1, 'Acero y Varilla · Aceros del Norte', '2026-11-02', 'obra-juarez', 'Obra Juárez 150', 'sa-1', 'S.A. Constructora 1', 45000.00, 7200.00, 52200.00, 'acc-banorte', 'Banorte', 'Manual', 1793664000000),
  ('egr-2', 2, 'Concreto Premezclado · Cemex', '2026-11-06', 'obra-corp', 'Corporativo Reforma', 'sa-2', 'S.A. Inmobiliaria 2', 120000.00, 19200.00, 139200.00, 'acc-ixe', 'IXE', 'Manual', 1794009600000),
  ('egr-3', 3, 'Tablero Melamina y Herrajes · Ticket #4481', '2026-11-11', 'obra-mob', 'Obra Mobiliario Especial', 'sa-3', 'S.A. Fabricación 3', 35000.00, 5600.00, 40600.00, 'acc-banregio', 'Banregio', 'WhatsApp OCR', 1794441600000)
ON CONFLICT (id) DO NOTHING;
