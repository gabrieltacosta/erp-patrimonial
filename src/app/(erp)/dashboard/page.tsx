import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Wrench, TrendingDown, DollarSign } from "lucide-react";
import prisma from "@/lib/db";
import { DashboardCharts } from "./components/DashboardCharts";
import { formatCentsToBRL } from "@/lib/currency";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { canWrite, getTenantFilter } from "@/lib/permissions";


// Força a página a ser dinâmica, já que é um dashboard em tempo real
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const filtroSeguranca = getTenantFilter(session.user)



  // 1. Buscas Paralelas no Banco (Com segurança aplicada em TODAS as queries)
  const [
    totalBens,
    agregadoValor,
    bensManutencao,
    bensDepreciados,
    bensPorCategoriaRaw,
    bensPorFilialRaw,
  ] = await Promise.all([
    // A) Total de Bens
    prisma.bem.count({
      where: { ...filtroSeguranca, status: { not: "BAIXADO" } },
    }),

    // B) Valor Patrimonial
    prisma.bem.aggregate({
      _sum: { valorAquisicao: true },
      where: { ...filtroSeguranca, status: { not: "BAIXADO" } },
    }),

    // C) Em Manutenção
    prisma.bem.count({
      where: { ...filtroSeguranca, status: "EM_MANUTENCAO" },
    }),

    // D) Bens Depreciados (Aplica-se o filtro na relação com o 'bem')
    prisma.depreciacao.count({
      where: {
        valorDepreciado: { gt: 0 },
        bem: filtroSeguranca, // Injeção inteligente do Prisma!
      },
    }),

    // E) Gráfico de Categorias
    prisma.bem.groupBy({
      by: ["categoria"],
      _count: { id: true },
      where: { ...filtroSeguranca, status: { not: "BAIXADO" } },
    }),

    // F) Gráfico de Filiais
    prisma.bem.findMany({
      select: { filial: { select: { nome: true } } },
      where: { ...filtroSeguranca, status: { not: "BAIXADO" } },
    }),
  ]);

  // Transformando dados para o Recharts
  const dataCategorias = bensPorCategoriaRaw.map((item) => ({
    name: item.categoria,
    value: item._count.id,
  }));

  // Agrupando filiais via JavaScript
  const contagemFiliais = bensPorFilialRaw.reduce(
    (acc, curr) => {
      const nome = curr.filial.nome;
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const dataFiliais = Object.entries(contagemFiliais).map(([name, value]) => ({
    name,
    value,
  }));

  const isAdmin = canWrite(session.user.role)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Visão Geral
        </h2>
        <p className="text-slate-500">
          {isAdmin
            ? "Resumo patrimonial de todas as filiais."
            : "Resumo patrimonial da sua filial."}
        </p>
      </div>

      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Bens Ativos
            </CardTitle>
            <Package className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalBens}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Valor Patrimonial Total
            </CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCentsToBRL(agregadoValor._sum.valorAquisicao || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Em Manutenção
            </CardTitle>
            <Wrench className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {bensManutencao}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Bens Depreciados
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {bensDepreciados}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Interativos (Client Component) */}
      <DashboardCharts
        dataCategorias={dataCategorias}
        dataFiliais={dataFiliais}
      />
    </div>
  );
}
