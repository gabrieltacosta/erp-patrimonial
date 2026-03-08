"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { alternarStatusUsuarioAction } from "@/modules/usuarios/actions";
import { Loader2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

interface Props {
  usuarioId: string;
  ativoAtual: boolean;
  isSelf: boolean; // Para bloquear a ação no próprio utilizador
}

export function BotaoStatusUsuario({ usuarioId, ativoAtual, isSelf }: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    if (isSelf) return;

    setIsPending(true);
    const result = await alternarStatusUsuarioAction(usuarioId, ativoAtual);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        result.ativo ? "Utilizador reativado." : "Acesso revogado com sucesso.",
      );
    }
    setIsPending(false);
  };

  if (isSelf) {
    return <span className="text-xs text-slate-400 italic">Sua Conta</span>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
      className={
        ativoAtual
          ? "text-red-600 hover:text-red-800 hover:bg-red-50"
          : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
      }
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : ativoAtual ? (
        <PowerOff className="w-4 h-4 mr-1" />
      ) : (
        <Power className="w-4 h-4 mr-1" />
      )}
      {ativoAtual ? "Desativar" : "Reativar"}
    </Button>
  );
}
