import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MovimentacaoForm } from "./components/MovimentacaoForm";
import prisma from "@/lib/db";

export default async function NovaMovimentacaoPage() {
  // Buscamos apenas os bens que não estão baixados para poderem ser movimentados
  const [bens, filiais] = await Promise.all([
    prisma.bem.findMany({
      where: { status: { not: "BAIXADO" } },
      select: { id: true, numeroPatrimonio: true, nome: true },
      orderBy: { numeroPatrimonio: "asc" },
    }),
    prisma.filial.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Nova Movimentação
        </h2>
        <p className="text-slate-500">
          Transfira ativos entre filiais ou altere o seu estado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Operação</CardTitle>
        </CardHeader>
        <CardContent>
          <MovimentacaoForm bens={bens} filiais={filiais} />
        </CardContent>
      </Card>
    </div>
  );
}
