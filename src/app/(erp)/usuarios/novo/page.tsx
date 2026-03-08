import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsuarioForm } from "./components/UsuarioForm";
import prisma from "@/lib/db";

export default async function NovoUsuarioPage() {
  const filiais = await prisma.filial.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Novo Usuário
        </h2>
        <p className="text-slate-500">
          Cadastre um novo operador ou administrador no sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credenciais e Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <UsuarioForm filiais={filiais} />
        </CardContent>
      </Card>
    </div>
  );
}
