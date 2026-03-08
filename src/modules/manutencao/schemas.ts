import { z } from "zod";

export const ManutencaoSchema = z.object({
  bemId: z.uuid("Selecione o bem que passará por manutenção."),
  tipo: z.enum(["PREVENTIVA", "CORRETIVA"], "Selecione o tipo."),
  descricao: z.string().min(5, "Descreva o serviço a ser realizado."),

  // O utilizador digita R$ 150.50, o Zod converte para 15050 cêntimos
  custo: z.number().int().nonnegative("O custo não pode ser negativo."),
  data: z.date("A data da manutenção é obrigatória."),
});

export type ManutencaoFormData = z.infer<typeof ManutencaoSchema>;
