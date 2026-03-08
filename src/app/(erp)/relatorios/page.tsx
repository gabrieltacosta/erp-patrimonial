import { FileSpreadsheet, HardDrive, Wrench } from "lucide-react";
import { CardRelatorio } from "./components/CardRelatorio";
import {
  obterRelatorioGeralBens,
  obterRelatorioManutencoes,
} from "@/modules/relatorios/actions";

export const dynamic = "force-dynamic";

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Relatórios e Exportação
        </h2>
        <p className="text-slate-500">
          Exporte dados consolidados para análise financeira e auditoria
          (formato CSV/Excel).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Posição Geral */}
        <CardRelatorio
          titulo="Posição Geral do Patrimônio"
          descricao="Exporta todos os ativos registados no sistema, incluindo valores de aquisição e filiais alocadas."
          icone={<HardDrive className="w-8 h-8 text-blue-600" />}
          nomeArquivo="Relatorio_Posicao_Patrimonial"
          // Passamos a server action como prop para ser executada no clique
          serverAction={obterRelatorioGeralBens}
        />

        {/* Card 2: Histórico de Custos/Manutenções */}
        <CardRelatorio
          titulo="Custos de Manutenção"
          descricao="Relatório completo de ordens de serviço, preventivas e corretivas, com os respetivos custos operacionais."
          icone={<Wrench className="w-8 h-8 text-amber-600" />}
          nomeArquivo="Relatorio_Custos_Manutencao"
          serverAction={obterRelatorioManutencoes}
        />

        {/* Você pode expandir com mais cards facilmente (Ex: Depreciação, Inventário, etc) */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 text-center bg-slate-50">
          <FileSpreadsheet className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-sm font-medium">
            Novos relatórios customizados podem ser adicionados aqui.
          </span>
        </div>
      </div>
    </div>
  );
}
