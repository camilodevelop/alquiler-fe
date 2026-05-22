import Link from "next/link";
import { Button } from "@/components/ui";

export default function PropiedadNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-xl font-bold text-gray-900">Propiedad no encontrada</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        No existe o no tienes permiso para verla.
      </p>
      <Link href="/dashboard/propiedades" className="mt-6">
        <Button variant="primary">Volver al listado</Button>
      </Link>
    </div>
  );
}
