# Estokê

Controle de estoque e notas fiscais, dividido em dois projetos no mesmo
repositório: uma API REST em Node e um aplicativo mobile em React Native.

```
Estoke/
├── estoke-api/      API REST (Node + Express + PostgreSQL)
└── estoke-mobile/   App mobile (React Native + Expo)
```

---

## Tecnologias

### Backend (`estoke-api`)

| Tecnologia | Papel no projeto |
|---|---|
| **TypeScript 7** | Tipagem em todo o código. Config estrita: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| **Node + ESM** | `"type": "module"`, imports com extensão `.js` |
| **Express 5** | Servidor HTTP e roteamento |
| **PostgreSQL** via **`pg`** | Banco de dados. **SQL escrito à mão**, sem ORM |
| **Zod 4** | Valida a entrada e **gera os DTOs** com `z.infer` — não há classes de entidade |
| **tsyringe** | Injeção de dependência (`@injectable` / `@inject`) ligando casos de uso aos repositórios |
| **jsonwebtoken** | Emissão e validação do token JWT |
| **bcryptjs** | Hash da senha (custo 10) |
| **cors** | Libera o navegador a chamar a API (necessário para `npm run web` do app) |
| **dotenv** | Carrega o `.env` |
| **tsx** | Roda TypeScript direto em desenvolvimento (`pnpm dev`) |
| **pnpm** | Gerenciador de pacotes |

### Mobile (`estoke-mobile`)

| Tecnologia | Papel no projeto |
|---|---|
| **React Native 0.86** + **React 19** | Base do app |
| **Expo SDK 57** | Build, execução e acesso a APIs nativas |
| **expo-router 57** | Navegação por arquivos (abas + modais) |
| **expo-secure-store** | Guarda o token JWT com segurança no aparelho |
| **TypeScript** | Tipagem, incluindo os tipos de resposta da API |
| **@expo/vector-icons** | Ícones (Ionicons e MaterialCommunityIcons) |
| **react-native-web** | Permite rodar no navegador durante o desenvolvimento |

Sem biblioteca de estado global, sem cliente HTTP externo e sem UI kit — o app
usa `fetch`, Context API e `StyleSheet` nativo.

---

## Backend

### Arquitetura

Um módulo por domínio, sempre com os mesmos seis arquivos. Criar um módulo novo
é repetir o formato e registrar o repositório no container.

```
src/modules/<modulo>/
├── applications/
│   ├── schemas/        Zod valida a entrada e gera o DTO (z.infer)
│   └── useCases/       uma classe por operação, @injectable
├── domain/
│   └── repositories/   só a interface I<X>Repository
└── infra/
    ├── http/
    │   ├── controller/ Schema.parse() → container.resolve() → res.json()
    │   └── routes/     index.routes.ts (descoberto automaticamente)
    └── postgre/        SQL cru com pg.Pool
```

```
src/shared/
├── app.ts              monta o Express, varre src/ atrás de index.routes.ts
├── server.ts           ponto de entrada
├── config/auth.ts      segredo do JWT, expiração e custo do bcrypt
├── auth/token.ts       assina e valida o JWT
├── middlewares/        autenticação (obrigatória e opcional)
├── container/          registro das dependências do tsyringe
├── postgre/
│   ├── connection.ts   pool do PostgreSQL
│   └── log.ts          grava o log de alterações (compartilhado)
├── types/express.d.ts  adiciona req.usuario ao Request do Express
└── sql/                DDL das tabelas
```

### Caminho de uma requisição

```
rota → middleware de autenticação → controller → use case → repository → SQL
```

O `app.ts` percorre `src/` procurando arquivos `index.routes.ts` e registra cada
um automaticamente — não existe lista central de rotas. No fim da cadeia há um
tratador de erros: falha de validação do Zod vira **400** com a lista de campos;
o resto vira **500** em JSON, sem expor stack trace.

### Autenticação

Login por **e-mail e senha**. A senha nunca é guardada em texto puro — vai para
o banco como hash bcrypt, e nenhuma consulta devolve a coluna `SENHA` a não ser
a conferência do login.

O login devolve um JWT cujo `subject` é o id do usuário. O app manda esse token
em `Authorization: Bearer <token>` e o middleware resolve o usuário a partir
dele. Todas as rotas de estoque e de notas são protegidas; sem token válido a
resposta é **401**.

E-mail inexistente e senha errada devolvem **a mesma** mensagem e o mesmo
status, para não revelar quais e-mails existem.

### Log de movimentações

Toda escrita é registrada **coluna a coluna** na tabela de log do módulo, dentro
da mesma transação da operação (`BEGIN` / `COMMIT` / `ROLLBACK`):

| Operação | O que vai para o log |
|---|---|
| Criação | uma linha por coluna, com `VALOR_ANTERIOR` nulo |
| Edição | só as colunas que realmente mudaram |
| Exclusão | uma linha marcando `EXCLUIDO_EM` |

O valor gravado é o que o **banco** armazenou (vindo de `RETURNING`), não o que
chegou na requisição — então um valor arredondado por `NUMERIC(14,2)` aparece no
log já arredondado. Como a transação é única, um erro desfaz a operação e o log
junto, sem deixar registro órfão.

A exclusão é **lógica**: preenche `EXCLUIDO_EM` e some das listagens, mas o
histórico continua no banco.

### Endpoints

| Método | Rota | Protegida | O que faz |
|---|---|---|---|
| `POST` | `/usuarios/` | não* | Cadastra usuário |
| `POST` | `/usuarios/login` | não | Devolve o token |
| `GET` | `/usuarios/perfil` | sim | Dados do usuário do token |
| `GET` | `/estoque/` | sim | Lista produtos ativos |
| `POST` | `/estoque/` | sim | Entrada de produto |
| `PUT` | `/estoque/:idProduto` | sim | Edição parcial |
| `DELETE` | `/estoque/:idProduto` | sim | Exclusão lógica |
| `GET` | `/estoque/:idProduto/log` | sim | Histórico do produto |
| `GET` | `/notas-fiscais/` | sim | Lista notas (`?tipo=ENTRADA\|SAIDA`) |
| `POST` | `/notas-fiscais/` | sim | Cadastra nota |
| `PUT` | `/notas-fiscais/:idNotaFiscal` | sim | Edição parcial |
| `DELETE` | `/notas-fiscais/:idNotaFiscal` | sim | Exclusão lógica |
| `GET` | `/notas-fiscais/:idNotaFiscal/log` | sim | Histórico da nota |

\* O cadastro é público para permitir criar o primeiro usuário. Se vier um token
válido, o `CRIADO_POR` é preenchido com quem cadastrou.

---

## Mobile

### Estrutura

```
app/                    rotas (expo-router: o arquivo é a rota)
├── _layout.tsx         provider de autenticação; sem token manda para /login
├── login.tsx           entrar e criar conta na mesma tela
├── (tabs)/
│   ├── _layout.tsx     barra de abas
│   ├── index.tsx       Início — o painel
│   ├── estoque.tsx     lista de produtos com busca
│   ├── notas.tsx       lista de notas com filtro por tipo
│   └── mais.tsx        perfil e sair
├── produto.tsx         formulário de produto (modal), novo e edição
└── nota.tsx            formulário de nota fiscal (modal)

src/
├── api.ts              chamadas HTTP e tipos das respostas
├── auth.tsx            contexto de autenticação
├── storage.ts          token no SecureStore (localStorage no navegador)
├── useDados.ts         carrega estoque + notas e deriva os números do início
├── theme.ts            cores, espaçamentos e o limite de estoque baixo
├── format.ts           moeda, datas, saudação e iniciais
└── components/ui.tsx   Cartao, Secao, Botao, Campo, Topo, Etiqueta, Vazio
```

### Navegação

Quatro abas — **Início**, **Estoque**, **Notas** e **Mais** — e os dois
formulários abrem como modal. O `_layout.tsx` raiz observa o estado de
autenticação: sem perfil carregado, qualquer rota redireciona para o login.

Ao focar uma tela, os dados são recarregados (`useFocusEffect`), então o painel
já reflete o que acabou de ser cadastrado. Puxar para baixo também atualiza.

### De onde vêm os números do painel

Tudo é calculado no app a partir das duas listagens da API:

| Indicador | Cálculo |
|---|---|
| Produtos | total de itens ativos |
| +N este mês | itens com `criado_em` no mês corrente |
| Em estoque | soma de `quantidade × valor_produto` |
| Baixo qtde. | itens com quantidade ≤ `LIMITE_ESTOQUE_BAIXO` (`src/theme.ts`, hoje 5) |
| Notas fiscais | total, quantas no mês, e a divisão entre entradas e saídas |
| Atividades recentes | últimos produtos e notas ordenados por `criado_em` |

Os atalhos levam a: **Nova nota** → formulário de nota; **Entrada** → novo
produto; **Saída** → nota já com o tipo `SAIDA`; **Consultar** → aba Estoque.

---

## Banco de dados

Cinco tabelas: três de dados e duas de log. Tudo em PostgreSQL, com chaves
primárias `GENERATED ALWAYS AS IDENTITY` e autoria registrada por FK para
`USUARIOS`.

```
USUARIOS ──┬──< ESTOQUE ──────< ESTOQUE_LOG
           │        │                │
           ├────────┴────────────────┘      (CRIADO_POR / MODIFICADO_POR)
           │
           ├──< NOTA_FISCAL ──< NOTA_FISCAL_LOG
           │        │                │
           └────────┴────────────────┘
           │
           └──< USUARIOS (CRIADO_POR, auto-referência)
```

### `USUARIOS`

| Coluna | Tipo | Observação |
|---|---|---|
| `ID` | `INTEGER` identity | PK |
| `NOME` | `VARCHAR(100)` | |
| `SENHA` | `TEXT` | hash bcrypt, nunca texto puro |
| `USUARIO` | `VARCHAR(50)` | **único** |
| `EMAIL` | `VARCHAR(150)` | **único**, usado no login |
| `CRIADO_POR` | `INTEGER` | FK para `USUARIOS` — nulo no primeiro usuário |
| `CRIADO_EM` | `TIMESTAMP` | |

### `ESTOQUE`

| Coluna | Tipo | Observação |
|---|---|---|
| `ID` | `INTEGER` identity | PK |
| `DESCRICAO` | `VARCHAR(255)` | |
| `QUANTIDADE` | `INTEGER` | |
| `VALOR_PRODUTO` | `NUMERIC(14,2)` | valor unitário |
| `CRIADO_POR` | `INTEGER` | FK para `USUARIOS` |
| `CRIADO_EM` | `TIMESTAMP` | |
| `ALTERADO_EM` | `TIMESTAMP` | nulo até a primeira edição |
| `EXCLUIDO_EM` | `TIMESTAMP` | exclusão lógica; nulo = ativo |

### `NOTA_FISCAL`

| Coluna | Tipo | Observação |
|---|---|---|
| `ID` | `INTEGER` identity | PK |
| `NUMERO` | `VARCHAR(50)` | |
| `SERIE` | `VARCHAR(10)` | |
| `TIPO` | `VARCHAR(10)` | `CHECK` aceita só `ENTRADA` ou `SAIDA` |
| `FORNECEDOR` | `VARCHAR(255)` | |
| `CNPJ` | `VARCHAR(14)` | só dígitos |
| `VALOR_TOTAL` | `NUMERIC(14,2)` | |
| `DATA_EMISSAO` | `DATE` | |
| `CRIADO_POR` | `INTEGER` | FK para `USUARIOS` |
| `CRIADO_EM` / `ALTERADO_EM` / `EXCLUIDO_EM` | `TIMESTAMP` | |

Há um **índice único parcial** em `(NUMERO, SERIE, CNPJ) WHERE EXCLUIDO_EM IS
NULL`: impede duas notas ativas iguais do mesmo emitente, mas permite
recadastrar a mesma nota depois de uma exclusão.

### `ESTOQUE_LOG` e `NOTA_FISCAL_LOG`

Mesmo formato nas duas, mudando só a FK (`ESTOQUE_ID` / `NOTA_FISCAL_ID`):

| Coluna | Tipo | Observação |
|---|---|---|
| `ID` | `INTEGER` identity | PK |
| `ESTOQUE_ID` / `NOTA_FISCAL_ID` | `INTEGER` | FK para o registro alterado |
| `COLUNA` | `VARCHAR(100)` | qual campo mudou |
| `VALOR_ANTERIOR` | `TEXT` | nulo na criação |
| `VALOR_NOVO` | `TEXT` | |
| `MODIFICADO_POR` | `INTEGER` | FK para `USUARIOS` |
| `MODIFICADO_EM` | `TIMESTAMP` | |

O DDL está em `estoke-api/src/sql/`: `notas_fiscais.sql` cria as tabelas de nota
e `estoque.sql` acrescenta à `ESTOQUE` as colunas de valor, alteração e
exclusão. `USUARIOS`, `ESTOQUE` e `ESTOQUE_LOG` já existiam no banco.

---

## Como rodar

### API

```bash
cd estoke-api
pnpm install
```

Copie `.env.example` para `.env` e preencha:

```
SERVER_PORT=8085
SUPABASE_DB_HOST=db.<project-ref>.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=...
JWT_SECRET=<segredo longo e aleatório>
JWT_EXPIRES_IN=1d
```

Gerando um segredo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

A API não sobe sem `JWT_SECRET` (exige 16+ caracteres) nem sem as variáveis do
banco. Antes do primeiro uso, rode os arquivos de `src/sql/` no banco. Depois:

```bash
pnpm dev
```

### Mobile

```bash
cd estoke-mobile
npm install
npm start
```

O endereço da API fica em `.env` (copie de `.env.example`):

```
EXPO_PUBLIC_API_URL=http://localhost:8085
```

`localhost` só funciona no navegador (`npm run web`). **Em celular físico troque
pelo IP da sua máquina na rede** (ex.: `http://192.168.0.12:8085`) — no aparelho,
`localhost` é o próprio aparelho. No emulador Android o host da máquina é
`10.0.2.2`. Descubra o IP com `ipconfig`.

---

## Pontos em aberto

- **`typeorm` está no `package.json` da API mas não é usado** em lugar nenhum —
  todo o acesso a dados é SQL cru com `pg`. Pode ser removido.
- **Não há logout de verdade**: o token simplesmente expira em `JWT_EXPIRES_IN`.
  Invalidar antes disso exigiria uma tabela de sessões ou uma blacklist.
- **`USUARIOS` não tem tabela de log** — o cadastro de usuário só guarda
  `CRIADO_POR` e `CRIADO_EM`. Criar `USUARIOS_LOG` no mesmo formato faria o
  módulo passar a usar o helper compartilhado.
- **Nota fiscal não movimenta estoque.** São dois cadastros independentes; dar
  entrada ou baixa continua sendo feito pelo módulo de estoque.
- **O `cors()` está aberto para qualquer origem.** Em produção vale restringir
  com `cors({ origin: ... })`.

