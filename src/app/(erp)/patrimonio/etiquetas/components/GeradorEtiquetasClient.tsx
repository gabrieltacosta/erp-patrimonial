"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { EtiquetaBem } from "@/components/patrimonio/EtiquetaBem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  bens: { id: string; numeroPatrimonio: string; nome: string }[];
}

export function GeradorEtiquetasClient({ bens }: Props) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Hook do react-to-print para lidar com o diálogo nativo
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Etiquetas_Patrimoniais_CorpAsset",
    onBeforePrint: async () => setIsPrinting(true),
    onAfterPrint: async () => setIsPrinting(false),
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border rounded-lg shadow-sm flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          Total de {bens.length} etiquetas prontas para geração.
        </span>
        <Button
          onClick={handlePrint}
          disabled={isPrinting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isPrinting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Printer className="w-4 h-4 mr-2" />
          )}
          Imprimir Etiquetas
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 bg-slate-100 min-h-screen">
          {/* Este div é o que será impresso. Ele usa classes print: específicas do Tailwind */}
          <div ref={componentRef} className="print:p-8 print:mt-10">
            {/* Layout de Grid: 2 colunas para A4 no navegador, ajustado para impressão */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 print:gap-4 print:grid-cols-2">
              {bens.map((bem) => (
                <div
                  key={bem.id}
                  className="flex items-center justify-center print:break-inside-avoid"
                >
                  <EtiquetaBem
                    id={bem.id}
                    numeroPatrimonio={bem.numeroPatrimonio}
                    nome={bem.nome}
                  />
                </div>
              ))}
            </div>

            {/* Rodapé visível apenas na impressão */}
            <div className="hidden print:block text-center mt-10 text-[10px] text-slate-400">
              Gerado por CorpAsset ERP em{" "}
              {new Date().toLocaleDateString("pt-BR")} - Confidencial.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
