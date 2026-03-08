import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsuarioForm } from "./components/UsuarioForm";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function NovoUsuarioPage() {
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
  const filiais = await prisma.filial.findMany({
    where: filtroFiliais,
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
