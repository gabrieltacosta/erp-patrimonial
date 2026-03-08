// lib/currency.ts
export function toCents(value: number): number {
  return Math.round(value * 100);
}

export function formatCentsToBRL(value: number | any): string {
  // Converte para Number (caso seja Decimal do Prisma) e divide por 100
  const amount = Number(value) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}
