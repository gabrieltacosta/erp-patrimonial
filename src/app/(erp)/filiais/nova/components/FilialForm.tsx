"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod"; // <-- Importamos o zod aqui
import { FilialSchema, FilialFormData } from "@/modules/filiais/schemas";
import { criarFilial } from "@/modules/filiais/actions";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// 1. Extraímos o tipo de ENTRADA do Zod (onde o isMatriz é opcional devido ao .default())
type FormInput = z.input<typeof FilialSchema>;

export function FilialForm({ empresas }: { empresas: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // 2. Passamos o FormInput para o useForm. O erro de compatibilidade desaparece!
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(FilialSchema),
    defaultValues: { isMatriz: false, nome: "", empresaId: "" },
  });

  const isMatrizValue = watch("isMatriz");

  // 3. Recebemos o FormInput na submissão
  const onSubmit = async (data: FormInput) => {
    setIsSubmitting(true);
    setServerError(null);
    
    // O Zod já fez a validação e nós garantimos os defaults. 
    // Podemos fazer o cast seguro (as FilialFormData) para a Server Action
    const result = await criarFilial(data as FilialFormData);
    
    if (result?.error) {
      setServerError(result.error);
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

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="empresaId">Empresa (Grupo Econômico)</Label>
          <Select onValueChange={(val) => setValue("empresaId", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a empresa mãe" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.empresaId && (
            <span className="text-xs text-red-500">
              {errors.empresaId.message}
            </span>
          )}
        </div>

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

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="isMatriz"
            checked={isMatrizValue}
            onCheckedChange={(checked) =>
              setValue("isMatriz", !!checked, { shouldValidate: true })
            }
          />
          <Label
            htmlFor="isMatriz"
            className="text-sm font-normal cursor-pointer"
          >
            Definir esta unidade como a Matriz (Sede Principal)
          </Label>
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
          Cadastrar Filial
        </Button>
      </div>
    </form>
  );
}