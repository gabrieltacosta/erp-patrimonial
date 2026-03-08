import { Calculator, TrendingDown, DollarSign } from "lucide-react";
import prisma from "@/lib/db";
import { formatCentsToBRL } from "@/lib/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { getTenantFilter } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function DepreciacaoPage() {
  // MOCK: Sessão do usuário (substitua pela sua lógica de auth)
  const session = { user: { role: "SUPER_ADMIN", filialId: null } };
  const filtroSeguranca = getTenantFilter(session.user);

  // Busca todos os bens ativos com os seus respetivos dados de depreciação
  const bens = await prisma.bem.findMany({
    where: {
      ...filtroSeguranca,
      status: { not: "BAIXADO" },
    },
    include: {
      depreciacao: true,
      filial: { select: { nome: true } },
    },
    orderBy: { dataAquisicao: "asc" },
  });

  // Cálculos para os KPIs (Cards) do topo da página
  let totalAquisicao = 0;
  let totalDepreciado = 0;

  const dadosProcessados = bens.map((bem) => {
    const valorAquisicao = bem.valorAquisicao;
    const valorResidual = bem.valorResidual;
    const valorDepreciado = bem.depreciacao?.valorDepreciado || 0;

    // Valor Contábil Atual (O que o bem vale hoje nos livros da empresa)
    const valorContabil = valorAquisicao - valorDepreciado;

    // Calcula a percentagem depreciada para a barra de progresso
    const maxDepreciavel = valorAquisicao - valorResidual;
    let percentualDepreciado = 0;

    if (maxDepreciavel > 0) {
      percentualDepreciado = Math.min(
        (valorDepreciado / maxDepreciavel) * 100,
        100,
      );
    }

    // Somatórios para os KPIs
    totalAquisicao += valorAquisicao;
    totalDepreciado += valorDepreciado;

    return {
      ...bem,
      valorContabil,
      percentualDepreciado,
    };
  });

  const totalValorContabil = totalAquisicao - totalDepreciado;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Controle de Depreciação
        </h2>
        <p className="text-slate-500">
          Acompanhamento contábil e desgaste financeiro do patrimônio.
        </p>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Valor de Aquisição (Base)
            </CardTitle>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCentsToBRL(totalAquisicao)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">
              Depreciação Acumulada
            </CardTitle>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{formatCentsToBRL(totalDepreciado)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Valor Contábil Atual
            </CardTitle>
            <Calculator className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {formatCentsToBRL(totalValorContabil)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <div className="bg-white border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ativo</TableHead>
              <TableHead>Filial</TableHead>
              <TableHead className="text-right">V. Aquisição</TableHead>
              <TableHead className="text-right">V. Residual</TableHead>
              <TableHead className="w-[200px]">
                Progresso da Depreciação
              </TableHead>
              <TableHead className="text-right">V. Contábil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dadosProcessados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  Nenhum ativo disponível para cálculo contábil.
                </TableCell>
              </TableRow>
            ) : (
              dadosProcessados.map((bem) => (
                <TableRow key={bem.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {bem.numeroPatrimonio}
                    </div>
                    <div className="text-xs text-slate-500">{bem.nome}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {bem.filial.nome}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCentsToBRL(bem.valorAquisicao)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-slate-500">
                    {formatCentsToBRL(bem.valorResidual)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <Progress
                        value={bem.percentualDepreciado}
                        className="h-2"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>
                          {formatCentsToBRL(
                            bem.depreciacao?.valorDepreciado || 0,
                          )}
                        </span>
                        <span>{bem.percentualDepreciado.toFixed(1)}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-700">
                    {formatCentsToBRL(bem.valorContabil)}
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
