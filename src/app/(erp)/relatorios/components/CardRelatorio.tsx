"use client";

import { useState } from "react";
import { exportarParaCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";

interface CardRelatorioProps {
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  nomeArquivo: string;
  serverAction: () => Promise<any[]>;
}

export function CardRelatorio({
  titulo,
  descricao,
  icone,
  nomeArquivo,
  serverAction,
}: CardRelatorioProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. Vai ao servidor buscar os dados de forma assíncrona
      const dados = await serverAction();

      // 2. Converte e força o download no navegador
      exportarParaCSV(dados, nomeArquivo);
    } catch (error) {
      console.error("Erro na exportação:", error);
      alert("Falha ao gerar o relatório. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="p-3 bg-slate-50 rounded-lg border">{icone}</div>
        <div>
          <CardTitle className="text-lg text-slate-800">{titulo}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-slate-500 leading-relaxed">{descricao}</p>
      </CardContent>

      <CardFooter className="pt-4 border-t bg-slate-50/50 rounded-b-xl">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 shadow-sm"
          variant="outline"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-600" />
          ) : (
            <Download className="w-4 h-4 mr-2 text-blue-600" />
          )}
          {isExporting ? "Gerando Ficheiro..." : "Exportar para CSV (Excel)"}
        </Button>
      </CardFooter>
    </Card>
  );
}
