import { STORAGE_BUCKET } from "../constants";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const UPLOAD_TIMEOUT_MS = 45_000;

export function getFileExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && MIME_BY_EXT[fromName]) return fromName === "jpeg" ? "jpg" : fromName;

  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";

  return "jpg";
}

export function getContentType(file: File, ext: string): string {
  if (file.type && file.type.startsWith("image/")) return file.type;
  return MIME_BY_EXT[ext] ?? "image/jpeg";
}

export function buildFotoStoragePath(
  userId: string,
  propiedadId: string,
  ext: string,
): string {
  return `${userId}/${propiedadId}/principal.${ext}`;
}

export function buildPublicFotoUrl(supabaseUrl: string, path: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

export function mapStorageError(message: string): string {
  if (message === "UPLOAD_TIMEOUT") {
    return "La subida tardó demasiado. Comprueba SUPABASE_SERVICE_ROLE_KEY en .env.local y que el proyecto Supabase esté activo.";
  }
  if (message.includes("Invalid API key") || message.includes("JWT")) {
    return "Clave de Supabase incorrecta. Revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.";
  }
  if (message.includes("mime") || message.includes("not allowed")) {
    return "Formato no permitido. Usa JPG, PNG o WebP.";
  }
  if (message.includes("row-level security") || message.includes("policy")) {
    return "Sin permiso para subir la imagen. Ejecuta el script 03_fix_storage_policies.sql en Supabase.";
  }
  if (message.includes("Bucket not found")) {
    return 'El bucket "propiedades" no existe. Ejecuta el script SQL de Storage en Supabase.';
  }
  return message || "No se pudo subir la imagen";
}

/** Evita que la UI quede en loading si Storage o la red no responden. */
export function withTimeout<T>(promise: Promise<T>, ms = UPLOAD_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err: unknown) => {
        clearTimeout(timer);
        reject(err instanceof Error ? err : new Error(String(err)));
      });
  });
}
