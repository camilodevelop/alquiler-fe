import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo</h2>
        <p className="mt-2 text-gray-500">Inicia sesión en tu cuenta Rentyva</p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{" "}
        <a href="/registro" className="text-brand-600 hover:underline font-semibold">
          Regístrate gratis
        </a>
      </p>
    </>
  );
}
