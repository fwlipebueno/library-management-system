**Português** · [English](README.en.md)

# Sistema Web de Gerenciamento de Biblioteca

**Integrante:** Felipe de Almeida Bueno  
Programação Web Back-End — UTFPR, 2026-2 — Projeto 2.

Aplicação para consultar o acervo e administrar usuários, livros, empréstimos e devoluções. O administrador gerencia os cadastros e a circulação dos exemplares. O usuário comum consulta livros e o próprio histórico. Ambos podem pesquisar por título e autor, consultar detalhes e encerrar a sessão.

## Vídeo de apresentação

[![Assista à apresentação do projeto](https://img.youtube.com/vi/XWJFRvbjuGs/hqdefault.jpg)](https://www.youtube.com/watch?v=XWJFRvbjuGs)

[Assistir ao vídeo no YouTube](https://www.youtube.com/watch?v=XWJFRvbjuGs)

## Tecnologias e estrutura

Node.js 22.12 ou superior, PostgreSQL, Express 5.3, Sequelize 6.37, React 19.3, React Router 7.18 e Vite 8.3. A API também usa pg, jsonwebtoken, bcryptjs, cors, dotenv e swagger-ui-express. As versões exatas estão nos arquivos `package-lock.json`.

- `backend/`: configuração, modelos, serviços, controllers, middlewares, rotas e `openapi.json`.
- `frontend/`: páginas React, componentes reutilizáveis, consumo da API e CSS próprio.
- `README.md`: instalação, decisões e testes.

## Instalação e execução

Requer Node.js com npm, PostgreSQL em execução e navegador desktop. Os comandos usam PowerShell a partir da pasta do projeto.

1. No pgAdmin, conectado ao banco `postgres`, crie o banco:

   ```sql
   CREATE DATABASE web2_projeto2_biblioteca;
   ```

2. Instale o back-end e copie a configuração:

   ```powershell
   cd backend
   npm ci
   Copy-Item .env.example .env
   ```

   Edite `.env` com a conexão do PostgreSQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`. Configure `JWT_SECRET` com um segredo aleatório de pelo menos 32 caracteres. Para gerar um:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   `PORT` usa `8081`; `FRONTEND_ORIGIN` usa `http://localhost:5173`. Mantenha o segredo somente no ambiente do back-end.

3. Prepare os dados e inicie a API:

   ```powershell
   npm run setup
   npm start
   ```

   O setup cria as tabelas e insere as contas e livros iniciais ausentes. Pode ser repetido sem apagar dados ou redefinir senhas.

4. Em outro terminal, a partir da raiz, prepare o front-end:

   ```powershell
   cd frontend
   npm ci
   Copy-Item .env.example .env
   npm run dev
   ```

   `VITE_API_URL` usa `http://localhost:8081`. Se alterar a porta da API, ajuste essa variável e reinicie o Vite. O Vite usa a porta `5173`; ela deve estar livre. Se mudar a origem do front-end, atualize também `FRONTEND_ORIGIN` na API.

| Serviço | Endereço local |
| --- | --- |
| Interface | http://localhost:5173 |
| API | http://localhost:8081 |
| Swagger | http://localhost:8081/api-docs |

Para compilar a interface, execute `npm run build` em `frontend/`.

## Dados iniciais

As credenciais abaixo são fictícias e destinadas à demonstração:

| Perfil | Email | Senha |
| --- | --- | --- |
| Administrador | admin@biblioteca.test | Admin123! |
| Usuário comum (Ana Souza) | usuario@biblioteca.test | Usuario123! |

O acervo começa com Dom Casmurro (1 exemplar), O Cortiço (2), Capitães da Areia (1) e Entendendo Algoritmos (0), sem empréstimos registrados.

## Decisões

- **Persistência:** PostgreSQL e Sequelize, estudados na disciplina, representam os vínculos entre usuários, livros e empréstimos e mantêm os dados após reiniciar a API.
- **Senhas:** bcryptjs gera e compara hashes com custo 12, sem exigir módulo nativo compilado. A validação limita a senha a 72 bytes UTF-8 para evitar truncamento. Nenhuma resposta contém o hash.
- **Autenticação:** JWT HS256 com validade de 1 hora, enviado em `Authorization: Bearer TOKEN`. Em cada requisição protegida, a API consulta a ativação e o perfil atual da conta no banco. CORS autoriza a origem configurada e não substitui essas verificações.
- **Sessão:** `sessionStorage` mantém token e dados do usuário na sessão da aba, reduzindo a persistência. Continua acessível ao JavaScript e exposto a XSS. Logout limpa a sessão local; não há blacklist, renovação ou revogação global. Um token copiado permanece válido até expirar, desde que a conta continue ativa. Respostas 401 pedem novo login.
- **Livros:** a exclusão lógica (`ativo=false`) preserva o histórico e retira o livro do catálogo. Empréstimos ativos impedem a exclusão. O ISBN continua reservado. Alterar o total preserva os exemplares emprestados; a disponibilidade é calculada pelo servidor.
- **Concorrência:** empréstimo e disponibilidade são atualizados na mesma transação, com bloqueio `FOR UPDATE` na linha do livro antes da consulta de estoque. Na disputa pelo último exemplar, uma requisição conclui e a outra recebe 409. A devolução bloqueia empréstimo e livro; edição de quantidade e exclusão também bloqueiam o livro. Uma falha desfaz a transação inteira.
- **Datas:** empréstimo e devolução usam o instante do servidor. A previsão é uma data válida `AAAA-MM-DD`, sem horário; datas passadas são aceitas.

## Testes

Use um banco separado para testes e execute `npm run setup`. No Swagger ou Postman, faça login e use o token em **Authorize** ou no cabeçalho Bearer.

1. Teste login nos dois perfis, credenciais incorretas (401), token ausente/inválido/expirado (401) e operação administrativa como usuário comum (403).
2. Cadastre, pesquise, detalhe, edite e exclua livros. Confira dados inválidos (400), ISBN duplicado (409), recurso inexistente (404) e exclusão sem corpo (204).
3. Cadastre e edite usuários, altere a senha e desative uma conta. Confirme que ela perde o acesso, inclusive com token já emitido, e que nenhuma resposta expõe hashes.
4. Empreste um livro com um exemplar: a disponibilidade deve cair para zero; a segunda tentativa deve retornar 409. Devolva, confira a disponibilidade e registre outro empréstimo. Devolução duplicada deve retornar 409.
5. Com empréstimo ativo, tente excluir o livro ou reduzir o total abaixo da quantidade emprestada: ambos devem retornar 409. Após a devolução e a exclusão, o histórico deve permanecer.
6. Compare `/emprestimos` e `/emprestimos/meus`: administrador consulta todos; na segunda rota, cada perfil vê somente os próprios, mesmo enviando outro `usuarioId` na query.
7. Dispare simultaneamente dois pedidos de empréstimo do último exemplar para usuários distintos. Espere um 201 e um 409, com disponibilidade zero. Duas devoluções simultâneas do mesmo empréstimo devem produzir um 200 e um 409, devolvendo apenas um exemplar ao estoque.
8. Na interface, percorra todas as telas nos dois perfis e confira pesquisa vazia, mensagens de erro/sucesso, acesso administrativo negado, logout e falha de rede com a API desligada. Execute também `npm run build` no front-end.

## Limitações e escopo

Execução local em navegador desktop. O setup atende instalações novas e não faz migrações de esquema. A expiração e o logout seguem o comportamento descrito acima.

Não foram implementados os opcionais: paginação, filtros avançados, indicadores de atraso e melhorias adicionais de responsividade/acessibilidade. A pesquisa obrigatória por título e autor está disponível.
