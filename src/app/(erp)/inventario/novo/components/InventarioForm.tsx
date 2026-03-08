"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  IniciarInventarioSchema,
  IniciarInventarioData,
} from "@/modules/inventario/schemas";
import { abrirInventario } from "@/modules/inventario/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  filiais: { id: string; nome: string }[];
  user: { id: string; name: string; role: string }[];
}

export function InventarioForm({ filiais, user }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IniciarInventarioData>({
    resolver: zodResolver(IniciarInventarioSchema),
    defaultValues: {
      filialId: "",
      responsavelId: "",
    },
  });

  const onSubmit = async (data: IniciarInventarioData) => {
    setIsSubmitting(true);
    setServerError(null);

    // Chama a action que tira o snapshot dos bens no banco de dados
    const result = await abrirInventario(data);

    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    } else if (result?.success && result.inventarioId) {
      // Se deu certo, redireciona direto para o painel de execução daquele inventário
      router.push(`/inventario/${result.inventarioId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-md flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p>{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="filialId">Filial a ser Auditada</Label>
          <Select
            onValueChange={(val) =>
              setValue("filialId", val, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade de negócio" />
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
          <p className="text-xs text-slate-500 mt-1">
            Ao iniciar, o sistema congelará uma lista com todos os ativos
            atualmente vinculados a esta filial.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsavelId">Auditor Responsável</Label>
          <Select
            onValueChange={(val) =>
              setValue("responsavelId", val, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o gestor em campo" />
            </SelectTrigger>
            <SelectContent>
              {user.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}{" "}
                  <span className="text-slate-400 text-xs">
                    ({user.role.replace("_", " ")})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.responsavelId && (
            <span className="text-xs text-red-500">
              {errors.responsavelId.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
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
          Gerar Snapshot e Iniciar
        </Button>
      </div>
    </form>
  );
}
