"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Props {
  log: {
    id: string;
    acao: string;
    entidade: string;
    dadosAntes: any;
    dadosDepois: any;
  };
}

export function DialogDetalhesAuditoria({ log }: Props) {
  // Função auxiliar para formatar o JSON de forma legível
  const formatarJSON = (dados: any) => {
    if (!dados) return "Nenhum dado registado.";
    return JSON.stringify(dados, null, 2);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver Detalhes</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Detalhes do Evento de Auditoria
          </DialogTitle>
          <DialogDescription>
            ID do Registo: <span className="font-mono text-xs">{log.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="bg-slate-100 p-2 rounded-md text-sm font-semibold text-slate-700">
              Ação: {log.acao}
            </div>
            <div className="bg-slate-100 p-2 rounded-md text-sm font-semibold text-slate-700">
              Entidade: {log.entidade}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloco: Dados Antes (Estado Anterior) */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                Estado Anterior
              </h4>
              <pre className="bg-slate-950 text-slate-300 p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {formatarJSON(log.dadosAntes)}
              </pre>
            </div>

            {/* Bloco: Dados Depois (Novo Estado) */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Novo Estado
              </h4>
              <pre className="bg-slate-950 text-emerald-300 p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {formatarJSON(log.dadosDepois)}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
