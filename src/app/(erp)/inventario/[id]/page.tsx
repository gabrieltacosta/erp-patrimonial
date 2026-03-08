import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditoriaLista } from "./components/AuditoriaLista";
import { BotaoFinalizar } from "./components/BotaoFinalizar";
import { Building2, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ExecucaoInventarioPage({
  params,
}: {
  params: { id: string };
}) {
  const inventario = await prisma.inventario.findFirst({
    where: { id: params.id },
    include: {
      filial: true,
      items: {
        include: { bem: true },
        orderBy: { auditadoEm: "desc" },
      },
    },
  });


  if (!inventario) notFound();

  const isConcluido = inventario.status === "CONCLUIDO";

  // Cálculos de progresso
  const totalItens = inventario.items.length;
  const auditados = inventario.items.filter(
    (i) => i.observacao !== "Pendente de auditoria física",
  ).length;
  const divergencias = inventario.items.filter(
    (i) => i.statusEncontrado !== i.bem.status,
  ).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {isConcluido ? "Relatório de Inventário" : "Execução de Inventário"}
          </h2>
          <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
            <span className="flex items-center">
              <Building2 className="w-4 h-4 mr-1" /> {inventario.filial.nome}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" /> Iniciado em{" "}
              {format(new Date(inventario.dataInicio), "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        {!isConcluido && (
          <BotaoFinalizar
            inventarioId={inventario.id}
            podeFinalizar={auditados === totalItens}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Progresso da Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditados} / {totalItens}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Divergências Encontradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {divergencias}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-sm">
              {inventario.status.replace("_", " ")}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Ativos ({inventario.filial.nome})</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditoriaLista
            items={inventario.items}
            inventarioId={inventario.id}
            isConcluido={isConcluido}
          />
        </CardContent>
      </Card>
    </div>
  );
}
