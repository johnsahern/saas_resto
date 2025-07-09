import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'XOF') {
  // Les montants sont déjà en unités entières, pas besoin de multiplier
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}