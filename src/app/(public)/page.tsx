import type { Metadata } from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faBriefcase, faKey, faWrench } from "@fortawesome/free-solid-svg-icons";
import { AnimatedSection } from "@/components/ui/animated-section";
import { StickyHeader } from "@/components/ui/sticky-header";
import { Typewriter } from "@/components/ui/typewriter";

export const metadata: Metadata = {
  title: "Rentyva — Gestión integral de propiedades",
  description: "Plataforma SaaS para gestionar propiedades en alquiler: contratos, pagos, mantenimiento y más.",
};

const STATS = [
  { value: "500+", label: "Propietarios activos" },
  { value: "3.200+", label: "Propiedades gestionadas" },
  { value: "€2.1M", label: "Rentas gestionadas" },
  { value: "98%", label: "Satisfacción clientes" },
];

const FEATURES = [
  {
    icon: "🏠",
    title: "Gestión de viviendas",
    description: "CRUD completo con galería de fotos, documentos y KPIs por propiedad: ocupación, ROI y cashflow en tiempo real.",
  },
  {
    icon: "📄",
    title: "Contratos digitales",
    description: "Firma electrónica con Signaturit y DocuSign. Plantillas inteligentes que se autocompletan con datos del inquilino.",
  },
  {
    icon: "💳",
    title: "Cobros automáticos",
    description: "Bizum, Stripe y SEPA en un solo flujo. Recordatorios automáticos, recibos digitales y conciliación contable.",
  },
  {
    icon: "🔧",
    title: "Mantenimiento y tickets",
    description: "Los inquilinos reportan incidencias desde la app. Asigna tareas a técnicos, sigue el estado y archiva el historial.",
  },
  {
    icon: "🤖",
    title: "Scoring IA de inquilinos",
    description: "Analiza el perfil financiero, historial de pagos y referencias de cada candidato para recomendarte al más fiable.",
  },
  {
    icon: "📊",
    title: "Rentabilidad y ROI",
    description: "Dashboard financiero con cashflow, rentabilidad bruta/neta y proyecciones a 5 años. Exporta informes para tu asesor.",
  },
];

const PROFILES = [
  {
    role: "Propietario",
    icon: faHouse,
    desc: "Gestiona todas tus propiedades desde un panel unificado. Cobros automáticos, alertas de impago y análisis de rentabilidad.",
    points: ["Panel de KPIs por propiedad", "Cobros automáticos y alertas", "Historial de contratos y docs", "Análisis de rentabilidad"],
    accent: "#09b850",
    bgLight: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    role: "Gestor inmobiliario",
    icon: faBriefcase,
    desc: "Administra carteras de múltiples propietarios con automatización de tareas e informes mensuales.",
    points: ["Gestión multi-propietario", "Automatización de tareas", "Comunicación centralizada", "Informes para propietarios"],
    accent: "#7c3aed",
    bgLight: "#faf5ff",
    border: "#ddd6fe",
  },
  {
    role: "Inquilino",
    icon: faKey,
    desc: "Portal propio para pagar, reportar incidencias, descargar documentos y comunicarte con tu casero.",
    points: ["Pago online en 1 click", "Reporte de incidencias", "Descarga recibos y contrato", "Chat con propietario"],
    accent: "#0891b2",
    bgLight: "#ecfeff",
    border: "#a5f3fc",
  },
  {
    role: "Manitas / Técnico",
    icon: faWrench,
    desc: "Recibe tickets geolocalizados, gestiona tu agenda y cobra desde la app con perfil verificado en el marketplace.",
    points: ["Tickets geolocalizados", "Agenda integrada", "Presupuestos y facturas", "Perfil verificado"],
    accent: "#d97706",
    bgLight: "#fffbeb",
    border: "#fde68a",
  },
];

const RENTAL_TYPES = [
  {
    type: "Alquiler tradicional",
    desc: "Contratos LAU de larga duración. Gestión de fianzas, suministros, revisiones IPC y comunicación con la AEAT.",
    tag: "Lo más común",
    icon: "🏡",
    color: "#09b850",
    bg: "#f0fdf4",
  },
  {
    type: "Por habitaciones",
    desc: "Múltiples contratos por propiedad, gestión independiente por habitación y reparto automático de suministros.",
    tag: "Mayor rentabilidad",
    icon: "🛏️",
    color: "#7c3aed",
    bg: "#faf5ff",
  },
  {
    type: "Corta estancia",
    desc: "Integra Airbnb y Booking. Gestión de check-in/out, limpieza, calendario unificado y fiscalidad turística.",
    tag: "Airbnb / Booking",
    icon: "🧳",
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    type: "Flipping inmobiliario",
    desc: "Seguimiento de obra y reformas, control de costes, calculadora de margen y gestión documental del proceso de venta.",
    tag: "Compra-reforma-vende",
    icon: "🏗️",
    color: "#d97706",
    bg: "#fffbeb",
  },
];

const PLANS = [
  {
    name: "Gratis",
    price: "0",
    desc: "Perfecto para empezar",
    features: ["1 propiedad", "Contratos básicos", "Cobros manuales", "Soporte por email"],
    cta: "Empezar gratis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "19",
    desc: "Para propietarios activos",
    features: ["Hasta 10 propiedades", "Firma electrónica", "Cobros automáticos", "Scoring de inquilinos", "Análisis de rentabilidad", "Soporte prioritario"],
    cta: "Empezar con Pro",
    highlight: true,
  },
  {
    name: "Agencia",
    price: "79",
    desc: "Para gestoras profesionales",
    features: ["Propiedades ilimitadas", "Todo lo de Pro", "Multi-propietario", "API acceso", "White-label", "Account manager"],
    cta: "Contactar ventas",
    highlight: false,
  },
];

const TRUST_ITEMS = [
  "Banco Santander",
  "Fotocasa Pro",
  "Idealista",
  "RE/MAX España",
  "Solvia",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      <StickyHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-white pt-20 pb-24">
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #09b850 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* Green glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "#09b850" }} />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border mb-8" style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", color: "#09b850" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ backgroundColor: "#09b850" }} />
              Nuevo: Scoring de inquilinos con IA
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/></svg>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6">
              <span className="block">Gestiona tus alquileres</span>
              <Typewriter text="sin complicaciones" />
            </h1>

            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Contratos, cobros, mantenimiento y comunicación con tus inquilinos — todo en una sola plataforma diseñada para el mercado español.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a href="/registro" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-base shadow-lg transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5" style={{ backgroundColor: "#09b850", boxShadow: "0 8px 24px rgba(9,184,80,0.3)" }}>
                Empezar gratis
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/></svg>
              </a>
              <a href="#funcionalidades" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                Ver funcionalidades
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-20">
              {STATS.map((s, i) => (
                <AnimatedSection key={s.label} delay={i * 100} className="text-center">
                  <div className="text-3xl font-extrabold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </AnimatedSection>
              ))}
            </div>

            {/* Dashboard mockup */}
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white" style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4 bg-white rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-400">
                    app.alquiler.es/dashboard
                  </div>
                </div>
                {/* App content */}
                <div className="flex h-[420px]">
                  {/* Sidebar */}
                  <div className="w-52 border-r border-gray-100 bg-gray-50 p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4">
                      <span className="text-sm font-semibold text-gray-800">Rentyva</span>
                    </div>
                    {[
                      { label: "Dashboard", icon: "◉", active: true },
                      { label: "Propiedades", icon: "🏠", active: false },
                      { label: "Contratos", icon: "📄", active: false },
                      { label: "Cobros", icon: "💳", active: false },
                      { label: "Mantenimiento", icon: "🔧", active: false },
                      { label: "Finanzas", icon: "📊", active: false },
                    ].map((item) => (
                      <div key={item.label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${item.active ? "text-white" : "text-gray-500"}`} style={item.active ? { backgroundColor: "#09b850" } : {}}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Buenos días, Carlos 👋</h3>
                        <p className="text-xs text-gray-400">Resumen de tu cartera — Abril 2025</p>
                      </div>
                      <div className="text-xs text-white px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: "#09b850" }}>+ Nueva propiedad</div>
                    </div>

                    {/* KPI cards */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {[
                        { label: "Ingresos mes", value: "€8.450", change: "+12%", up: true },
                        { label: "Ocupación", value: "94%", change: "+2%", up: true },
                        { label: "Propiedades", value: "12", change: "activas", up: true },
                        { label: "Pendientes", value: "€320", change: "cobrar", up: false },
                      ].map((k) => (
                        <div key={k.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                          <div className="text-xs text-gray-400 mb-1">{k.label}</div>
                          <div className="text-lg font-bold text-gray-900">{k.value}</div>
                          <div className={`text-xs font-medium mt-0.5 ${k.up ? "" : "text-orange-500"}`} style={k.up ? { color: "#09b850" } : {}}>
                            {k.change}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Properties list */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                        <span className="text-xs font-semibold text-gray-700">Propiedades recientes</span>
                        <span className="text-xs" style={{ color: "#09b850" }}>Ver todas →</span>
                      </div>
                      {[
                        { name: "C/ Gran Vía 24, Madrid", tenant: "Ana García", rent: "€1.200", status: "Al día" },
                        { name: "Av. Diagonal 88, Barcelona", tenant: "Luis Martín", rent: "€950", status: "Al día" },
                        { name: "C/ Sierpes 12, Sevilla", tenant: "—", rent: "€780", status: "Disponible" },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                          <div>
                            <div className="text-xs font-medium text-gray-800">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.tenant}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-gray-700">{p.rent}/mes</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "Al día" ? "text-green-700 bg-green-50" : "text-orange-700 bg-orange-50"}`}>
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow under mockup */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 blur-3xl opacity-20 rounded-full" style={{ backgroundColor: "#09b850" }} />
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">
            De confianza para propietarios y gestoras en toda España
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {TRUST_ITEMS.map((name) => (
              <span key={name} className="text-sm font-bold text-gray-300 tracking-wide uppercase">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "#09b850", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              Funcionalidades
            </span>
            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Desde la firma del contrato hasta el último cobro, cubrimos cada paso de la gestión de tu patrimonio inmobiliario.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 80}>
                <div className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-200 h-full">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-colors" style={{ backgroundColor: "#f0fdf4" }}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#09b850" }}>
                    Saber más
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/></svg>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PERFILES */}
      <section id="perfiles" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "#09b850", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              Para quién
            </span>
            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight">
              Una plataforma, todos los perfiles
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Diseñada para cada actor del mercado del alquiler en España.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROFILES.map((p, i) => (
              <AnimatedSection key={p.role} delay={i * 100}>
                <div className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all h-full" style={{ borderColor: p.border }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: p.bgLight }}>
                    <FontAwesomeIcon icon={p.icon} className="w-5 h-5" style={{ color: p.accent }} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{p.role}</h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{p.desc}</p>
                  <ul className="space-y-2">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-xs text-gray-600">
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: p.accent }}>
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                        </svg>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* TIPOS DE ALQUILER */}
      <section id="tipos-alquiler" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "#09b850", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              Tipos de alquiler
            </span>
            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight">
              Todos los modelos de inversión
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Seas cual sea tu estrategia inmobiliaria, tenemos el módulo adecuado para ti.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {RENTAL_TYPES.map((rt, i) => (
              <AnimatedSection key={rt.type} delay={i * 100}>
                <div className="group p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all h-full" style={{ backgroundColor: rt.bg }}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{rt.icon}</span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: rt.color }}>
                      {rt.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{rt.type}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{rt.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* IA DIFERENCIAL — única sección dark */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "#09b850", backgroundColor: "rgba(9,184,80,0.1)", borderColor: "rgba(9,184,80,0.3)" }}>
              Inteligencia Artificial
            </span>
            <h2 className="mt-4 text-4xl font-extrabold text-white tracking-tight">
              La IA que trabaja por ti
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Predice impagos, analiza documentos y evalúa inquilinos de forma automática.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                title: "Predicción de impagos",
                desc: "El modelo analiza el historial financiero del inquilino y te avisa con antelación si hay riesgo de impago.",
                stat: "89% precisión",
              },
              {
                icon: "📸",
                title: "OCR de facturas",
                desc: "Sube una foto de cualquier factura y la IA extrae y registra automáticamente los datos en tu contabilidad.",
                stat: "Ahorra 3h/semana",
              },
              {
                icon: "⭐",
                title: "Scoring automático",
                desc: "Analiza nóminas, vida laboral y referencias para darte un score de confiabilidad de cada candidato.",
                stat: "Score en 2 minutos",
              },
            ].map((ai, i) => (
              <AnimatedSection key={ai.title} delay={i * 100}>
                <div className="p-6 rounded-2xl border h-full" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="text-3xl mb-4">{ai.icon}</div>
                  <div className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-4" style={{ color: "#09b850", backgroundColor: "rgba(9,184,80,0.1)" }}>
                    {ai.stat}
                  </div>
                  <h3 className="font-bold text-white mb-2">{ai.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{ai.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: "#09b850", backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}>
              Precios
            </span>
            <h2 className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight">
              Sin sorpresas. Sin permanencia.
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
              Empieza gratis, escala cuando lo necesites. Cancela en cualquier momento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <AnimatedSection key={plan.name} delay={i * 120}>
                <div
                  className={`relative p-8 rounded-2xl h-full ${plan.highlight ? "shadow-2xl scale-[1.03]" : "shadow-sm bg-white border border-gray-200"}`}
                  style={plan.highlight ? { backgroundColor: "#09b850" } : {}}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-900 bg-white px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
                      ⭐ Más popular
                    </div>
                  )}
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                  <p className={`text-sm mb-6 ${plan.highlight ? "text-green-100" : "text-gray-500"}`}>{plan.desc}</p>
                  <div className={`flex items-end gap-1 mb-8 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    <span className="text-5xl font-extrabold">€{plan.price}</span>
                    <span className={`text-sm pb-1.5 ${plan.highlight ? "text-green-100" : "text-gray-400"}`}>/mes</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? "text-green-50" : "text-gray-600"}`}>
                        <svg viewBox="0 0 16 16" fill="currentColor" className={`w-4 h-4 shrink-0 ${plan.highlight ? "text-white" : ""}`} style={!plan.highlight ? { color: "#09b850" } : {}}>
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/registro"
                    className={`block text-center font-semibold py-3 rounded-xl transition-all ${plan.highlight ? "bg-white hover:bg-green-50" : "text-white hover:opacity-90"}`}
                    style={plan.highlight ? { color: "#09b850" } : { backgroundColor: "#09b850" }}
                  >
                    {plan.cta}
                  </a>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="p-12 rounded-3xl border-2 relative overflow-hidden" style={{ borderColor: "#09b850", background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%)" }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: "#09b850" }} />
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4 relative">
                Empieza a gestionar mejor hoy
              </h2>
              <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto relative">
                Únete a más de 500 propietarios que ya ahorran horas cada semana con Rentyva. La primera propiedad es gratis, siempre.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
                <a href="/registro" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5" style={{ backgroundColor: "#09b850", boxShadow: "0 8px 24px rgba(9,184,80,0.3)" }}>
                  Crear cuenta gratis
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/></svg>
                </a>
                <span className="text-sm text-gray-400">Sin tarjeta de crédito · Sin permanencia</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 font-bold text-white mb-4">
                Rentyva
              </div>
              <p className="text-sm leading-relaxed">Plataforma SaaS de gestión integral de alquileres para el mercado español.</p>
            </div>
            {[
              {
                title: "Producto",
                links: ["Funcionalidades", "Precios", "Integraciones", "API"],
              },
              {
                title: "Empresa",
                links: ["Sobre nosotros", "Blog", "Casos de éxito", "Empleo"],
              },
              {
                title: "Legal",
                links: ["Privacidad", "Términos", "Cookies", "GDPR"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">© 2025 Rentyva. Todos los derechos reservados.</p>
            <p className="text-xs">Hecho con ❤️ en España 🇪🇸</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
