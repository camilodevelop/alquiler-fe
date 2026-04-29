"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}

export function AnimatedSection({
  children,
  className = "",
  style,
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Aplicar delay via setTimeout para stagger entre cards hermanas
          const timer = setTimeout(() => {
            el.classList.add("in-view");
          }, delay);
          observer.unobserve(el);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`animate-enter ${className}`} style={style}>
      {children}
    </div>
  );
}
