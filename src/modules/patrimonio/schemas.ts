import { toCents } from "@/lib/currency";
import { z } from "zod";

export const BemSchema = z.object({
  nome: z.string().min(3, "Nome muito curto"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  valorAquisicao: z.number().positive("Valor deve ser maior que zero"),
  vidaUtilMeses: z.number().int().positive("Vida útil deve ser em meses"),
  valorResidual: z.number().nonnegative("Valor residual não pode ser negativo"),
  filialId: z.uuid("Selecione uma filial válida"),
});

// Este tipo é o que o formulário usa (Input: antes do transform)
export type BemFormInput = z.input<typeof BemSchema>;

// Este tipo é o que a Action recebe (Output: depois do transform)
export type BemFormOutput = z.output<typeof BemSchema>;
