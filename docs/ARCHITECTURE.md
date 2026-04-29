# Documentación Técnica — Plataforma de Gestión de Alquileres

**Versión**: 0.1.0  
**Fecha**: Abril 2026  
**Stack**: Next.js 15 · Expo · Supabase · Turborepo

---

## 1. Visión General

Plataforma SaaS orientada al mercado español que permite a propietarios, gestores, inquilinos y profesionales gestionar de forma integral las viviendas en alquiler.

**Modelo de negocio**: Freemium (1 vivienda gratis) + suscripciones (Básico / Pro / Agencia) + comisiones por marketplace.

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                 │
│                                                                  │
│   ┌──────────────────┐          ┌──────────────────────────┐    │
│   │   Web (Next.js)  │          │   Mobile (Expo RN)        │    │
│   │                  │          │                           │    │
│   │ ┌──────────────┐ │          │  iOS / Android            │    │
│   │ │ Public (SSR) │ │          │  App Store / Play Store   │    │
│   │ │  SEO pages   │ │          │                           │    │
│   │ └──────────────┘ │          └──────────────────────────┘    │
│   │ ┌──────────────┐ │                                           │
│   │ │ Admin (CSR)  │ │                                           │
│   │ │  Dashboard   │ │                                           │
│   │ └──────────────┘ │                                           │
│   └──────────────────┘                                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS / WebSocket
┌───────────────────────────────▼─────────────────────────────────┐
│                        SUPABASE                                  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │ PostgREST│  │   Auth   │  │ Realtime │  │ Edge Functions  │ │
│  │  (API)   │  │  (JWT)   │  │(WebSocket│  │ (Deno/TS)       │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬────────┘ │
│       │             │              │                  │          │
│  ┌────▼─────────────▼──────────────▼──────────────────▼───────┐ │
│  │                    PostgreSQL + RLS                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Storage (S3-compatible)                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Estructura del Monorepo

```
alquiler-fe/
├── apps/
│   ├── web/                    # Next.js 15 App Router
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (public)/   # SSR/SSG — SEO público
│   │       │   ├── (auth)/     # Autenticación
│   │       │   ├── (admin)/    # Panel de gestión (CSR)
│   │       │   └── auth/       # Route handlers (callback)
│   │       ├── components/     # Componentes de la app
│   │       ├── contexts/       # React contexts (auth)
│   │       ├── hooks/          # Custom hooks
│   │       └── lib/            # Clientes Supabase, query client
│   │
│   └── mobile/                 # Expo SDK 52
│       ├── app/
│       │   ├── (tabs)/         # Navegación por tabs
│       │   └── (auth)/         # Flujo de autenticación
│       ├── store/              # Zustand stores
│       ├── components/         # Componentes de la app
│       └── lib/                # Cliente Supabase
│
├── packages/
│   ├── shared/                 # Tipos + schemas Zod (web + mobile)
│   │   └── src/
│   │       ├── types/          # UserRole, TipoAlquiler, etc.
│   │       └── schemas/        # auth, propiedad, contrato, inquilino
│   │
│   ├── ui/                     # Componentes React para web
│   │   └── src/                # Button, Card, Badge
│   │
│   └── supabase/               # Tipos DB auto-generados
│       └── src/types.ts        # Database interface
│
├── supabase/
│   ├── migrations/             # SQL versionado
│   ├── functions/              # Edge Functions (Deno)
│   └── config.toml
│
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml
└── CLAUDE.md                   # Guía para Claude Code
```

---

## 4. Stack Tecnológico

### Frontend Web (`apps/web`)

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | ^15 | Framework, SSR/SSG, App Router |
| react | ^19 | UI |
| typescript | ^5.7 | Tipado estático |
| tailwindcss | ^3.4 | Estilos |
| @supabase/ssr | ^0.5 | Cliente Supabase para Next.js |
| @tanstack/react-query | ^5 | Server state, cache, mutations |
| zustand | ^5 | Client state (UI, modales, etc.) |
| react-hook-form | ^7 | Formularios |
| zod | ^3 | Validación (schemas compartidos) |
| recharts | ^2 | Gráficos financieros |
| @tanstack/react-table | ^8 | Tablas del panel admin |

### Frontend Mobile (`apps/mobile`)

| Paquete | Versión | Uso |
|---------|---------|-----|
| expo | ~52 | SDK, build, OTA updates |
| expo-router | ~4 | Navegación file-based |
| react-native | 0.76.x | UI nativa |
| nativewind | ^4 | Tailwind para React Native |
| expo-secure-store | ~14 | Almacenamiento seguro de sesión |
| expo-notifications | ~0.29 | Push notifications |
| react-native-maps | 1.18 | Mapas y geolocalización |

### Backend (Supabase)

| Servicio | Uso |
|----------|-----|
| PostgreSQL | Base de datos principal |
| Auth (JWT) | Autenticación, sesiones, roles |
| Row Level Security | Autorización a nivel de fila |
| Realtime | Chat en tiempo real (WebSockets) |
| Storage | Fotos, documentos, contratos |
| Edge Functions | Lógica de negocio (pagos, notificaciones) |

### Servicios Externos

| Servicio | Integración | Estado |
|----------|------------|--------|
| Stripe | Pagos con tarjeta | Fase 1 |
| Signaturit | Firma digital contratos | Fase 1 |
| Google Maps API | Geolocalización | Fase 1 |
| Resend | Emails transaccionales | Fase 1 |
| Bizum | Pagos p2p España | Fase 2 |

---

## 5. Modelo de Datos (MVP)

### Tablas principales

#### `profiles`
Extiende `auth.users`. Un perfil por usuario.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid PK | Referencia a auth.users |
| email | text | Email único |
| nombre | text | Nombre |
| apellidos | text | Apellidos |
| rol | enum | propietario / gestor / inquilino / manitas / agente |
| avatar_url | text | URL de foto en Storage |
| telefono | text | Teléfono de contacto |

#### `propiedades`
Unidad inmobiliaria base del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid PK | |
| owner_id | uuid FK → profiles | Propietario o gestor |
| titulo | text | Título descriptivo |
| tipo_alquiler | enum | tradicional / habitaciones / corta_estancia / flipping |
| estado | enum | disponible / alquilada / mantenimiento / inactiva |
| precio_mes | numeric | Precio mensual |
| lat / lng | float | Coordenadas para mapa |

#### `contratos`
Contrato activo entre propietario e inquilino.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| propiedad_id | FK → propiedades | |
| inquilino_id | FK → profiles | |
| fecha_inicio / fecha_fin | date | Vigencia |
| renta_mensual | numeric | Importe mensual |
| dia_cobro | smallint | Día esperado de cobro (1-31) |
| estado | enum | borrador / pendiente_firma / activo / vencido / cancelado |

#### `pagos`
Registro de cada cobro mensual.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| contrato_id | FK → contratos | |
| periodo | date | Primer día del mes |
| estado | enum | pendiente / cobrado / parcial / impagado |
| metodo_pago | enum | transferencia / bizum / tarjeta / efectivo |

#### `tickets`
Incidencias y mantenimiento.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| propiedad_id | FK → propiedades | |
| creado_por | FK → profiles | |
| asignado_a | FK → profiles | Manitas/técnico |
| urgencia | enum | baja / media / alta / emergencia |
| estado | enum | pendiente / en_curso / finalizado / cancelado |

#### `mensajes`
Chat por contrato (tiempo real vía Supabase Realtime).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| contrato_id | FK → contratos | Canal de comunicación |
| autor_id | FK → profiles | |
| contenido | text | Mensaje |
| leido | boolean | Estado de lectura |

---

## 6. Seguridad y RLS

### Principio
Todo acceso a datos pasa por RLS. No existe lógica de filtrado en el cliente.

### Matriz de acceso

| Tabla | Propietario | Gestor | Inquilino | Manitas |
|-------|-------------|--------|-----------|---------|
| propiedades | CRUD propias | CRUD asignadas | SELECT disponibles | SELECT |
| contratos | CRUD propias | CRUD asignadas | SELECT propios | — |
| pagos | CRUD propias | CRUD asignadas | SELECT propios | — |
| tickets | CRUD propias | CRUD asignadas | INSERT/SELECT propios | UPDATE asignados |
| mensajes | ALL propias | ALL asignadas | ALL propios | ALL asignados |

### Auth flow

```
Usuario → Supabase Auth (email/password)
       → JWT con claims (id, rol)
       → RLS evalúa auth.uid() en cada query
       → Next.js middleware valida sesión en SSR
       → Mobile guarda JWT en SecureStore
```

---

## 7. Flujos de Autenticación

### Web
```
/registro → supabase.auth.signUp() → email confirmación
         → /auth/callback?code=xxx → exchangeCodeForSession()
         → redirect /dashboard

/login    → supabase.auth.signInWithPassword()
         → redirect /dashboard

middleware.ts → valida sesión en cada request
             → redirige /login si no autenticado
             → redirige /dashboard si ya autenticado y en /login
```

### Mobile
```
app/_layout.tsx → useAuthStore.initialize()
               → onAuthStateChange listener
               → router.replace("/(tabs)") si session
               → router.replace("/(auth)/login") si no session

Sesión persiste en SecureStore (expo-secure-store)
```

---

## 8. Patrones de Desarrollo

### Server vs Client components (Next.js)
- **Server component** por defecto: layouts, páginas con fetch de datos
- **Client component** (`"use client"`): formularios, interactividad, hooks de estado
- Los formularios de auth son client components porque usan estado y eventos

### Estado
- **TanStack Query**: datos del servidor (propiedades, contratos, pagos)
- **Zustand**: estado UI (modales, filtros, auth session en mobile)
- No mezclar: no guardar datos del servidor en Zustand

### Validación
```
packages/shared/src/schemas/xxx.ts  ← definir aquí
apps/web  → importar de @alquiler/shared  ← NO redefinir
apps/mobile → importar de @alquiler/shared  ← NO redefinir
```

### Clientes Supabase
```typescript
// Web - componente cliente
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Web - server component / route handler
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();

// Mobile
import { supabase } from "@/lib/supabase";
```

---

## 9. Guía de Desarrollo

### Añadir una nueva tabla

1. Crear migración: `supabase/migrations/YYYYMMDDHHMMSS_nombre.sql`
2. Definir tabla con `uuid` PK, `created_at`, `updated_at`
3. Añadir trigger `set_updated_at`
4. Habilitar RLS + políticas en migración separada
5. Regenerar tipos: `pnpm db:types`
6. Añadir tipos iniciales en `packages/shared/src/types/`
7. Crear schema Zod en `packages/shared/src/schemas/`

### Añadir una nueva ruta web (admin)

```
apps/web/src/app/(admin)/
└── nueva-seccion/
    ├── page.tsx          ← server component, fetch inicial
    └── nueva-seccion-client.tsx  ← "use client", interactividad
```

### Añadir una nueva pantalla mobile

```
apps/mobile/app/
└── (tabs)/
    └── nueva-pantalla.tsx
```

---

## 10. Deploy

| App | Plataforma | Comando |
|-----|-----------|---------|
| Web | Vercel | `git push` → auto deploy |
| Mobile iOS | Expo EAS | `eas build --platform ios` |
| Mobile Android | Expo EAS | `eas build --platform android` |
| Backend | Supabase Cloud | `supabase db push` |

### Variables de entorno requeridas

Ver `.env.example` en la raíz del proyecto.

---

## 11. Roadmap Técnico

### Fase 1 — MVP
- [x] Estructura monorepo
- [x] Schema DB inicial (profiles, propiedades, contratos, pagos, tickets, mensajes)
- [x] RLS policies MVP
- [x] Módulo de autenticación (web + mobile)
- [ ] CRUD Propiedades
- [ ] Contratos con firma digital (Signaturit)
- [ ] Chat en tiempo real (Supabase Realtime)
- [ ] Pagos básicos (Stripe)
- [ ] Tickets de mantenimiento

### Fase 2
- [ ] Scoring de inquilinos
- [ ] Marketplace de manitas
- [ ] Agendamiento de visitas (Google Calendar sync)
- [ ] Análisis de rentabilidad

### Fase 3
- [ ] Multi-idioma (i18n)
- [ ] Marca blanca para agencias
- [ ] IA: predicción de impagos, OCR facturas, voz
