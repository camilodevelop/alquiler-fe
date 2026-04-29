-- ==========================================
-- RLS: profiles
-- ==========================================
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Gestor puede ver el perfil de los propietarios que gestiona
create policy "profiles_select_propietario_por_gestor"
  on public.profiles for select
  using (
    exists (
      select 1 from public.gestor_propietario gp
      where gp.gestor_id     = auth.uid()
        and gp.propietario_id = profiles.id
    )
  );

-- ==========================================
-- RLS: invitaciones
-- ==========================================
alter table public.invitaciones enable row level security;

-- El invitador ve y gestiona sus propias invitaciones
create policy "invitaciones_select_invitador"
  on public.invitaciones for select
  using (invitado_por = auth.uid());

create policy "invitaciones_insert_invitador"
  on public.invitaciones for insert
  with check (invitado_por = auth.uid());

create policy "invitaciones_update_invitador"
  on public.invitaciones for update
  using (invitado_por = auth.uid());

create policy "invitaciones_delete_invitador"
  on public.invitaciones for delete
  using (invitado_por = auth.uid());

-- Acceso público por token para el flujo de aceptación de invitación
-- (el token actúa como secreto de 256 bits; la validación de expiración
-- y cambio de estado se hace en la Edge Function)
create policy "invitaciones_select_by_token"
  on public.invitaciones for select
  using (true);

-- ==========================================
-- RLS: gestor_propietario
-- ==========================================
alter table public.gestor_propietario enable row level security;

-- Propietario gestiona sus gestores
create policy "gestor_propietario_select_propietario"
  on public.gestor_propietario for select
  using (propietario_id = auth.uid());

create policy "gestor_propietario_insert_propietario"
  on public.gestor_propietario for insert
  with check (propietario_id = auth.uid());

create policy "gestor_propietario_delete_propietario"
  on public.gestor_propietario for delete
  using (propietario_id = auth.uid());

-- Gestor ve los propietarios que gestiona
create policy "gestor_propietario_select_gestor"
  on public.gestor_propietario for select
  using (gestor_id = auth.uid());
