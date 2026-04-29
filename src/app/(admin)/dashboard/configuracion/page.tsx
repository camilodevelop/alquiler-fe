"use client";

import { useState } from "react";
import { Bell, Globe, Shield, CreditCard, Save, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-brand-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
          <Icon size={16} className="text-brand-600" />
        </div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function ConfiguracionPage() {
  const [notifs, setNotifs] = useState({
    pagos: true,
    tickets: true,
    contratos: false,
    mensajes: true,
    resumen: false,
  });

  const [prefs, setPrefs] = useState({
    idioma: "es",
    moneda: "EUR",
    formatoFecha: "dd/mm/yyyy",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Personaliza tu experiencia en Rentyva</p>
      </div>

      {/* Notificaciones */}
      <Section icon={Bell} title="Notificaciones">
        <div className="space-y-4 divide-y divide-gray-50">
          <ToggleRow
            label="Pagos recibidos"
            description="Alerta cuando un inquilino realiza un pago"
            checked={notifs.pagos}
            onChange={(v) => setNotifs((p) => ({ ...p, pagos: v }))}
          />
          <div className="pt-4">
            <ToggleRow
              label="Nuevos tickets de mantenimiento"
              description="Aviso cuando se crea un nuevo ticket"
              checked={notifs.tickets}
              onChange={(v) => setNotifs((p) => ({ ...p, tickets: v }))}
            />
          </div>
          <div className="pt-4">
            <ToggleRow
              label="Vencimiento de contratos"
              description="Recordatorio 30 días antes del fin de contrato"
              checked={notifs.contratos}
              onChange={(v) => setNotifs((p) => ({ ...p, contratos: v }))}
            />
          </div>
          <div className="pt-4">
            <ToggleRow
              label="Mensajes nuevos"
              description="Notificación de nuevos mensajes en el chat"
              checked={notifs.mensajes}
              onChange={(v) => setNotifs((p) => ({ ...p, mensajes: v }))}
            />
          </div>
          <div className="pt-4">
            <ToggleRow
              label="Resumen semanal"
              description="Email con el resumen de actividad cada lunes"
              checked={notifs.resumen}
              onChange={(v) => setNotifs((p) => ({ ...p, resumen: v }))}
            />
          </div>
        </div>
      </Section>

      {/* Preferencias regionales */}
      <Section icon={Globe} title="Idioma y región">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Idioma</label>
            <select
              value={prefs.idioma}
              onChange={(e) => setPrefs((p) => ({ ...p, idioma: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 bg-white"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="ca">Català</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Moneda</label>
            <select
              value={prefs.moneda}
              onChange={(e) => setPrefs((p) => ({ ...p, moneda: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 bg-white"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Formato fecha</label>
            <select
              value={prefs.formatoFecha}
              onChange={(e) => setPrefs((p) => ({ ...p, formatoFecha: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 bg-white"
            >
              <option value="dd/mm/yyyy">DD/MM/AAAA</option>
              <option value="mm/dd/yyyy">MM/DD/AAAA</option>
              <option value="yyyy-mm-dd">AAAA-MM-DD</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Seguridad */}
      <Section icon={Shield} title="Seguridad">
        <div className="space-y-3">
          {[
            { label: "Cambiar contraseña", href: "/dashboard/cuenta" },
            { label: "Autenticación en dos pasos (2FA)", href: "#" },
            { label: "Sesiones activas", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{item.label}</span>
              <ChevronRight size={15} className="text-gray-400 group-hover:text-gray-600" />
            </a>
          ))}
        </div>
      </Section>

      {/* Plan */}
      <Section icon={CreditCard} title="Plan y facturación">
        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50 border border-brand-100">
          <div>
            <p className="text-sm font-semibold text-brand-800">Plan Starter</p>
            <p className="text-xs text-brand-600 mt-0.5">Hasta 10 propiedades · €29/mes</p>
          </div>
          <Button variant="primary" size="sm">
            Mejorar plan
          </Button>
        </div>
        <a
          href="#"
          className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <span className="text-sm text-gray-700 group-hover:text-gray-900">Ver historial de facturas</span>
          <ChevronRight size={15} className="text-gray-400 group-hover:text-gray-600" />
        </a>
      </Section>

      {/* Guardar */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-green-600 font-medium">Configuración guardada</span>
        )}
        <Button variant="primary" size="md" className="gap-2" onClick={handleSave}>
          <Save size={15} />
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}
