import type { Metadata } from "next";
import { NuevaPasswordForm } from "./nueva-password-form";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function NuevaPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Nueva contraseña</h2>
        <p className="mt-2 text-gray-500">Elige una contraseña segura para tu cuenta</p>
      </div>
      <NuevaPasswordForm />
    </>
  );
}
