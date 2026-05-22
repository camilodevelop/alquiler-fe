import { manitasNombreCompleto } from "../../utils/labels";
import type { Manitas } from "../../types";

export function ManitasAvatar({
  manitas,
  size = "md",
}: {
  manitas: Pick<Manitas, "nombres" | "apellidos" | "foto_url">;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const name = manitasNombreCompleto(manitas);
  const initial = manitas.nombres.charAt(0).toUpperCase();
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-16 w-16 text-lg",
    xl: "h-24 w-24 text-2xl",
  };

  if (manitas.foto_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={manitas.foto_url}
        alt={name}
        className={`${sizes[size]} shrink-0 rounded-xl object-cover border border-gray-200 bg-gray-100`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} shrink-0 rounded-xl flex items-center justify-center font-bold bg-violet-100 text-violet-800 border border-violet-200/80`}
    >
      {initial}
    </div>
  );
}
