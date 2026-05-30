-- FisioAssess Supabase schema (MVP)
-- Run in Supabase SQL editor.

-- Patients
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  birth_date date null,
  age int null,
  sex text null,
  weight_kg numeric null,
  height_cm numeric null,
  resting_heart_rate int null,
  diagnosis text null,
  comorbidities text null,
  functional_level text null,
  clinical_notes text null,
  therapist_name text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patients_user_id_idx on public.patients(user_id);
create index if not exists patients_updated_at_idx on public.patients(updated_at desc);

-- Evaluations
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  tool_id text not null,
  tool_title text not null,
  category text null,
  date timestamptz not null default now(),
  mode text not null default 'patient',
  inputs jsonb not null default '{}'::jsonb,
  results jsonb not null default '{}'::jsonb,
  reference_used jsonb null,
  interpretation jsonb null,
  alerts jsonb not null default '[]'::jsonb,
  mcid_analysis jsonb null,
  therapist_notes text null,
  created_at timestamptz not null default now()
);

create index if not exists evaluations_user_id_idx on public.evaluations(user_id);
create index if not exists evaluations_patient_id_date_idx on public.evaluations(patient_id, date desc);

-- Updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_patients_updated_at on public.patients;
create trigger set_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

-- RLS
alter table public.patients enable row level security;
alter table public.evaluations enable row level security;

-- Patients policies
create policy "patients_select_own" on public.patients
for select using (auth.uid() = user_id);

create policy "patients_insert_own" on public.patients
for insert with check (auth.uid() = user_id);

create policy "patients_update_own" on public.patients
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "patients_delete_own" on public.patients
for delete using (auth.uid() = user_id);

-- Evaluations policies
create policy "evaluations_select_own" on public.evaluations
for select using (auth.uid() = user_id);

create policy "evaluations_insert_own" on public.evaluations
for insert with check (auth.uid() = user_id);

create policy "evaluations_update_own" on public.evaluations
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "evaluations_delete_own" on public.evaluations
for delete using (auth.uid() = user_id);
