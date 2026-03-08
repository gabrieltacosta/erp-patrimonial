"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { FilialSchema, FilialFormData } from "@/modules/filiais/schemas";
import { criarFilial } from "@/modules/filiais/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type FormInput = z.input<typeof FilialSchema>;

// Agora recebemos apenas os dados da empresa do logado
export function FilialForm({
  empresaId,
  empresaNome,
}: {
  empresaId: string;
  empresaNome: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(FilialSchema),
    defaultValues: {
      isMatriz: false, // Forçado para false
      nome: "",
      empresaId: empresaId, // Preenchido nos bastidores
    },
  });

  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const result = await criarFilial(data as FilialFormData);

    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    } else {
      toast.success("Unidade cadastrada com sucesso!");
      router.push("/filiais"); // Redireciona de volta para a lista
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 bg-red-50 text-red-600 border rounded-md text-sm font-medium">
          {serverError}
        </div>
      )}

      <div className="space-y-4">
        {/* Mostramos a empresa atual de forma visual e bloqueada */}
        <div className="space-y-2">
          <Label>Empresa (Grupo Econômico)</Label>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border rounded-md text-slate-500 text-sm">
            <Building2 className="w-4 h-4" />
            <span>{empresaNome}</span>
          </div>
        </div>

        {/* O ÚNICO campo que o utilizador precisa preencher */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Filial / Unidade</Label>
          <Input
            id="nome"
            placeholder="Ex: Filial São Paulo - Sul"
            {...register("nome")}
          />
          {errors.nome && (
            <span className="text-xs text-red-500">{errors.nome.message}</span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline" type="button" onClick={() => router.back()}>
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
          Cadastrar Filial
        </Button>
      </div>
    </form>
  );
}
