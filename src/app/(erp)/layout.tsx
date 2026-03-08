import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ERPLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Busca a sessão do Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  // 2. A BARREIRA DE SEGURANÇA (Verifica se o utilizador está ATIVO)
  // Fazemos uma query apenas com o campo `ativo` para ser ultraleve e rápida
  const checkUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ativo: true },
  });

  // Se o utilizador não existir no banco ou estiver inativo, expulsa-o!
  if (!checkUser || !checkUser.ativo) {
    // Redireciona para o login com um parâmetro de erro na URL
    redirect("/login?error=account_suspended");
  }

  // 3. Busca a Filial e a Empresa (Hierarquia)
  let filialNome = "Filial Não Atribuída";
  let empresaNome = "Empresa Não Atribuída";

  if (session.user.filialId) {
    const filialContexto = await prisma.filial.findUnique({
      where: { id: session.user.filialId },
      include: { empresa: true },
    });

    if (filialContexto) {
      filialNome = filialContexto.nome;
      empresaNome = filialContexto.empresa.nome;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role={session.user.role as string} empresaNome={empresaNome} />

      <div className="flex-1 flex flex-col ml-64">
        <Header
          userName={session.user.name as string}
          filialNome={filialNome}
          role={session.user.role}
        />
        <main className="flex-1 p-8 mt-16 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
