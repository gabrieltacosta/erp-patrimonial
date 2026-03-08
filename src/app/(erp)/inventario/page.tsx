import Link from "next/link";
import { Plus, Search, ClipboardList } from "lucide-react";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
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

export default async function InventarioListPage() {
  const inventarios = await prisma.inventario.findMany({
    include: {
      filial: { select: { nome: true } },
      _count: { select: { items: true } },
    },
    orderBy: { dataInicio: "desc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ABERTO":
        return "bg-blue-100 text-blue-800 border-none";
      case "EM_ANDAMENTO":
        return "bg-amber-100 text-amber-800 border-none";
      case "CONCLUIDO":
        return "bg-emerald-100 text-emerald-800 border-none";
      default:
        return "bg-slate-100 text-slate-800 border-none";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Auditoria & Inventário
          </h2>
          <p className="text-slate-500">
            Controle de conferência física do patrimônio por filial.
          </p>
        </div>
        <Link href="/inventario/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Iniciar Inventário
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data Início</TableHead>
              <TableHead>Filial Auditada</TableHead>
              <TableHead>Itens Esperados</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventarios.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhum inventário registrado.
                </TableCell>
              </TableRow>
            ) : (
              inventarios.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {format(new Date(inv.dataInicio), "dd MMM yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{inv.filial.nome}</TableCell>
                  <TableCell>{inv._count.items} ativos</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(inv.status)}
                    >
                      {inv.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/inventario/${inv.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <ClipboardList className="w-4 h-4 mr-2" />
                        {inv.status === "CONCLUIDO"
                          ? "Ver Relatório"
                          : "Executar Auditoria"}
                      </Button>
                    </Link>
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
