import Image from "next/image";
import { Building2 } from "lucide-react";

interface PropiedadFotoProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  iconSize?: number;
}

/** Imagen de propiedad (Storage Supabase); unoptimized evita fallos del optimizador de Next. */
export function PropiedadFoto({
  src,
  alt,
  className = "object-cover",
  sizes = "100vw",
  priority = false,
  iconSize = 16,
}: PropiedadFotoProps) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-400 bg-gray-100">
        <Building2 size={iconSize} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
    />
  );
}
