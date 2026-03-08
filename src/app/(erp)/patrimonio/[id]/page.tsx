import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { formatCentsToBRL } from "@/lib/currency";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Calendar, DollarSign, Activity } from "lucide-react";
import { ImpressaoIndividual } from "./components/ImpressaoIndividual";

export const dynamic = "force-dynamic";

export default async function DetalhesBemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params
  const bem = await prisma.bem.findUnique({
    where: { id:  id },
    include: {
      filial: { select: { nome: true } },
      depreciacao: true,
    },
  });

  if (!bem) notFound();

  const valorContabil =
    bem.valorAquisicao - (bem.depreciacao?.valorDepreciado || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {bem.nome}
            </h2>
            <Badge
              variant="outline"
              className={
                bem.status === "ATIVO"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }
            >
              {bem.status}
            </Badge>
          </div>
          <p className="text-slate-500 font-mono text-sm">
            {bem.numeroPatrimonio}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Dados do Bem (Ocupa 2/3 do espaço) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-500" />
                Ficha Técnica
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Categoria</p>
                <p className="font-medium text-slate-900">
                  {bem.categoria.replace("_", " ")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Estado de Conservação</p>
                <p className="font-medium text-slate-900">
                  {bem.estadoConservacao}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Localização Atual
                </p>
                <p className="font-medium text-slate-900">{bem.filial.nome}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Data de Aquisição
                </p>
                <p className="font-medium text-slate-900">
                  {format(
                    new Date(bem.dataAquisicao),
                    "dd 'de' MMMM 'de' yyyy",
                    { locale: ptBR },
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-500" />
                Dados Contábeis
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Valor de Aquisição</p>
                <p className="font-medium text-slate-900">
                  {formatCentsToBRL(bem.valorAquisicao)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Depreciação Acumulada</p>
                <p className="font-medium text-red-600">
                  -{formatCentsToBRL(bem.depreciacao?.valorDepreciado || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Valor Contábil Atual</p>
                <p className="font-bold text-emerald-700">
                  {formatCentsToBRL(valorContabil)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita: Ações e Etiqueta (Ocupa 1/3 do espaço) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-500" />
                Identificação Física
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* O nosso novo componente entra aqui */}
              <ImpressaoIndividual
                bem={{
                  id: bem.id,
                  numeroPatrimonio: bem.numeroPatrimonio,
                  nome: bem.nome,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
