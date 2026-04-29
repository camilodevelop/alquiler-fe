"use client";

import { useState } from "react";
import { User, Mail, Phone, Lock, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui";

export default function CuentaPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona tu información personal y credenciales</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-700 text-2xl font-bold">C</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center shadow hover:bg-brand-700 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Camilo Contreras</p>
            <p className="text-xs text-gray-500 mt-0.5">Propietario · Rentyva</p>
            <button className="mt-2 text-xs text-brand-600 hover:underline">
              Cambiar foto
            </button>
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">Datos personales</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                defaultValue="Camilo"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Apellidos</label>
            <input
              type="text"
              defaultValue="Contreras"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              defaultValue="camilo@rentyva.es"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Teléfono</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              defaultValue="+34 600 000 000"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {saved && (
            <span className="text-sm text-green-600 font-medium">Cambios guardados</span>
          )}
          <div className="ml-auto">
            <Button type="submit" variant="primary" size="md" className="gap-2">
              <Save size={15} />
              Guardar cambios
            </Button>
          </div>
        </div>
      </form>

      {/* Contraseña */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">Cambiar contraseña</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Contraseña actual</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nueva contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button variant="primary" size="md" className="gap-2">
            <Lock size={15} />
            Actualizar contraseña
          </Button>
        </div>
      </div>
    </div>
  );
}
