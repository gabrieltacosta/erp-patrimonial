"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Wrench,
  ClipboardCheck,
  ShieldAlert,
  BarChart3,
  Users,
  Building2,
} from "lucide-react";

const rotas = [
  { nome: "Dashboard", path: "/dashboard", icone: LayoutDashboard },
  { nome: "Patrimônio", path: "/patrimonio", icone: Package },
  { nome: "Movimentações", path: "/movimentacoes", icone: ArrowRightLeft },
  { nome: "Inventário", path: "/inventario", icone: ClipboardCheck },
  { nome: "Manutenções", path: "/manutencoes", icone: Wrench },
  { nome: "Relatórios", path: "/relatorios", icone: BarChart3 },
];

const rotasAdmin = [
  { nome: "Usuários", path: "/usuarios", icone: Users },
  { nome: "Filiais", path: "/filiais", icone: Building2 },
  { nome: "Auditoria", path: "/auditoria", icone: ShieldAlert },
];

export function Sidebar({
  role = "USUARIO",
  empresaNome,
}: {
  role?: string;
  empresaNome: string;
}) {
  const pathname = usePathname();

  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN_MATRIZ";

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Package className="w-6 h-6 text-blue-500 mr-2" />
        <span className="text-white font-bold text-lg tracking-tight">
          {empresaNome}
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
          Módulos
        </div>
        <ul className="space-y-1 px-2">
          {rotas.map((rota) => {
            const isActive = pathname.startsWith(rota.path);
            return (
              <li key={rota.path}>
                <Link
                  href={rota.path}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                    isActive
                      ? "bg-blue-600 text-white font-medium"
                      : "hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <rota.icone
                    className={cn(
                      "w-4 h-4 mr-3",
                      isActive ? "text-white" : "text-slate-400",
                    )}
                  />
                  {rota.nome}
                </Link>
              </li>
            );
          })}
        </ul>

        {isAdmin && (
          <>
            <div className="px-4 mt-8 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Administração
            </div>
            <ul className="space-y-1 px-2">
              {rotasAdmin.map((rota) => {
                const isActive = pathname.startsWith(rota.path);
                return (
                  <li key={rota.path}>
                    <Link
                      href={rota.path}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                        isActive
                          ? "bg-blue-600 text-white font-medium"
                          : "hover:bg-slate-800 hover:text-white",
                      )}
                    >
                      <rota.icone
                        className={cn(
                          "w-4 h-4 mr-3",
                          isActive ? "text-white" : "text-slate-400",
                        )}
                      />
                      {rota.nome}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Botão de Logout rápido ficará no Header, mas mantemos o rodapé do Sidebar limpo */}
      <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
        v1.0.0 - HawkDev Corp
      </div>
    </aside>
  );
}
