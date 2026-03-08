import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ManutencaoForm } from "./components/ManutencaoForm";
import prisma from "@/lib/db";

export default async function NovaManutencaoPage() {
  // Buscamos apenas bens ativos que podem ir para manutenção
  const bens = await prisma.bem.findMany({
    where: { status: "ATIVO" },
    select: {
      id: true,
      numeroPatrimonio: true,
      nome: true,
      filial: { select: { nome: true } },
    },
    orderBy: { numeroPatrimonio: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Agendar Manutenção
        </h2>
        <p className="text-slate-500">
          Registe serviços preventivos ou corretivos do patrimônio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordem de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ManutencaoForm bens={bens} />
        </CardContent>
      </Card>
    </div>
  );
}
