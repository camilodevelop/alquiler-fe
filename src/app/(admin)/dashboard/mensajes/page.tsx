"use client";

import { useState } from "react";
import { Send, Building2 } from "lucide-react";

type Participante = "propietario" | "inquilino";

interface MensajeMock {
  id: string;
  autor: Participante;
  texto: string;
  hora: string;
}

interface ConversacionMock {
  id: string;
  nombre: string;
  rol: string;
  propiedad: string;
  ultimo_mensaje: string;
  hora: string;
  no_leidos: number;
  mensajes: MensajeMock[];
}

const CONVERSACIONES: ConversacionMock[] = [
  {
    id: "1",
    nombre: "Roberto Fernández",
    rol: "Propietario",
    propiedad: "Calle Mayor 12, 3ºA",
    ultimo_mensaje: "¿Cómo van las reparaciones del baño?",
    hora: "10:30",
    no_leidos: 2,
    mensajes: [
      {
        id: "m1",
        autor: "propietario",
        texto: "Buenos días, quería confirmar el pago de abril.",
        hora: "09:15",
      },
      {
        id: "m2",
        autor: "inquilino",
        texto: "Hola Roberto, lo haré hoy mismo por transferencia.",
        hora: "09:42",
      },
      {
        id: "m3",
        autor: "propietario",
        texto: "Perfecto, gracias. ¿Cómo van las reparaciones del baño?",
        hora: "10:30",
      },
    ],
  },
  {
    id: "2",
    nombre: "Gestión Alquileres SL",
    rol: "Gestor",
    propiedad: "Av. Diagonal 88, 2ºB",
    ultimo_mensaje: "Te enviamos el nuevo contrato para revisar",
    hora: "Ayer",
    no_leidos: 0,
    mensajes: [
      {
        id: "m4",
        autor: "propietario",
        texto: "Hola, hemos preparado la renovación del contrato.",
        hora: "Ayer 14:00",
      },
      {
        id: "m5",
        autor: "inquilino",
        texto: "Gracias, lo reviso esta tarde.",
        hora: "Ayer 16:22",
      },
      {
        id: "m6",
        autor: "propietario",
        texto: "Te enviamos el nuevo contrato para revisar por correo.",
        hora: "Ayer 17:05",
      },
    ],
  },
  {
    id: "3",
    nombre: "Soporte Rentyva",
    rol: "Soporte",
    propiedad: "—",
    ultimo_mensaje: "¿En qué podemos ayudarte?",
    hora: "Lun",
    no_leidos: 0,
    mensajes: [
      {
        id: "m7",
        autor: "propietario",
        texto: "Bienvenido a Rentyva. Estamos aquí para ayudarte.",
        hora: "Lun 09:00",
      },
      {
        id: "m8",
        autor: "inquilino",
        texto: "Hola, tengo una duda sobre los documentos.",
        hora: "Lun 11:30",
      },
      {
        id: "m9",
        autor: "propietario",
        texto: "Claro, ¿en qué podemos ayudarte?",
        hora: "Lun 11:35",
      },
    ],
  },
];

export default function MensajesPage() {
  const [convActiva, setConvActiva] = useState(CONVERSACIONES[0]);
  const [mensaje, setMensaje] = useState("");

  const handleEnviar = () => {
    if (!mensaje.trim()) return;
    // En producción aquí iría la mutación a Supabase realtime
    setMensaje("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Comunicación con tu propietario o gestor
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex h-[600px]">
          {/* Lista conversaciones */}
          <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Conversaciones
              </p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {CONVERSACIONES.map((conv) => {
                const initial = conv.nombre.charAt(0).toUpperCase();
                const isActive = conv.id === convActiva.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setConvActiva(conv)}
                    className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors ${
                      isActive ? "bg-green-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-brand-700">
                          {initial}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isActive ? "text-green-700" : "text-gray-900"
                            }`}
                          >
                            {conv.nombre}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                            {conv.hora}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.ultimo_mensaje}
                        </p>
                      </div>
                      {conv.no_leidos > 0 && (
                        <span className="w-5 h-5 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.no_leidos}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Área de chat */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header del chat */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-brand-700">
                  {convActiva.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {convActiva.nombre}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {convActiva.propiedad !== "—" && (
                    <>
                      <Building2 size={11} className="text-gray-400" />
                      <span>{convActiva.propiedad}</span>
                    </>
                  )}
                  {convActiva.propiedad === "—" && (
                    <span>{convActiva.rol}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {convActiva.mensajes.map((msg) => {
                const esMio = msg.autor === "inquilino";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${esMio ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        esMio
                          ? "bg-brand-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.texto}</p>
                      <p
                        className={`text-xs mt-1 ${
                          esMio ? "text-green-100" : "text-gray-400"
                        }`}
                      >
                        {msg.hora}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input mensaje */}
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleEnviar();
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-400"
                />
                <button
                  onClick={handleEnviar}
                  disabled={!mensaje.trim()}
                  className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
