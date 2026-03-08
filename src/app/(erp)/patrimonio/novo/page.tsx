import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BemForm } from "./components/BemForm"; // Ajuste o caminho se necessário
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NovoBemPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userContext = session.user as any;
  let filtroFiliais = {};

  // LÓGICA DE ISOLAMENTO (Data Tenancy)
  if (userContext.role === "SUPER_ADMIN" || userContext.role === "ADMIN_MATRIZ") {
    // Administradores veem todas as filiais da SUA empresa
    filtroFiliais = { empresaId: userContext.empresaId };
  } else {
    // Gestores e Usuários veem apenas a sua própria filial
    filtroFiliais = { id: userContext.filialId };
  }

  // Busca as filiais aplicando o filtro de segurança
  const filiais = await prisma.filial.findMany({
    where: filtroFiliais,
    select: { id: true, nome: true },
    orderBy: { isMatriz: 'desc' } // Opcional: Coloca a Matriz no topo
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cadastrar Novo Bem</h2>
        <p className="text-slate-500">Registre um novo ativo patrimonial no sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Passa as filiais filtradas para o formulário */}
          <BemForm filiais={filiais} />
        </CardContent>
      </Card>
    </div>
  );
}