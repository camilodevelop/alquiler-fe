"use client";

import { useEffect } from "react";
import { getTemplatesFromStore } from "@/modules/contratos/data/mock-store";

/** Asegura plantillas seed en localStorage al entrar al módulo contratos */
export function TemplatesBootstrap() {
  useEffect(() => {
    getTemplatesFromStore();
  }, []);
  return null;
}
