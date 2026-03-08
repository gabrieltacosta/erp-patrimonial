"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { BemSchema, BemFormInput } from "@/modules/patrimonio/schemas";
import { criarBem } from "@/modules/patrimonio/actions";
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

interface BemFormProps {
  filiais: { id: string; nome: string }[];
}

export function BemForm({ filiais }: BemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BemFormInput>({
    resolver: zodResolver(BemSchema),
    defaultValues: {
      valorAquisicao: 0,
      valorResidual: 0,
      vidaUtilMeses: 60, // Padrão 5 anos
      filialId: filiais.length === 1 ? filiais[0].id : "", 
    },
  });

  const onSubmit = async (data: BemFormInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const dataParaEnviar = {
      ...data,
      valorAquisicao: Math.round(data.valorAquisicao * 100),
      valorResidual: Math.round(data.valorResidual * 100),
    };

    const result = await criarBem(dataParaEnviar);

    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    }
    // Se sucesso, a action fará o redirect automaticamente
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Bem / Descrição</Label>
          <Input
            id="nome"
            placeholder="Ex: Notebook Dell Latitude"
            {...register("nome")}
          />
          {errors.nome && (
            <span className="text-xs text-red-500">{errors.nome.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select onValueChange={(val) => setValue("categoria", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TI_EQUIPAMENTOS">
                Equipamentos de TI
              </SelectItem>
              <SelectItem value="MOVEIS_UTENSILIOS">
                Móveis e Utensílios
              </SelectItem>
              <SelectItem value="VEICULOS">Veículos</SelectItem>
              <SelectItem value="MAQUINAS">Máquinas e Motores</SelectItem>
            </SelectContent>
          </Select>
          {errors.categoria && (
            <span className="text-xs text-red-500">
              {errors.categoria.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="filialId">Filial de Destino</Label>
          <Select onValueChange={(val) => setValue("filialId", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a filial" />
            </SelectTrigger>
            <SelectContent>
              {filiais.map((filial) => (
                <SelectItem key={filial.id} value={filial.id}>
                  {filial.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.filialId && (
            <span className="text-xs text-red-500">
              {errors.filialId.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorAquisicao">Valor de Aquisição (R$)</Label>
          <Input
            id="valorAquisicao"
            type="number"
            step="0.01"
            {...register("valorAquisicao", { valueAsNumber: true })}
          />
          {errors.valorAquisicao && (
            <span className="text-xs text-red-500">
              {errors.valorAquisicao.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vidaUtilMeses">Vida Útil (Meses)</Label>
          <Input
            id="vidaUtilMeses"
            type="number"
            {...register("vidaUtilMeses", { valueAsNumber: true })}
          />
          {errors.vidaUtilMeses && (
            <span className="text-xs text-red-500">
              {errors.vidaUtilMeses.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valorResidual">Valor Residual (R$)</Label>
          <Input
            id="valorResidual"
            type="number"
            step="0.01"
            {...register("valorResidual", { valueAsNumber: true })}
          />
          {errors.valorResidual && (
            <span className="text-xs text-red-500">
              {errors.valorResidual.message}
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
          Salvar Patrimônio
        </Button>
      </div>
    </form>
  );
}
