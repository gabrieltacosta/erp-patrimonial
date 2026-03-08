import Link from "next/link";
import { Plus, Search, Shield, User as UserIcon } from "lucide-react";
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
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTenantFilter } from "@/lib/permissions";
import { BotaoStatusUsuario } from "./components/BoataoStatusUsuario";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userContext = session.user as any;

  // Se for "USUARIO" comum, nem deve aceder a esta página
  if (userContext.role === "USUARIO") {
    redirect("/dashboard");
  }

  // Filtro de isolamento (Tenant/Filial)
  const filtroSeguranca = getTenantFilter(userContext);

  // Busca utilizadores aplicando o filtro
  const usuarios = await prisma.user.findMany({
    where: {
      // Se for Gestor, o getTenantFilter já retornou { filialId: ... }
      // Se for Super Admin, retornou { filial: { empresaId: ... } }
      ...filtroSeguranca,
    },
    include: { filial: { select: { nome: true } } },
    orderBy: { role: "asc" },
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-none">
            Super Admin
          </Badge>
        );
      case "ADMIN_MATRIZ":
        return (
          <Badge className="bg-green-100 text-green-800 border-none">
            Admin
          </Badge>
        );
      case "GESTOR_FILIAL":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-none">
            Gestor
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-800 border-none">
            Usuário
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-slate-700" />
            Controlo de Acessos
          </h2>
          <p className="text-slate-500">
            Faça a gestão dos utilizadores e das suas permissões.
          </p>
        </div>

        <Link href="/usuarios/novo">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Utilizador
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Procurar por nome ou email..."
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilizador</TableHead>
              <TableHead>Permissão (Role)</TableHead>
              <TableHead>Unidade / Filial</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-slate-600">
                  {user.filial?.nome || "Sem Filial"}
                </TableCell>
                <TableCell>
                  {user.ativo ? (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-none">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <BotaoStatusUsuario
                    usuarioId={user.id}
                    ativoAtual={user.ativo}
                    isSelf={user.id === userContext.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
