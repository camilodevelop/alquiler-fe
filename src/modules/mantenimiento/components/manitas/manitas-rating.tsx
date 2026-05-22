"use client";

import { Star } from "lucide-react";

export function ManitasRatingDisplay({
  value,
  size = 16,
}: {
  value: number;
  size?: number;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="inline-flex items-center gap-0.5" title={`${value.toFixed(1)} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rounded);
        const half = !filled && i + 0.5 === rounded;
        return (
          <Star
            key={i}
            size={size}
            className={
              filled
                ? "text-amber-400 fill-amber-400"
                : half
                  ? "text-amber-400 fill-amber-200"
                  : "text-gray-200 fill-gray-100"
            }
          />
        );
      })}
      <span className="ml-1 text-sm font-semibold text-gray-700 tabular-nums">
        {value > 0 ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

export function ManitasRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 rounded hover:scale-110 transition-transform"
          aria-label={`${n} estrellas`}
        >
          <Star
            size={28}
            className={
              n <= value ? "text-amber-400 fill-amber-400" : "text-gray-300 hover:text-amber-200"
            }
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500">{value}/5</span>
    </div>
  );
}
