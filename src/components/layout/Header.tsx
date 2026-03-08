"use client";

import { signOut } from "@/lib/auth-client";
import { ROLE_LABELS } from "@/lib/constants";
import { Building2, Loader2, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function Header({
  userName,
  filialNome,
  role,
}: {
  userName: string;
  filialNome: string;
  role: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center text-sm font-medium text-slate-600">
        <Building2 className="w-4 h-4 mr-2 text-slate-400" />
        {filialNome}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm">
          <div className="flex flex-col items-end mr-2">
            <div className="font-medium text-slate-700">{userName}</div>
            <div className="text-xs text-slate-700">
              {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border">
            <User className="w-4 h-4 text-slate-600" />
          </div>
        </div>

        <button
          onClick={() => {
            /* Ação de logout do better-auth aqui */
            signOut({
              fetchOptions: {
                onSuccess: () => {
                  toast.success("Logout realizado com sucesso!");
                  router.push("/login");
                },
                onRequest: () => {
                  setIsLoading(true);
                },
                onError: () => {
                  setIsLoading(false);
                  toast.error("Erro ao realizar logout. Tente novamente.");
                },
              },
            });
          }}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          title="Sair do sistema"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}
