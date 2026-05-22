# Scripts SQL para Supabase Dashboard

## Cómo ejecutar

1. Abre [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto.
2. Ve a **SQL Editor** → **New query**.
3. Copia y pega el script indicado abajo.
4. Pulsa **Run**.

## ¿Qué script usar?

| Situación | Archivo |
|-----------|---------|
| Proyecto **nuevo** o vacío (sin tablas) | `01_schema_completo.sql` |
| Ya tienes auth, profiles, paises… y solo falta el **módulo propiedades** | `02_solo_modulo_propiedades.sql` |
| La propiedad se guarda pero **la foto no** (permisos Storage) | `03_fix_storage_policies.sql` |
| Quieres el **módulo inquilinos** (tablas + RLS + Storage documentos) | `04_modulo_inquilinos.sql` |

## Después de ejecutar

1. **Settings → API**: copia `Project URL`, `anon key` y `service_role key` a `.env.local`.
2. En local con CLI: `pnpm db:types` para regenerar tipos TypeScript.

## Orden de migraciones (referencia)

Si usas CLI: `supabase db reset` aplica automáticamente:

1. `20260420000000_auth_schema.sql`
2. `20260420000001_auth_rls.sql`
3. `20260420000002_auth_trigger_rol.sql`
4. `20260420000003_auth_trigger_telefono.sql`
5. `20260420000004_paises_schema.sql`
6. `20260420000005_multiregion_profiles.sql`
7. `20260420000006_multiregion_propiedades.sql`
8. `20260521000000_propiedades_modulo.sql`
9. `20260521100000_inquilinos_modulo.sql`
