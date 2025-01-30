import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'admin123', // Em produção, usar hash
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  // Criar cliente exemplo
  const client = await prisma.client.create({
    data: {
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '(11) 99999-9999',
      type: 'PESSOA_FISICA',
      cpf: '123.456.789-00',
    },
  });

  // Criar projeto exemplo
  const project = await prisma.project.create({
    data: {
      title: 'Residencial Vila Nova',
      description: 'Projeto residencial com 3 quartos e área de lazer',
      clientId: client.id,
      budget: 850000,
      status: 'IN_PROGRESS',
      paymentMethod: 'pix',
      installments: 1,
      deadline: new Date('2024-12-31'),
    },
  });

  // Criar membro da equipe exemplo
  const teamMember = await prisma.teamMember.create({
    data: {
      name: 'Ana Silva',
      email: 'ana@example.com',
      role: 'ARCHITECT',
      phone: '(11) 98888-8888',
      projects: {
        connect: { id: project.id },
      },
    },
  });

  // Criar tarefa exemplo
  await prisma.task.create({
    data: {
      title: 'Briefing Inicial',
      description: 'Reunião com cliente para levantamento de requisitos',
      status: 'COMPLETED',
      date: new Date(),
      deadline: new Date('2024-03-15'),
      projectId: project.id,
      assignedTo: teamMember.id,
      priority: 'HIGH',
      completedAt: new Date(),
    },
  });

  console.log('Dados de exemplo criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 