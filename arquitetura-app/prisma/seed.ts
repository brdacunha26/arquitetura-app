import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@exemplo.com' },
    update: {},
    create: {
      email: 'admin@exemplo.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log({ admin });

  // Criar alguns projetos de exemplo
  const project1 = await prisma.project.create({
    data: {
      title: 'Residência Moderna',
      description: 'Projeto de casa moderna com conceito aberto',
      clientName: 'João Silva',
      status: 'IN_PROGRESS',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
      budget: 150000,
      userId: admin.id,
      tasks: {
        create: [
          {
            title: 'Desenvolvimento do conceito',
            description: 'Criar conceito inicial do projeto',
            status: 'COMPLETED',
            startDate: new Date(),
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            userId: admin.id,
          },
          {
            title: 'Plantas baixas',
            description: 'Desenvolver plantas baixas detalhadas',
            status: 'IN_PROGRESS',
            startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            userId: admin.id,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 50000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
          },
        ],
      },
    },
  });

  console.log({ project1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 