"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  MovimentacaoSchema,
  MovimentacaoFormData,
} from "@/modules/movimentacao/schemas";
import { registarMovimentacao } from "@/modules/movimentacao/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Props {
  bens: { id: string; numeroPatrimonio: string; nome: string }[];
  filiais: { id: string; nome: string }[];
}

export function MovimentacaoForm({ bens, filiais }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MovimentacaoFormData>({
    resolver: zodResolver(MovimentacaoSchema),
    defaultValues: { tipo: "TRANSFERENCIA" },
  });

  const onSubmit = async (data: MovimentacaoFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    const result = await registarMovimentacao(data);

    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bemId">Ativo Patrimonial (Bem)</Label>
          <Select onValueChange={(val) => setValue("bemId", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o património a movimentar" />
            </SelectTrigger>
            <SelectContent>
              {bens.map((bem) => (
                <SelectItem key={bem.id} value={bem.id}>
                  {bem.numeroPatrimonio} - {bem.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bemId && (
            <span className="text-xs text-red-500">{errors.bemId.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Movimentação</Label>
          <Select
            defaultValue="TRANSFERENCIA"
            onValueChange={(val: any) => setValue("tipo", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRANSFERENCIA">
                Transferência entre Filiais
              </SelectItem>
              <SelectItem value="MANUTENCAO">Envio para Manutenção</SelectItem>
              <SelectItem value="BAIXA">
                Baixa Patrimonial (Perda/Roubo)
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo && (
            <span className="text-xs text-red-500">{errors.tipo.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="filialDestinoId">Filial de Destino</Label>
          <Select onValueChange={(val) => setValue("filialDestinoId", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Para onde vai o bem?" />
            </SelectTrigger>
            <SelectContent>
              {filiais.map((filial) => (
                <SelectItem key={filial.id} value={filial.id}>
                  {filial.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.filialDestinoId && (
            <span className="text-xs text-red-500">
              {errors.filialDestinoId.message}
            </span>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacao">Observações (Opcional)</Label>
          <Input
            id="observacao"
            placeholder="Motivo da transferência ou detalhes..."
            {...register("observacao")}
          />
          {errors.observacao && (
            <span className="text-xs text-red-500">
              {errors.observacao.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button
          variant="outline"
          type="button"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Registar Movimentação
        </Button>
      </div>
    </form>
  );
}
