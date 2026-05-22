"use client";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export const inputClassName =
  "w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 disabled:bg-gray-50 disabled:text-gray-500";

export const selectClassName =
  "w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 disabled:bg-gray-50";

export const textareaClassName =
  "w-full min-h-[120px] px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white resize-y transition-shadow placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400";

export function FormField({ label, error, required, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-800">
        {label}
        {required ? <span className="text-red-500 ml-0.5" aria-hidden>*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 font-medium" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-500 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}
