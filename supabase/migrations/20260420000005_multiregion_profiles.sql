-- ==========================================
-- AÑADIR pais_codigo a profiles
-- DEFAULT 'ES' preserva todos los registros existentes
-- ==========================================
alter table public.profiles
  add column pais_codigo char(2) not null default 'ES'
    references public.paises(codigo) on update cascade;

create index idx_profiles_pais_codigo on public.profiles(pais_codigo);

-- ==========================================
-- ACTUALIZAR TRIGGER handle_new_user
-- Propaga pais_codigo desde raw_user_meta_data
-- Valida contra el catálogo; si inválido → 'ES'
-- ==========================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _rol        public.user_role;
  _pais       char(2);
begin
  begin
    _rol := (new.raw_user_meta_data->>'rol')::public.user_role;
  exception when others then
    _rol := 'propietario';
  end;

  select codigo into _pais
  from public.paises
  where codigo = upper(trim(coalesce(new.raw_user_meta_data->>'pais_codigo', 'ES')))
    and activo = true;

  _pais := coalesce(_pais, 'ES');

  insert into public.profiles (id, email, rol, nombre, apellidos, telefono, pais_codigo)
  values (
    new.id,
    new.email,
    coalesce(_rol, 'propietario'),
    nullif(trim(coalesce(new.raw_user_meta_data->>'nombre', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'apellidos', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'telefono', '')), ''),
    _pais
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
