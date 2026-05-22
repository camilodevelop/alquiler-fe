/** Orden alfabético por título (español, sin distinguir mayúsculas) */
export function sortPropiedadesByTitulo<T extends { titulo: string }>(items: T[]): T[] {
  return [...items].sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" }),
  );
}
