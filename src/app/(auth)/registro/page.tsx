import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Crea tu cuenta</h2>
      <p className="text-sm text-gray-500 mb-8">Empieza gratis, sin tarjeta de crédito</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-brand-600 hover:underline font-medium">
          Inicia sesión
        </a>
      </p>
    </>
  );
}
