import prisma from '@/lib/db';


async function main() {
  const empresa = await prisma.empresa.create({
    data: { nome: 'Corporação Alpha', cnpj: '00.000.000/0001-00' }
  });

  await prisma.filial.create({
    data: { nome: 'Matriz São Paulo', empresaId: empresa.id, isMatriz: true }
  });

  await Promise.all([
    prisma.filial.create({ data: { nome: 'Filial RJ', empresaId: empresa.id } }),
    prisma.filial.create({ data: { nome: 'Filial MG', empresaId: empresa.id } }),
    prisma.filial.create({ data: { nome: 'Filial PR', empresaId: empresa.id } }),
    prisma.filial.create({ data: { nome: 'Filial SC', empresaId: empresa.id } }),
  ]);

  console.log('Seed executado com sucesso!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());