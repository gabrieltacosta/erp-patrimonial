"use client";

import { useState } from "react";
import { finalizarInventario } from "@/modules/inventario/actions";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface BotaoFinalizarProps {
  inventarioId: string;
  podeFinalizar: boolean;
}

export function BotaoFinalizar({
  inventarioId,
  podeFinalizar,
}: BotaoFinalizarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalizar = async () => {
    // Dupla checagem de segurança
    if (!podeFinalizar) return;

    // Confirmação crítica de negócio
    const confirmar = window.confirm(
      "Atenção: Ao finalizar, este inventário será congelado. O relatório de auditoria será gerado e nenhuma nova alteração poderá ser feita. Deseja prosseguir?",
    );

    if (!confirmar) return;

    setIsSubmitting(true);

    const result = await finalizarInventario(inventarioId);

    // Se a Server Action retornar um erro (ex: falha no banco), destrava o botão
    if (result?.error) {
      alert(result.error);
      setIsSubmitting(false);
    }
    // Se houver sucesso, a action faz o redirect e o componente será desmontado.
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleFinalizar}
        disabled={!podeFinalizar || isSubmitting}
        className={
          podeFinalizar ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
        }
        variant={podeFinalizar ? "default" : "secondary"}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mr-2" />
        )}
        Finalizar Inventário
      </Button>

      {!podeFinalizar && (
        <span className="text-xs text-amber-600 font-medium">
          Audite todos os itens para liberar a finalização.
        </span>
      )}
    </div>
  );
}
