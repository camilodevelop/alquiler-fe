import type { Contract, ContractStatus } from "../types";

export interface ContractsStats {
  total: number;
  activos: number;
  pendiente_firma: number;
  borrador: number;
  finalizados: number;
}

export function computeContractsStats(contracts: Contract[]): ContractsStats {
  const count = (s: ContractStatus) => contracts.filter((c) => c.estado === s).length;
  return {
    total: contracts.length,
    activos: count("activo"),
    pendiente_firma: count("pendiente_firma"),
    borrador: count("borrador"),
    finalizados: count("finalizado"),
  };
}
