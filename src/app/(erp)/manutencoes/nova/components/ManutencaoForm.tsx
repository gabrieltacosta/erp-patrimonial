"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  ManutencaoSchema,
  ManutencaoFormData,
} from "@/modules/manutencao/schemas";
import { registrarManutencao } from "@/modules/manutencao/actions";
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

export function ManutencaoForm({ bens }: { bens: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ManutencaoFormData>({
    resolver: zodResolver(ManutencaoSchema),
    defaultValues: {
        tipo: "PREVENTIVA", 
        custo: 0,
        data: new Date()
    }
    
  });

  const onSubmit = async (data: ManutencaoFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const dataParaEnviar = {
        ...data,
        custo: Math.round(data.custo * 100),
      };

      const result = await registrarManutencao(dataParaEnviar);
      if (result?.error) {
        setServerError(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      setServerError("Erro inesperado ao salvar.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 bg-red-50 text-red-600 border rounded-md text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bemId">Ativo Patrimonial</Label>
          <Select onValueChange={(val) => setValue("bemId", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o bem" />
            </SelectTrigger>
            <SelectContent>
              {bens.map((bem) => (
                <SelectItem key={bem.id} value={bem.id}>
                  {bem.numeroPatrimonio} - {bem.nome} ({bem.filial.nome})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bemId && (
            <span className="text-xs text-red-500">{errors.bemId.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Manutenção</Label>
          <Select
            defaultValue="PREVENTIVA"
            onValueChange={(val: any) => setValue("tipo", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PREVENTIVA">Preventiva (Agendada)</SelectItem>
              <SelectItem value="CORRETIVA">Corretiva (Reparo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data">Data do Serviço</Label>
          <Input id="data" type="date" {...register("data")} />
          {errors.data && (
            <span className="text-xs text-red-500">{errors.data.message}</span>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descricao">Descrição do Serviço</Label>
          <Input
            id="descricao"
            placeholder="Ex: Troca de memória RAM e limpeza..."
            {...register("descricao")}
          />
          {errors.descricao && (
            <span className="text-xs text-red-500">
              {errors.descricao.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="custo">Custo Estimado/Real (R$)</Label>
          <Input
            id="custo"
            type="number"
            step="0.01"
            {...register("custo", { valueAsNumber: true })}
          />
          {errors.custo && (
            <span className="text-xs text-red-500">{errors.custo.message}</span>
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
          ) : null}{" "}
          Salvar Ordem
        </Button>
      </div>
    </form>
  );
}
