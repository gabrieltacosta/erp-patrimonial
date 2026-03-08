import { FilialForm } from "./components/FilialForm"; // Ajuste o caminho do seu component
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export default async function NovaFilialPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) redirect("/login");

  // Bloqueio extra: Apenas SUPER_ADMIN e ADMIN_MATRIZ podem criar filiais
  if (
    session.user.role !== "SUPER_ADMIN" &&
    session.user.role !== "ADMIN_MATRIZ"
  ) {
    redirect("/filiais");
  }

  // Busca o nome da empresa para exibir no formulário
  const empresaContexto = await prisma.empresa.findUnique({
    where: { id: session.user.empresaId as string },
    select: { nome: true },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Nova Unidade
        </h2>
        <p className="text-slate-500">
          Expanda a operação registrando uma nova filial.
        </p>
      </div>

      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <FilialForm
          empresaId={session.user.empresaId as string}
          empresaNome={empresaContexto?.nome || "Empresa"}
        />
      </div>
    </div>
  );
}
