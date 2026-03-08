import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BemForm } from "./components/BemForm";
import prisma from "@/lib/db";

export default async function NovoBemPage() {
  // Busca as filiais para popular o select do formulário
  const filiais = await prisma.filial.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cadastrar Novo Bem</h2>
        <p className="text-slate-500">Registre um novo ativo patrimonial no sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <BemForm filiais={filiais} />
        </CardContent>
      </Card>
    </div>
  );
}