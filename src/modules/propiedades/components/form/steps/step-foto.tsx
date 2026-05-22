"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Upload, X } from "lucide-react";

interface StepFotoProps {
  previewUrl: string | null;
  existingUrl?: string | null;
  onFileSelect: (file: File | null) => void;
}

const MAX_MB = 5;

export function StepFoto({ previewUrl, existingUrl, onFileSelect }: StepFotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const displayUrl = previewUrl ?? existingUrl ?? null;

  const handleFile = (file: File | null) => {
    setFileError(null);
    if (!file) {
      onFileSelect(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFileError("Solo se permiten imágenes JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFileError(`La imagen no puede superar ${MAX_MB} MB.`);
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0] ?? null);
        }}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 ${
          dragOver
            ? "border-brand-500 bg-brand-50/80 scale-[1.01]"
            : displayUrl
              ? "border-gray-200 bg-gray-50"
              : "border-gray-200 bg-gradient-to-b from-gray-50 to-white hover:border-brand-300 hover:bg-brand-50/30"
        }`}
      >
        {displayUrl ? (
          <div className="relative aspect-[16/9] max-h-80 w-full sm:max-h-96">
            <Image
              src={displayUrl}
              alt="Vista previa de la propiedad"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                {previewUrl ? "Nueva imagen" : "Imagen actual"}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow hover:bg-white transition-colors"
                >
                  <Upload size={14} />
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleFile(null);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/95 p-2 text-gray-600 hover:text-red-600 shadow transition-colors"
                  aria-label="Quitar imagen"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full py-16 sm:py-20 gap-4 text-gray-500 hover:text-brand-700 transition-colors"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm text-brand-600">
              <ImagePlus size={32} strokeWidth={1.5} />
            </span>
            <span className="text-center px-4">
              <span className="block text-sm font-semibold text-gray-800">
                Arrastra una imagen o haz clic para subir
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                JPG, PNG o WebP · máximo {MAX_MB} MB
              </span>
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {fileError ? (
        <p className="text-xs text-red-600 font-medium" role="alert">
          {fileError}
        </p>
      ) : (
        <p className="text-xs text-gray-500 leading-relaxed">
          La foto es opcional al crear. Si no subes ninguna, podrás añadirla después desde editar.
        </p>
      )}
    </div>
  );
}
