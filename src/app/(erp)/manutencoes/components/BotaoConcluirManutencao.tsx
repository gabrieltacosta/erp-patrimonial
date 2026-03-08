"use client";

import { useState } from "react";
import { concluirManutencao } from "@/modules/manutencao/actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

interface BotaoConcluirManutencaoProps {
  manutencaoId: string;
  bemId: string;
}

export function BotaoConcluirManutencao({
  manutencaoId,
  bemId,
}: BotaoConcluirManutencaoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConcluir = async () => {
    // Confirmação de segurança para evitar cliques acidentais
    const confirmar = window.confirm(
      "Tem a certeza de que deseja concluir esta manutenção? O ativo voltará ao estado 'ATIVO' e ficará disponível para operação.",
    );

    if (!confirmar) return;

    setIsSubmitting(true);

    // Chama a Server Action que fará a transação no banco de dados
    const result = await concluirManutencao(manutencaoId, bemId);

    // Se a Server Action retornar um erro, destrava o botão e mostra o alerta
    if (result?.error) {
      alert(result.error);
      setIsSubmitting(false);
    }
    // Nota: Se houver sucesso, não precisamos de alterar o 'isSubmitting' para false,
    // pois a action executa um revalidatePath que irá reconstruir a linha da tabela com o novo estado.
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleConcluir}
      disabled={isSubmitting}
      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
      title="Marcar serviço como concluído"
    >
      {isSubmitting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CheckCircle2 className="w-4 h-4 mr-2" />
      )}
      Concluir
    </Button>
  );
}
