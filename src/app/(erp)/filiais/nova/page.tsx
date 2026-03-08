import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilialForm } from "./components/FilialForm";
import prisma from "@/lib/db";

export default async function NovaFilialPage() {
  // Busca as empresas cadastradas para o select
  const empresas = await prisma.empresa.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Nova Filial
        </h2>
        <p className="text-slate-500">
          Expanda a estrutura organizacional da empresa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <FilialForm empresas={empresas} />
        </CardContent>
      </Card>
    </div>
  );
}
