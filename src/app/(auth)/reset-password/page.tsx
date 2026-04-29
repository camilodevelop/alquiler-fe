import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ResetPasswordPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Recupera tu contraseña</h2>
      <p className="text-sm text-gray-500 mb-8">
        Te enviaremos un enlace para restablecerla
      </p>
      <ResetPasswordForm />
      <p className="mt-6 text-center text-sm text-gray-500">
        <a href="/login" className="text-brand-600 hover:underline font-medium">
          Volver al inicio de sesión
        </a>
      </p>
    </>
  );
}
