import Link from "next/link";
import { Plus, Search, Building2, Users, Package } from "lucide-react";
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
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FiliaisPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/login");

  const userContext = session.user;
  let filtroFiliais = {};

  if (
    userContext.role === "SUPER_ADMIN" ||
    userContext.role === "ADMIN_MATRIZ"
  ) {
    filtroFiliais = { empresaId: userContext.empresaId };
  } else {
    filtroFiliais = { id: userContext.filialId };
  }

  // Busca filiais com a contagem de relações (Métrica valiosa para o Admin)
  const filiais = await prisma.filial.findMany({
    where: filtroFiliais,
    include: {
      empresa: { select: { nome: true } },
      _count: {
        select: { bens: true, usuarios: true },
      },
    },
    orderBy: [
      { empresa: { nome: "asc" } },
      { isMatriz: "desc" }, // Matriz aparece primeiro
      { nome: "asc" },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Estrutura de Filiais
          </h2>
          <p className="text-slate-500">
            Gestão das unidades físicas, sedes e alocação de recursos.
          </p>
        </div>
        <Link href="/filiais/nova">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Filial
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Buscar unidade..."
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidade / Filial</TableHead>
              <TableHead>Empresa (Grupo)</TableHead>
              <TableHead className="text-center">Ativos Alocados</TableHead>
              <TableHead className="text-center">Operadores</TableHead>
              <TableHead className="text-right">Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filiais.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhuma unidade cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              filiais.map((filial) => (
                <TableRow key={filial.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center border ${filial.isMatriz ? "bg-blue-50 border-blue-200" : "bg-slate-50"}`}
                      >
                        <Building2
                          className={`w-4 h-4 ${filial.isMatriz ? "text-blue-600" : "text-slate-500"}`}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {filial.nome}
                          {filial.isMatriz && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 text-[10px] h-5 border-none"
                            >
                              MATRIZ
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          ID: {filial.id.split("-")[0]}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {filial.empresa.nome}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                      <Package className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {filial._count.bens}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                      <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {filial._count.usuarios}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {format(new Date(filial.createdAt), "dd/MM/yyyy")}
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
