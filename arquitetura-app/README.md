# Sistema de Gestão para Escritório de Arquitetura

Sistema completo para gestão de projetos arquitetônicos e design de interiores, desenvolvido com tecnologias modernas e foco em usabilidade.

## Funcionalidades Principais

- **Gestão de Projetos**
  - Planejamento inicial e briefing
  - Acompanhamento de etapas
  - Controle de prazos
  - Gestão de documentos

- **Gestão Financeira**
  - Controle de pagamentos
  - Acompanhamento de orçamentos
  - Alertas de vencimentos

- **Gestão de Equipe**
  - Atribuição de tarefas
  - Controle de acesso por perfil
  - Calendário de atividades

- **Comunicação**
  - Registro de interações com clientes
  - Compartilhamento de documentos
  - Histórico de alterações

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Material UI
- Prisma (ORM)
- PostgreSQL
- NextAuth.js

## Requisitos

- Node.js 18+
- PostgreSQL
- npm ou yarn

## Configuração do Ambiente

1. Clone o repositório
```bash
git clone [url-do-repositorio]
cd arquitetura-app
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações

4. Configure o banco de dados
```bash
npm run db:migrate
npm run db:seed
```

5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## Acesso ao Sistema

Após executar o seed do banco de dados, você pode acessar o sistema com as seguintes credenciais:

- **Administrador**
  - Email: admin@exemplo.com
  - Senha: admin123

## Estrutura do Projeto

```
arquitetura-app/
├── src/
│   ├── app/              # Páginas da aplicação
│   ├── components/       # Componentes reutilizáveis
│   ├── providers/        # Provedores de contexto
│   └── theme/           # Configuração do tema
├── prisma/
│   ├── schema.prisma    # Schema do banco de dados
│   └── seed.ts         # Script de seed
└── public/             # Arquivos estáticos
```

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Suporte

Para suporte, envie um email para [seu-email@exemplo.com]

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 