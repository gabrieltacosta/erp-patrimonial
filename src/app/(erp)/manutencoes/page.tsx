import Link from "next/link";
import { Plus, Search, Wrench } from "lucide-react";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCentsToBRL } from "@/lib/currency";
import { BotaoConcluirManutencao } from "./components/BotaoConcluirManutencao";

export const dynamic = "force-dynamic";

export default async function ManutencoesPage() {
  const manutencoes = await prisma.manutencao.findMany({
    include: {
      bem: {
        select: {
          numeroPatrimonio: true,
          nome: true,
          filial: { select: { nome: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Manutenções
          </h2>
          <p className="text-slate-500">
            Acompanhamento e histórico de serviços em ativos.
          </p>
        </div>
        <Link href="/manutencoes/nova">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Manutenção
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manutencoes.map((manut) => (
              <TableRow key={manut.id}>
                <TableCell className="text-slate-500 whitespace-nowrap">
                  {format(new Date(manut.data), "dd MMM yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900">
                    {manut.bem.numeroPatrimonio}
                  </div>
                  <div className="text-xs text-slate-500">{manut.bem.nome}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      manut.tipo === "PREVENTIVA"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }
                  >
                    {manut.tipo}
                  </Badge>
                  <div
                    className="text-xs text-slate-500 mt-1 max-w-[200px] truncate"
                    title={manut.descricao}
                  >
                    {manut.descricao}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-slate-700">
                  {formatCentsToBRL(manut.custo)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      manut.status === "CONCLUIDA"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-800"
                    }
                  >
                    {manut.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {manut.status === "EM_ANDAMENTO" && (
                    <BotaoConcluirManutencao
                      manutencaoId={manut.id}
                      bemId={manut.bemId}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
