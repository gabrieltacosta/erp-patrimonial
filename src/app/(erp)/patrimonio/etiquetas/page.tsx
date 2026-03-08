import prisma from "@/lib/db";
import { GeradorEtiquetasClient } from "./components/GeradorEtiquetasClient";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTenantFilter } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GerarEtiquetasPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/login");

  const user = session.user;

  const filtroSeguranca = getTenantFilter(user);
  // Busca bens ativos que precisam de etiquetas
  const bens = await prisma.bem.findMany({
    where: { ...filtroSeguranca, status: "ATIVO" },
    select: { id: true, numeroPatrimonio: true, nome: true },
    orderBy: { numeroPatrimonio: "asc" },
    take: 100, // Limite para evitar travar o navegador na renderização
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Gerar Etiquetas Patrimoniais
        </h2>
        <p className="text-slate-500">
          Visualize e exporte as etiquetas para impressão física.
        </p>
      </div>
      {bens.length > 0 &&
      <GeradorEtiquetasClient bens={bens} />
      }
    </div>
  );
}
