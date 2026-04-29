# Alquiler — Guía para Claude

## Qué es este proyecto

Plataforma SaaS de gestión integral de alquileres para el mercado español. Proyecto Next.js standalone con:
- `src/app/` — rutas Next.js 15 App Router
- `src/shared/` — tipos TypeScript y schemas Zod
- `src/components/ui/` — componentes React primitivos (Button, Card, Badge)
- `src/lib/supabase/` — clientes Supabase y tipos generados de la DB
- `supabase/` — migraciones PostgreSQL y edge functions

## Comandos esenciales

```bash
pnpm install        # instalar dependencias
pnpm dev            # levantar en desarrollo
pnpm build          # compilar para producción
pnpm type-check     # verificar tipos TypeScript

supabase start      # DB local
supabase db reset   # aplicar migraciones desde cero
pnpm db:types       # regenerar src/lib/supabase/types.ts desde el schema
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Web | Next.js 15, App Router, TypeScript, Tailwind CSS |
| Estado | TanStack Query (server) + Zustand (client) |
| Formularios | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions) |

## Convenciones

### Estructura de archivos (src/app/)
- `(public)/` — rutas SSR/SSG públicas con SEO
- `(auth)/` — páginas de autenticación
- `(admin)/` — panel de gestión (CSR, requiere auth)
- Server components por defecto; `"use client"` solo cuando se necesita interactividad

### Formularios
Schemas Zod en `src/shared/schemas/`. No definir schemas Zod en `src/app/`.

### Supabase
- Cliente browser: `@/lib/supabase/client.ts`
- Cliente server: `@/lib/supabase/server.ts` (solo en server components y route handlers)
- Cliente admin: `@/lib/supabase/admin.ts` (solo en server actions, usa service role key)
- Tipos DB: `@/lib/supabase/types.ts` (auto-generado, no editar manualmente)
- Toda tabla nueva necesita políticas RLS antes de ser usada

### Imports internos
Usar siempre el alias `@/` que apunta a `src/`:
- `@/shared` — tipos y schemas
- `@/components/ui` — componentes primitivos
- `@/lib/supabase/types` — tipos de la DB

### Componentes UI
Usar `@/components/ui` para primitivos (Button, Card, Badge). Para componentes de shadcn/ui, instalar con `npx shadcn@latest add <componente>` desde la raíz del proyecto.

## Perfiles de usuario

| Rol | Acceso |
|-----|--------|
| `propietario` | Panel admin, sus propiedades |
| `gestor` | Panel admin, propiedades asignadas |
| `inquilino` | Portal web, su contrato y pagos |
| `manitas` | Portal web, tickets asignados |
| `agente` | Marketplace de inversión |

## Módulos (Roadmap)

- **Fase 1 MVP**: Auth ✅, Viviendas, Contratos, Chat, Pagos, Mantenimiento básico
- **Fase 2**: Scoring inquilinos, Marketplace manitas, Agenda
- **Fase 3**: Multi-idioma, marca blanca para agencias

## Agentes disponibles

- `arquitecto-proptech` — diseño de arquitectura, decisiones técnicas, división de features
- `frontend-proptech` — implementación React (Next.js)
- `backend-proptech` — Supabase, migraciones, RLS, Edge Functions
