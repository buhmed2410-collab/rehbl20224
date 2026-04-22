export interface EstablishmentData {
  name: string;
  year2024: YearData;
  year2025: YearData;
}

export interface YearData {
  patients: number;
  visits: number;
  procedures: number;
  cost: number;
}

export interface AggregateStats {
  totalPatients: number;
  totalVisits: number;
  totalProcedures: number;
  totalCost: number;
}
