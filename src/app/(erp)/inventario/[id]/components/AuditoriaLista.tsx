"use client";

import { useState } from "react";
import { registrarAuditoriaItem } from "@/modules/inventario/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function AuditoriaLista({ items, inventarioId, isConcluido }: any) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (bemId: string, novoStatus: string) => {
    setLoadingId(bemId);
    await registrarAuditoriaItem({
      inventarioId,
      bemId,
      statusEncontrado: novoStatus as any,
      observacao:
        novoStatus !== items.find((i: any) => i.bemId === bemId)?.bem.status
          ? "Divergência reportada na auditoria física"
          : "Conferido físico OK",
    });
    setLoadingId(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patrimônio</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead>Status no Sistema</TableHead>
            <TableHead>Status Encontrado (Físico)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: any) => {
            const hasDivergence = item.statusEncontrado !== item.bem.status;
            const isAuditado =
              item.observacao !== "Pendente de auditoria física";

            return (
              <TableRow
                key={item.bemId}
                className={hasDivergence ? "bg-red-50" : ""}
              >
                <TableCell className="font-medium">
                  {item.bem.numeroPatrimonio}
                </TableCell>
                <TableCell>{item.bem.nome}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-slate-100">
                    {item.bem.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isConcluido ? (
                    <div className="flex items-center gap-2">
                      {hasDivergence ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      <span
                        className={
                          hasDivergence ? "text-amber-700 font-medium" : ""
                        }
                      >
                        {item.statusEncontrado}
                      </span>
                    </div>
                  ) : (
                    <Select
                      defaultValue={item.statusEncontrado}
                      onValueChange={(val) =>
                        handleUpdateStatus(item.bemId, val)
                      }
                      disabled={loadingId === item.bemId}
                    >
                      <SelectTrigger
                        className={`w-[180px] ${isAuditado ? "border-emerald-300 bg-emerald-50" : ""}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVO">Físico OK (Ativo)</SelectItem>
                        <SelectItem value="EM_MANUTENCAO">
                          Enviado para Manutenção
                        </SelectItem>
                        <SelectItem value="BAIXADO">
                          Ausente / Sucata
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
