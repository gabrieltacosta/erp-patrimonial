import { z } from "zod";

export const UsuarioSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.email("Formato de e-mail inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  role: z.enum(
    ["SUPER_ADMIN", "ADMIN_MATRIZ", "GESTOR_FILIAL", "USUARIO"],
    "O nível de acesso é obrigatório.",
  ),
  // filialId é opcional no schema base porque o Super Admin pode não ter filial específica
  filialId: z
    .uuid("Selecione uma filial válida.")
    .min(1, "Selecione uma filial"),
});

export type UsuarioFormData = z.infer<typeof UsuarioSchema>;
