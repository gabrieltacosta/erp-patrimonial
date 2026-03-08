import { Search, ShieldAlert } from "lucide-react";
import prisma from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DialogDetalhesAuditoria } from "./components/DialogDetalhesAuditoria";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuditoriaPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/login");

  const userContext = session.user;

  // Apenas admins teriam acesso a esta rota (gerido pelo middleware/proxy)
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      usuario: { empresaId: userContext.empresaId },
    },
    include: {
      usuario: { select: { name: true, email: true } },
    },
    orderBy: { data: "desc" },
    take: 100, // Limite para paginação/performance inicial
  });

  const getAcaoBadge = (acao: string) => {
    if (acao.includes("CREATE") || acao.includes("INICIAR")) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
          {acao}
        </Badge>
      );
    }
    if (acao.includes("DELETE") || acao.includes("BAIXA")) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">
          {acao}
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
        {acao}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-slate-700" />
            Logs de Auditoria
          </h2>
          <p className="text-slate-500">
            Registo imutável de todas as transações, modificações e acessos no
            ERP.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center gap-4 bg-slate-50/50 rounded-t-lg">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Filtrar por utilizador, entidade ou ação..."
              className="pl-8 bg-white"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data / Hora</TableHead>
              <TableHead>Utilizador (Ator)</TableHead>
              <TableHead>Ação Executada</TableHead>
              <TableHead>Módulo / Entidade</TableHead>
              <TableHead className="text-center">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhum evento registado até ao momento.
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                    {format(new Date(log.data), "dd MMM yyyy, HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {log.usuario?.name || "Sistema"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {log.usuario?.email || "Automático"}
                    </div>
                  </TableCell>
                  <TableCell>{getAcaoBadge(log.acao)}</TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-700">
                      {log.entidade}
                    </div>
                    <div
                      className="text-xs text-slate-400 font-mono truncate max-w-[120px]"
                      title={log.entidadeId}
                    >
                      ID: {log.entidadeId.split("-")[0]}...
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DialogDetalhesAuditoria log={log} />
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
