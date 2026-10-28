-- CUSMAcheck Supabase schema (run in the Supabase SQL editor).
-- The server writes with the service-role key; Row Level Security keeps browser
-- clients (anon key) limited to their own rows.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  company_name text,
  province text check (province in ('AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT')),
  license_tier text not null default 'free' check (license_tier in ('free','starter','pro','concierge')),
  stripe_customer_id text,
  preferred_language text not null default 'en' check (preferred_language in ('en','fr')),
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_name text not null,
  hs_code text not null check (hs_code ~ '^[0-9]{6,10}$'),
  transaction_value numeric(14,2),
  net_cost numeric(14,2),
  ex_works_cost numeric(14,2),
  currency text not null default 'CAD',
  created_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  description text,
  hs_code text not null check (hs_code ~ '^[0-9]{6,10}$'),
  cost numeric(14,2) not null check (cost >= 0),
  country_of_origin char(2) not null,
  supplier_certified boolean not null default false
);

-- Audit trail: every check is logged with its inputs, result and the rate-table date.
create table if not exists checks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  visitor_id text,
  email text,
  hs_code text not null,
  status text not null,
  criterion_result char(1),
  qualifies boolean,
  rvc_percent numeric(6,2),
  tariff_exposure_estimate numeric(14,2),
  rates_as_of date,
  input jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists checks_email_idx on checks (email, created_at desc);
create index if not exists checks_hs_idx on checks (hs_code);

-- Reference table: one row per HS line per tariff program. Refreshed on a schedule;
-- every result shows the effective date it used.
create table if not exists tariff_rates (
  hs_code text not null,
  program text not null,          -- 'mfn', 's232_steel', 's338_canada', ...
  rate_percent numeric(6,2) not null,
  cusma_relief text not null default 'full' check (cusma_relief in ('full','partial','none')),
  effective_date date not null,
  source_url text,
  verified_by text,
  primary key (hs_code, program, effective_date)
);

alter table users enable row level security;
alter table products enable row level security;
alter table materials enable row level security;
alter table checks enable row level security;

create policy users_self on users for select using (auth.email() = email);
create policy products_owner on products for all using (user_id in (select id from users where email = auth.email()));
create policy materials_owner on materials for all using (product_id in (select p.id from products p join users u on u.id = p.user_id where u.email = auth.email()));
create policy checks_owner on checks for select using (auth.email() = email);
