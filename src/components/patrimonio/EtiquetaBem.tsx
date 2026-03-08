"use client";

import { QRCodeSVG } from "qrcode.react";
import { Package } from "lucide-react";

interface EtiquetaBemProps {
  id: string; // ID do banco para o link
  numeroPatrimonio: string;
  nome: string;
}

export function EtiquetaBem({ id, numeroPatrimonio, nome }: EtiquetaBemProps) {
  // A URL que o QR code conterá. Ao escanear, abre direto na página do bem.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrCodeUrl = `${appUrl}/patrimonio/${id}`;

  return (
    // Estilos otimizados para impressão (largura/altura fixas, borders pretas)
    <div className="w-[8cm] h-[4cm] border border-black p-3 flex gap-3 items-center bg-white rounded-md print:shadow-none print:border-black overflow-hidden">
      {/* Coluna do QR Code */}
      <div className="flex flex-col items-center justify-center gap-1 border-r border-slate-200 pr-3 h-full">
        <QRCodeSVG
          value={qrCodeUrl}
          size={100}
          level="H" // High error correction, mais robusto para etiquetas gastas
          className="print:w-[2.5cm] print:h-[2.5cm]" // Ajuste exato para impressão
        />
        <span className="text-[9px] text-slate-500 font-mono mt-1 break-all">
          escaneie para detalhes
        </span>
      </div>

      {/* Coluna de Informações do Bem */}
      <div className="flex-1 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Package className="w-5 h-5 text-blue-700 flex-shrink-0" />
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">
            CorpAsset ERP
          </h1>
        </div>

        <div className="flex-1 pt-2">
          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">
            Número Patrimonial
          </p>
          <p className="text-sm font-black text-black font-mono leading-tight tabular-nums">
            {numeroPatrimonio}
          </p>

          <p className="text-[10px] text-slate-600 font-medium uppercase tracking-wider mt-1">
            Bem
          </p>
          <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
            {nome}
          </p>
        </div>
      </div>
    </div>
  );
}
