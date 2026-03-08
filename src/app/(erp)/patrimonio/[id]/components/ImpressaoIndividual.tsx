"use client";

import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { EtiquetaBem } from "@/components/patrimonio/EtiquetaBem";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";

interface Props {
  bem: {
    id: string;
    numeroPatrimonio: string;
    nome: string;
  };
}

export function ImpressaoIndividual({ bem }: Props) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Etiqueta_${bem.numeroPatrimonio}`,
    onBeforePrint: async () => setIsPrinting(true),
    onAfterPrint: async () => setIsPrinting(false),
  });

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 border rounded-xl">
      <div className="text-sm font-medium text-slate-500 mb-2">
        Pré-visualização da Etiqueta
      </div>

      {/* Área que será impressa */}
      <div
        ref={componentRef}
        className="print:p-10 bg-white shadow-sm print:shadow-none"
      >
        <EtiquetaBem
          id={bem.id}
          numeroPatrimonio={bem.numeroPatrimonio}
          nome={bem.nome}
        />
      </div>

      <Button
        onClick={handlePrint}
        disabled={isPrinting}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
      >
        {isPrinting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Printer className="w-4 h-4 mr-2" />
        )}
        Imprimir Esta Etiqueta
      </Button>
    </div>
  );
}
