create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _rol public.user_role;
begin
  begin
    _rol := (new.raw_user_meta_data->>'rol')::public.user_role;
  exception when others then
    _rol := 'propietario';
  end;

  insert into public.profiles (id, email, rol, nombre, apellidos)
  values (
    new.id,
    new.email,
    coalesce(_rol, 'propietario'),
    nullif(trim(new.raw_user_meta_data->>'nombre'), ''),
    nullif(trim(new.raw_user_meta_data->>'apellidos'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
