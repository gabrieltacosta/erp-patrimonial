import Link from "next/link";
import { ArrowRightLeft, Plus, Search } from "lucide-react";
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

export const dynamic = "force-dynamic";

export default async function MovimentacoesPage() {
  // Busca o histórico ordenado pelos mais recentes
  const movimentacoes = await prisma.movimentacao.findMany({
    include: {
      bem: { select: { numeroPatrimonio: true, nome: true } },
      filialOrigem: { select: { nome: true } },
      filialDestino: { select: { nome: true } },
      usuario: { select: { name: true } },
    },
    orderBy: { data: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Movimentações
          </h2>
          <p className="text-slate-500">
            Histórico de transferências e alterações de estado dos ativos.
          </p>
        </div>
        <Link href="/movimentacoes/nova">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar no histórico..."
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origem → Destino</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhuma movimentação registada no sistema.
                </TableCell>
              </TableRow>
            ) : (
              movimentacoes.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="text-slate-500 whitespace-nowrap">
                    {format(new Date(mov.data), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {mov.bem.numeroPatrimonio}
                    </div>
                    <div className="text-xs text-slate-500">{mov.bem.nome}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-700"
                    >
                      {mov.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <span
                        className="text-slate-500 truncate max-w-[120px]"
                        title={mov.filialOrigem?.nome || "N/A"}
                      >
                        {mov.filialOrigem?.nome || "N/A"}
                      </span>
                      <ArrowRightLeft className="w-3 h-3 mx-2 text-slate-400 flex-shrink-0" />
                      <span
                        className="font-medium text-slate-900 truncate max-w-[120px]"
                        title={mov.filialDestino?.nome || "N/A"}
                      >
                        {mov.filialDestino?.nome || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {mov.usuario?.name || "Sistema"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
