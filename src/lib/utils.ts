import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EstablishmentData, AggregateStats } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('ar-OM').format(num);
}

export function formatCurrency(num: number) {
  return new Intl.NumberFormat('ar-OM', {
    style: 'currency',
    currency: 'OMR',
    maximumFractionDigits: 0,
  }).format(num);
}

export function calculateAggregates(data: EstablishmentData[], year: 'year2024' | 'year2025'): YearData {
  return data.reduce((acc, curr) => ({
    patients: acc.patients + curr[year].patients,
    visits: acc.visits + curr[year].visits,
    procedures: acc.procedures + curr[year].procedures,
    cost: acc.cost + curr[year].cost,
  }), {
    patients: 0,
    visits: 0,
    procedures: 0,
    cost: 0,
  });
}

export function calculateGrowth(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
