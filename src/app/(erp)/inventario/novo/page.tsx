import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventarioForm } from "./components/InventarioForm";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NovoInventarioPage() {
  // Buscamos filiais e usuários para popular os selects do formulário
  const [filiais, user] = await Promise.all([
    prisma.filial.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN_MATRIZ", "GESTOR_FILIAL"] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Iniciar Inventário
        </h2>
        <p className="text-slate-500">
          Abra uma nova auditoria física para conferência de ativos em uma
          filial.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração da Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <InventarioForm filiais={filiais} user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
