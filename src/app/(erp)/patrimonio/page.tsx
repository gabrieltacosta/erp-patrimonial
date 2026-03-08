import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, QrCode, Printer } from "lucide-react";
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
import { formatCentsToBRL } from "@/lib/currency";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { canWrite, getTenantFilter } from "@/lib/permissions";

export const dynamic = "force-dynamic"; // Garante dados sempre frescos

export default async function PatrimonioPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/login");

  const user = session.user;

  const filtroSeguranca = getTenantFilter(user);

  // Busca os bens com o relacionamento da filial
  const bens = await prisma.bem.findMany({
    where: filtroSeguranca,
    include: { filial: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
    take: 50, // Limite para paginação inicial
  });

  const temPermissaoEscrita = canWrite(user.role);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Controle Patrimonial
          </h2>
          <p className="text-slate-500">
            Gerencie todos os ativos corporativos registrados.
          </p>
        </div>

        {/* Container flex para agrupar os botões */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {bens.length > 0 && (
            <Link href="/patrimonio/etiquetas" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
              >
                <Printer className="w-4 h-4 mr-2" />
                Gerar Etiquetas
              </Button>
            </Link>
          )}

          {temPermissaoEscrita && (
            <Link href="/patrimonio/novo" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Bem
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar por número ou nome..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="icon" title="Escanear QR Code">
            <QrCode className="h-4 w-4 text-slate-600" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Patrimônio</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bens.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhum bem registrado. Clique em "Adicionar Bem" para começar.
                </TableCell>
              </TableRow>
            ) : (
              bens.map((bem) => (
                <TableRow key={bem.id}>
                  <TableCell className="font-medium text-blue-600 hover:underline">
                    <Link href={`/patrimonio/${bem.id}`}>
                      {bem.numeroPatrimonio}
                    </Link>
                  </TableCell>
                  <TableCell>{bem.nome}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {bem.categoria.replace("_", " ")}
                  </TableCell>
                  <TableCell>{bem.filial.nome}</TableCell>
                  <TableCell className="text-right font-medium text-slate-700">
                    {formatCentsToBRL(bem.valorAquisicao)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={bem.status === "ATIVO" ? "default" : "secondary"}
                      className={
                        bem.status === "ATIVO"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none"
                          : ""
                      }
                    >
                      {bem.status}
                    </Badge>
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
