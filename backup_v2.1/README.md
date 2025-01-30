# Sistema de Gestão de Projetos Arquitetônicos - v2.1

## Principais Atualizações

### Etapas do Projeto
- Adicionado campo de responsável nas etapas do projeto
- Integração com o TeamContext para seleção de membros responsáveis
- Visualização do membro responsável em cada etapa com chip colorido
- Melhorias na interface de criação e edição de etapas

### Membros da Equipe
- Atualização do TeamContext com novos campos e tipos
- Melhoria na exibição dos membros e seus status
- Integração com projetos e etapas

### Contextos
- Atualização do ProjectStepsContext para incluir membro responsável
- Melhorias no TeamContext para melhor integração com outras funcionalidades
- Dados iniciais de exemplo atualizados

## Estrutura do Projeto
- `/src/app`: Páginas da aplicação
  - `/login`: Página de login
  - `/projects`: Listagem e detalhes de projetos
  - `/tasks`: Gerenciamento de tarefas
  - `/team`: Gerenciamento de equipe
- `/src/components`: Componentes React reutilizáveis
- `/src/contexts`: Contextos e provedores de estado
- `/src/hooks`: Hooks personalizados
- `/src/providers`: Provedores de contexto
- `/src/theme`: Configurações de tema
- `/src/types`: Tipos TypeScript
- `/src/utils`: Funções utilitárias

## Arquivos de Configuração
- `package.json`: Dependências e scripts
- `next.config.js`: Configuração do Next.js
- `tsconfig.json`: Configuração do TypeScript

## Tecnologias
- Next.js
- React
- Material-UI
- TypeScript
- Context API 