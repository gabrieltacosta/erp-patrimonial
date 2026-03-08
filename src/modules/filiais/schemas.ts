import { z } from "zod";

export const FilialSchema = z.object({
  nome: z.string().min(3, "O nome da filial deve ter pelo menos 3 caracteres."),
  empresaId: z.uuid("Selecione a empresa a qual esta filial pertence."),
  isMatriz: z.boolean().default(false),
});

export type FilialFormData = z.infer<typeof FilialSchema>;
