import Link from "next/link";
import { Button } from "@/components/ui";

export default function InquilinoNotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-xl font-bold text-gray-900">Inquilino no encontrado</h1>
      <Link href="/dashboard/inquilinos" className="inline-block mt-6">
        <Button variant="secondary">Volver al listado</Button>
      </Link>
    </div>
  );
}
