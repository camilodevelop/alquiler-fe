-- ============================================================
-- Perfil manitas: foto, hoja de vida, historial de trabajos
-- Requiere: 06_modulo_mantenimiento.sql
-- ============================================================

alter table public.manitas
  add column if not exists foto_url text,
  add column if not exists foto_storage_path text,
  add column if not exists hoja_vida text;

create table if not exists public.manitas_trabajos (
  id uuid primary key default gen_random_uuid(),
  manitas_id uuid not null references public.manitas(id) on delete cascade,
  titulo text not null,
  descripcion text,
  propiedad_nombre text,
  fecha date not null default current_date,
  ticket_id uuid references public.tickets_mantenimiento(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_manitas_trabajos_manitas on public.manitas_trabajos(manitas_id);
create unique index if not exists idx_manitas_trabajos_ticket on public.manitas_trabajos(ticket_id)
  where ticket_id is not null;

alter table public.manitas_trabajos enable row level security;

drop policy if exists "manitas_trabajos_all" on public.manitas_trabajos;
create policy "manitas_trabajos_all" on public.manitas_trabajos for all
  using (public.user_can_access_manitas(manitas_id))
  with check (public.user_can_access_manitas(manitas_id));
