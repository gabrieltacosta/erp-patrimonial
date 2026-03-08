"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { UsuarioSchema, UsuarioFormData } from "@/modules/usuarios/schemas";
import { criarUsuarioAction } from "@/modules/usuarios/actions";
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
  filiais: { id: string; nome: string }[];
}

export function UsuarioForm({ filiais }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(UsuarioSchema),
    defaultValues: { role: "USUARIO", filialId: "" },
  });

  // Observa a Role para desabilitar/esconder a filial se for Super Admin
  const currentRole = useWatch({ control, name: "role" });
  const isSuperAdmin = currentRole === "SUPER_ADMIN";

  const onSubmit = async (data: UsuarioFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    // Limpa a filial se for Super Admin antes de enviar
    if (data.role === "SUPER_ADMIN") data.filialId = "";

    const result = await criarUsuarioAction(data);
    if (result?.error) {
      setServerError(result.error);
      setIsSubmitting(false);
    }
    if (result?.success) {
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
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            placeholder="Ex: João da Silva"
            {...register("nome")}
          />
          {errors.nome && (
            <span className="text-xs text-red-500">{errors.nome.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail Corporativo</Label>
          <Input
            id="email"
            type="email"
            placeholder="joao@empresa.com"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha Temporária</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <span className="text-xs text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Nível de Acesso (Role)</Label>
          <Select
            defaultValue="USUARIO"
            onValueChange={(val: any) => setValue("role", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o papel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUPER_ADMIN">
                Super Administrador (TI/Dono)
              </SelectItem>
              <SelectItem value="ADMIN_MATRIZ">
                Administrador da Matriz
              </SelectItem>
              <SelectItem value="GESTOR_FILIAL">Gestor de Filial</SelectItem>
              <SelectItem value="USUARIO">Usuário Padrão (Leitura)</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <span className="text-xs text-red-500">{errors.role.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="filialId">Atribuição de Filial</Label>
          <Select
            disabled={isSuperAdmin}
            onValueChange={(val) => setValue("filialId", val)}
          >
            <SelectTrigger
              className={isSuperAdmin ? "bg-slate-100 opacity-50" : ""}
            >
              <SelectValue
                placeholder={
                  isSuperAdmin ? "Acesso Global" : "Selecione a filial"
                }
              />
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
          Salvar Usuário
        </Button>
      </div>
    </form>
  );
}
