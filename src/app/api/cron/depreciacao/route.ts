import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Esta rota deve ser chamada todo o dia 1º de cada mês
export async function POST(request: Request) {
  // Segurança: garantir que apenas o nosso agendador consegue acionar esta rota
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Não autorizado', { status: 401 });
  }

  try {
    // 1. Procurar todas as depreciações de ativos que não foram baixados
    const depreciacoes = await prisma.depreciacao.findMany({
      include: {
        bem: {
          select: { valorAquisicao: true, valorResidual: true, status: true }
        }
      },
      where: {
        bem: { status: { not: "BAIXADO" } }
      }
    });

    let registosAtualizados = 0;

    // 2. Transação para processar tudo num único bloco seguro
    await prisma.$transaction(async (tx) => {
      for (const dep of depreciacoes) {
        const { bem } = dep;
        const valorMaximoDepreciavel = bem.valorAquisicao - bem.valorResidual;
        
        // Se o ativo já depreciou tudo o que podia, ignoramos
        if (dep.valorDepreciado >= valorMaximoDepreciavel) continue;

        // A taxaMensal vem como Decimal do Prisma. Convertemos para número e arredondamos para cêntimos.
        const taxaExata = Number(dep.taxaMensal);
        let depreciacaoDesteMes = Math.round(taxaExata);
        
        // Regra de "Plug" Contabilístico: 
        // No último mês, ajustamos os cêntimos residuais para fechar a conta ao milímetro
        if (dep.valorDepreciado + depreciacaoDesteMes > valorMaximoDepreciavel) {
           depreciacaoDesteMes = valorMaximoDepreciavel - dep.valorDepreciado;
        }

        // Atualizar o registo acumulado e a data de execução
        await tx.depreciacao.update({
          where: { id: dep.id },
          data: {
            valorDepreciado: dep.valorDepreciado + depreciacaoDesteMes,
            ultimaExecucao: new Date()
          }
        });

        registosAtualizados++;
      }
    });

    return NextResponse.json({ 
      success: true, 
      mensagem: `Depreciação processada com sucesso. Ativos atualizados: ${registosAtualizados}`
    });

  } catch (error) {
    console.error("Erro no motor de depreciação:", error);
    return NextResponse.json({ error: "Falha na execução contabílistica." }, { status: 500 });
  }
}