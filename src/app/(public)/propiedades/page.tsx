import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Propiedades en alquiler",
  description: "Explora propiedades disponibles para alquilar.",
};

export default function PropiedadesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Propiedades disponibles</h1>
      <p className="mt-2 text-gray-500">Próximamente...</p>
    </main>
  );
}
