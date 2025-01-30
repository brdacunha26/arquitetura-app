# Projeto de Arquitetura de Aplicação

## Configuração Inicial

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Conta no Supabase
- Conta no Vercel

### Instalação

1. Clonar o repositório
```bash
git clone https://github.seu-usuario/seu-projeto.git
cd seu-projeto
```

2. Instalar dependências
```bash
npm install
```

3. Configurar variáveis de ambiente
- Copie `.env.local.example` para `.env.local`
- Preencha com suas credenciais do Supabase

### Desenvolvimento Local
```bash
npm run dev
```

### Deploy no Vercel
1. Instale o Vercel CLI
```bash
npm i -g vercel
```

2. Faça login no Vercel
```bash
vercel login
```

3. Inicialize o projeto
```bash
vercel
```

## Configurações Importantes
- Supabase: Configure suas credenciais no Vercel
- Vercel: Habilite integração com seu repositório Git

## Tecnologias Utilizadas
- Next.js
- Supabase
- Prisma
- Material-UI 