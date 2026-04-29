import * as React from "react";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
}

export function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>{children}</div>;
}
